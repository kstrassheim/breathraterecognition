using BreathRateRecognition.Model;
using BreathRateRecognition.Server;
using BreathRateRecognition.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
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
        int signalMeasureDelayMs = 0;
        int baudRate = 115200;
        string splitChar = ";";
        Task send = null;
        string[] filterSerialPorts = new string[] { };
        string[] filterSensorPorts = new string[] { };
        string[] additionalMeasureDistributionUrls = new string[] { };
        IConfiguration config;

        public MeasurementHostedService(IHubContext<MeasurementDistributionHub> hubContext, IConfiguration configuration)
        {
            HubContext = hubContext;
            this.config = configuration;


            try
            {
                this.baudRate = config.GetValue<int>("BaudRate");
                Console.WriteLine($"Using Setting Baud Rate of:{this.baudRate}");
            }
            catch
            {
                Console.WriteLine($"Failed to get Setting Baud Rate using default value:{baudRate}");
            }

            try
            {
                this.splitChar = config.GetValue<string>("SplitChar");
                Console.WriteLine($"Using Setting SplitChar of:{this.splitChar}");
            }
            catch
            {
                Console.WriteLine($"Failed to get Setting SplitChar using default value:{this.splitChar}");
            }


            try
            {
                string val = config.GetValue<string>("AdditionalMeasureDistributionUrls");
                this.additionalMeasureDistributionUrls = val?.Split(';').Select(o => o.Trim())?.ToArray();
                Console.WriteLine($"Sending to following additional distribution server urls: {val}");
            }
            catch
            {
                Console.WriteLine($"No additional distribution server urls found");
            }

            try
            {
                string val = config.GetValue<string>("FilterSerialPorts");
                this.filterSerialPorts = !string.IsNullOrEmpty(val) ? val?.Split(';').Select(o => o.Trim())?.ToArray() : null;
                Console.WriteLine($"Filtering serial ports: {val}");
            }
            catch
            {
                Console.WriteLine($"No filter serial ports found");
            }

            try
            {
                string val = config.GetValue<string>("FilterSensorPorts");
                this.filterSensorPorts = !string.IsNullOrEmpty(val) ? val?.Split(';').Select(o => o.Trim())?.ToArray() : null;
                Console.WriteLine($"Filtering sensor ports: {val}");
            }
            catch
            {
                Console.WriteLine($"No filter sensor ports found");
            }

            try
            {
                this.signalMeasureDelayMs = config.GetValue<int>("SignalMeasureDelayMs");
                Console.WriteLine($"Using Setting SignalMeasureDelayMs of:{this.signalMeasureDelayMs}");
            }
            catch
            {
                Console.WriteLine($"Failed to get Setting Baud Rate using default value:{baudRate}");
            }

        }

        private readonly string AppName = System.Environment.MachineName;
        public IHubContext<MeasurementDistributionHub> HubContext;

        private Task mainTask = null;
        private CancellationTokenSource mainTaskCancel = new CancellationTokenSource();
        private Dictionary<string, Task> Tasks = new Dictionary<string,Task>();
        private Dictionary<string, CancellationTokenSource> CancelTokenSources = new Dictionary<string, CancellationTokenSource>();

        private List<SerialPort> ports = new List<SerialPort>();
        private List<Metric> httpBuffer = new List<Metric>();
        private Dictionary<string, List<Metric>> buffer = new Dictionary<string, List<Metric>>();

        public void Dispose()
        {
            this.Tasks = null;
            this.CancelTokenSources = null;
        }

        public void SendSignalToServer(string server, IEnumerable<Metric> m)
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
                dataStream.Write(byteArray, 0, byteArray.Length);
                var response = request.GetResponse();
                response.Close();
                dataStream.Close();
            }
            catch
            {

            }
        }

        public void PushMetric(Metric m)
        {
            this.HubContext.Clients.All.SendAsync("measurement", m);
            if (this.additionalMeasureDistributionUrls != null && this.additionalMeasureDistributionUrls.Length > 0)
            {
                lock(this.httpBuffer)
                {
                    this.httpBuffer.Add(m);
                }

                //lock (this.buffer)
                //{
                    
                //    // HTTP send port wise
                //    if (!this.buffer.ContainsKey(m.Port))
                //    {
                //        this.buffer.Add(m.Port, new List<Metric>());
                //    }

                //    lock (this.buffer[m.Port])
                //    {
                //        this.buffer[m.Port].Add(m);
                //    }
                //}
    
                    if (this.send == null || this.send.IsCompleted)
                    {

                        if (this.send != null)
                        {
                            this.send.Dispose();
                        }

                        this.send = new Task(() =>
                        {
                            Metric[] pop = null;

                            lock (this.httpBuffer)
                            {
                                pop = new Metric[this.httpBuffer.Count];
                                this.httpBuffer.CopyTo(pop);
                                this.httpBuffer.Clear();
                            }

                            foreach (var amu in this.additionalMeasureDistributionUrls)
                            {
                                this.SendSignalToServer(amu, pop);
                            }

                            //foreach (var amu in this.additionalMeasureDistributionUrls)
                            //{
                            //    this.SendSignalToServer(amu, pop);
                            //}
                        });

                        this.send.Start();
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
                            if (this.filterSerialPorts != null && this.filterSerialPorts.Length > 0)
                            {
                                pns = pns.Where(o => this.filterSerialPorts.Contains(o))?.ToArray();
                            }
                            foreach (var n in pns)
                            {
                                var p = this.ports.FirstOrDefault(sp => sp.PortName == n);
                                if (p == null)
                                {
                                    p = new SerialPort(n, this.baudRate);
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
                                                
                                                var line = p.ReadLine()?.TrimStart('[').TrimEnd(']').Split(this.splitChar);
                                                var now = DateTime.Now;
                                                if (line != null && line.Length > 0)
                                                {
                                                    for (var i = 0; i < line.Length; i++)
                                                    {
                                                        var portName = $"{p.PortName}_{i}";
                                                        if (this.filterSensorPorts != null && this.filterSensorPorts.Length > 0 && !this.filterSensorPorts.Contains(portName))
                                                        {
                                                            return;
                                                        }

                                                        int val = 0;
                                                        if (int.TryParse(line[i].TrimStart('[').TrimEnd(']'), out val) && val != 0)
                                                        {
                                                            this.PushMetric(new Metric()
                                                            {
                                                                Name = AppName,
                                                                Port = portName,
                                                                Value = val,
                                                                Timestamp = now
                                                            });
                                                        }
                                                    }
                                                }

                                                if (this.signalMeasureDelayMs > 0)
                                                {

                                                    Thread.Sleep(this.signalMeasureDelayMs);
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
