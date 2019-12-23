using BreathRateRecognition.Model;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BreathRateRecognition.Server.Hubs
{
    public interface IMeasurementDistributionHub
    {
        Task SendMeasurement(Metric metric);
    }

    public class MeasurementDistributionHub:Hub, IMeasurementDistributionHub
    {
        public async Task SendMeasurement(Metric metric)
        {
            await Clients?.All?.SendAsync("measurement", metric);
        }
    }
}
