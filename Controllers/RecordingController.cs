using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BreathRateRecognition.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BreathRateRecognition.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecordingController : ControllerBase
    {
        // GET: api/Recording/GetNewId
        [HttpGet]
        public async Task<Recording[]> Get()
        {
            return new Recording[] { new Recording() { Id = new Random().Next(0, 10000) }, new Recording() { Id = new Random().Next(0, 10000) } };
        }

        // GET: api/Recording/5
        [HttpGet("{id}", Name = "Get")]
        public Recording Get(int id)
        {
            if (id < 1)
            {
                return new Recording() { Id = new Random().Next(0, 10000) };
            }
            else
            {
                return new Recording() { Id = id };
            }
        }

        // POST: api/Recording
        //[HttpPost]
        //public async void Post([FromBody] Recording recording)
        //{
        //    var i = recording.Metrics.Length;
        //}

        // PUT: api/Recording/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] Metric[] value)
        {
            var i = value.Length;
        }

        //// DELETE: api/ApiWithActions/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
