using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BreathRateRecognition.Model;
using BreathRateRecognition.Model.DB;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BreathRateRecognition.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingController : ControllerBase
    {
        // GET: api/Training
        [HttpGet]
        public IEnumerable<Training> Get()
        {
            using (var db = new BreathRateRecognitionContext())
            {
                return db.Trainings.ToArray();
            }
        }

        // GET: api/Training/5
        [HttpGet("{id}", Name = "GetTraining")]
        public async Task<Training> Get(int id)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                if (id < 0)
                {
                    await db.SaveChangesAsync();
                }

                return db.Trainings.FirstOrDefault(o => o.Id == id);
            }
        }

        // POST: api/Training
        [HttpPost]
        public async void Post([FromBody] Training t)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                if (db.Trainings.Any(o => o.Id == t.Id))
                {
                    db.Attach(t);
                    db.Entry(t).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    await db.SaveChangesAsync();
                }
            }
        }

        [HttpPut("{id}")]
        public async Task<Training> Put(int id, [FromBody] TrainingRange t)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                var r = db.Recordings.FirstOrDefault(o => o.Id == id);

                if (r != null)
                {
                    //foreach (var t in trainings)
                    //{
                    var tr = new Training() { Port = t.Port, Start = t.Start, End = t.End, Recording = r };
                    db.Trainings.Add(tr);
                    //}

                    await db.SaveChangesAsync();

                    return tr;
                }

                return null;
            }
        }

        // DELETE: api/Training/5
        [HttpDelete("{id}")]
        public async void Delete(int id)
        {
            using (var db = new BreathRateRecognitionContext())
            {
                var t = db.Trainings.FirstOrDefault(o => o.Id == id);

                if (t != null)
                {
                    db.Entry(t).State = Microsoft.EntityFrameworkCore.EntityState.Deleted;
                    await db.SaveChangesAsync();
                }
            }
        }
    }
}
