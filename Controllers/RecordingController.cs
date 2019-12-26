using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http.OData;
using BreathRateRecognition.Model;
using BreathRateRecognition.Model.DB;
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
        [EnableQuery]
        public async Task<IQueryable<Recording>> Get()
        {
            using (var db = new BreathRateRecognitionContext())
            {
                return db.Recordings;
            }
        }

        // GET: api/Recording/5
        [HttpGet("{id}", Name = "Get")]
        public async Task<Recording> Get(int id)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                if (id < 1)
                {
                    var r = new Recording();
                    db.Recordings.Add(r);
                    await db.SaveChangesAsync();
                    return r;
                }
                else
                {
                    return db.Recordings.FirstOrDefault(o => o.Id == id);
                }
            }
        }

        // POST: api/Recording
        [HttpPost]
        public async void Post([FromBody] Recording recording)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                if (db.Recordings.Any(o=>o.Id == recording.Id))
                {
                    db.Attach(recording);
                    db.Entry(recording).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    await db.SaveChangesAsync();
                }
            }
        }

        // PUT: api/Recording/5
        [HttpPut("{id}")]
        public async void Put(int id, [FromBody] Metric[] value)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                var r = db.Recordings.FirstOrDefault(o => o.Id == id);

                if (r != null)
                {
                    foreach (var m in value)
                    {
                        db.RecordingMetrics.Add(new RecordingMetric() { Name = m.Name, Port = m.Port, Value = m.Value, Timestamp = m.Timestamp, Recording = r });
                    }

                    await db.SaveChangesAsync();
                }
            }
        }

        //// DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public async void Delete(int id)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                var r = db.Recordings.FirstOrDefault(o => o.Id == id);

                if (r != null)
                {
                    db.Remove(r);
                    await db.SaveChangesAsync();
                }
            }
        }
    }
}
