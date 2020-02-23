using BreathRateRecognition.Model;
using BreathRateRecognition.Server;
using BreathRateRecognition.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Server.Measurement
{
    public class MeasurementHostedService : IHostedService, IDisposable
    {
        int bufferSize = 10;
        string[] serverUrls = new string[] { "https://breathrate.azurewebsites.net/" }; 

        public MeasurementHostedService(IHubContext<MeasurementDistributionHub> hubContext)
        {
            HubContext = hubContext;
        }

        private readonly string AppName = System.Environment.MachineName;
        public IHubContext<MeasurementDistributionHub> HubContext;

        private Task mainTask = null;
        private CancellationTokenSource mainTaskCancel = new CancellationTokenSource();
        private Dictionary<string, Task> Tasks = new Dictionary<string,Task>();
        private Dictionary<string, CancellationTokenSource> CancelTokenSources = new Dictionary<string, CancellationTokenSource>();

        private List<SerialPort> ports = new List<SerialPort>();
        private Dictionary<string, List<Metric>> buffer = new Dictionary<string, List<Metric>>();

        public void Dispose()
        {
            this.Tasks = null;
            this.CancelTokenSources = null;
        }

        public async Task SendSignalToServer(string server, IEnumerable<Metric> m)
        {
            try
            {
                var request = WebRequest.Create($"{server}api/BreathRateRecognition");
                request.Method = "POST";
                request.ContentType = "application/json";
                var json = Newtonsoft.Json.JsonConvert.SerializeObject(m);
                byte[] byteArray = Encoding.UTF8.GetBytes(json);
                request.ContentLength = byteArray.Length;
                // Get the request stream.
                Stream dataStream = request.GetRequestStream();
                // Write the data to the request stream.
                await dataStream.WriteAsync(byteArray, 0, byteArray.Length);
                WebResponse response = request.GetResponse();
                response.Close();
                dataStream.Close();
            }
            catch
            {

            }
        }

        public async Task SendSignalToServers(IEnumerable<Metric> m)
        {
            foreach(var s in serverUrls)
            {
                await this.SendSignalToServer(s, m);
            }
        }

        public async void PushMetric(Metric m)
        {
            // send port wise
            if (!this.buffer.ContainsKey(m.Port))
            {
                this.buffer[m.Port] = new List<Metric>();
            }

            this.buffer[m.Port].Add(m);

            if (this.buffer[m.Port].Count >= this.bufferSize)
            {
                var h = this.HubContext.Clients.All.SendAsync("measurement", this.buffer[m.Port]);
                var r = this.SendSignalToServers(this.buffer[m.Port]);
                //await h;
                await r;
                lock(this.buffer[m.Port])
                {
                    this.buffer[m.Port].Clear();
                }
            }
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            this.mainTask = new Task(() =>
            {
                while (true)
                {
                    lock (this.ports)
                    {
                        lock(this.Tasks)
                        {
                            var pns = SerialPort.GetPortNames();

                            foreach (var n in pns)
                            {
                                var p = this.ports.FirstOrDefault(sp => sp.PortName == n);
                                if (p == null)
                                {
                                    p = new SerialPort(n, 115200);
                                }

                                this.ports.Add(p);

                                if (!this.Tasks.ContainsKey(n) || this.Tasks[n].Status != TaskStatus.Running)
                                {
                                    if (!this.CancelTokenSources.ContainsKey(n))
                                    {
                                        this.CancelTokenSources.Add(n, new CancellationTokenSource());
                                    }
                                    else
                                    {
                                        this.CancelTokenSources[n] = new CancellationTokenSource();
                                    }
                                    
                                    var t = new Task((a) => {
                                        if (!p.IsOpen)
                                        {
                                            p.Open();
                                        }

                                        if (p.IsOpen)
                                        {
                                            Console.WriteLine($"Opened Port:{p.PortName}");
                                        }

                                        while (p.IsOpen)
                                        {
                                            try
                                            {
                                                int val = 0;
                                                var line = p.ReadLine()?.TrimStart('[').TrimEnd(']').Split(',');
                                                if (line != null && line.Length > 0)
                                                {
                                                    for (var i = 0; i < line.Length; i++)
                                                    {
                                                        if (int.TryParse(line[i].TrimStart('[').TrimEnd(']'), out val) && val != 0)
                                                        {
                                                            this.PushMetric(new Metric()
                                                            {
                                                                Name = AppName,
                                                                Port = $"{p.PortName}_{i}",
                                                                Value = val,
                                                                Timestamp = DateTime.Now
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                            catch { }
                                           
                                        }
                                    }, this.CancelTokenSources[n]);

                                    if (this.Tasks.ContainsKey(n))
                                    {
                                        this.Tasks[n] = t;
                                    }
                                    else
                                    {
                                        this.Tasks.Add(n, t);
                                    }
                                    
                                    t.Start();
                                }
                            }
                        }
                    }

                    Task.Delay(5000).Wait();
                }
            }, this.mainTaskCancel.Token);

            this.mainTask.Start();
            
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return new Task(() =>
            {
                this.mainTaskCancel.Cancel();
                this.CancelTokenSources.Values.ToList().ForEach(ct => ct.Cancel());
            });
        }
    }
}
