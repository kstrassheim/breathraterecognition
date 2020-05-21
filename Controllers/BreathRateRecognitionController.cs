using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BreathRateRecognition.Model;
using BreathRateRecognition.Server.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace BreathRateRecognition.Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class BreathRateRecognitionController : ControllerBase
    {
        IHubContext<MeasurementDistributionHub> hub;

        public BreathRateRecognitionController(IHubContext<MeasurementDistributionHub> hubContext)
        {
            this.hub = hubContext;
        }

        // POST: api/BreathRateRecognition
        [HttpPost]
        public async void Post([FromBody] IEnumerable<Metric> measurement)
        {
            // group by ports and order by timestamp before sending to clients
            var gm = measurement.GroupBy(o => o.Port);
            foreach(var g in gm)
            {
                await this.hub.Clients.All.SendAsync("measurement", g.AsEnumerable()?.OrderBy(o=>o.Timestamp));
            }
        }
    }
}
