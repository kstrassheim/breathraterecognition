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

        private const string AppName = "Server";
        public IHubContext<MeasurementDistributionHub> HubContext;
       
        private List<Task> Tasks = null;
        private List<CancellationTokenSource> CancelTokenSources = new List<CancellationTokenSource>();

        public void Dispose()
        {
            this.Tasks = null;
            this.CancelTokenSources = null;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            this.Tasks = SerialPort.GetPortNames()?.ToList().ConvertAll<Action>(port => () =>
            {

                var sp = new SerialPort(port, 115200);
                sp.Open();
                while (true)
                {
                    int val = 0;
                    var line = sp.ReadLine()?.Split(',');
                    if (line != null && line.Length > 3 && int.TryParse(line?[4], out val))
                    {
                        Console.WriteLine(val);
                        var m = new Metric()
                        {
                            Name = AppName,
                            Port = port,
                            Value = val
                        };

                        this.HubContext.Clients.All.SendAsync("measurement", m);
                    }
                    //else
                    //{
                    //    // exit task if there are unparseable values
                    //    break;
                    //}
                }
            }).ConvertAll<Task>(a =>
            {
                var cancellationTokenSource = new CancellationTokenSource();
                this.CancelTokenSources.Add(cancellationTokenSource);
                return new Task(a, cancellationTokenSource.Token);
            });

            // select all running ports
            this.Tasks?.ForEach(t => t.Start());
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return new Task(() => this.CancelTokenSources.ForEach(ct => ct.Cancel()));
        }
    }
}
