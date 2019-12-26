using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BreathRateRecognition.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BreathRateRecognition.Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class BreathRateRecognitionController : ControllerBase
    {
        [HttpGet]
        public string Get()
        {
            return "Hello World";
        }

        // POST: api/CapSignal
        [HttpPost]
        public void Post([FromBody] Metric measurement)
        {
            var i = measurement?.Value;
        }

    }
}
