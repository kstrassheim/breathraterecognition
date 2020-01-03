using BreathRateRecognition.Model;
using BreathRateRecognition.Server;
using BreathRateRecognition.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Server.Measurement
{
    public class MeasurementHostedService : IHostedService, IDisposable
    {
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

        public void Dispose()
        {
            this.Tasks = null;
            this.CancelTokenSources = null;
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
                                            int val = 0;
                                            var line = p.ReadLine()?.Split(',');
                                            if (line != null && line.Length > 0)
                                            {
                                                for (var i = 0; i < line.Length; i++)
                                                {
                                                    if (int.TryParse(line?[i], out val) && val != 0)
                                                    {
                                                        this.HubContext.Clients.All.SendAsync("measurement", new Metric()
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
