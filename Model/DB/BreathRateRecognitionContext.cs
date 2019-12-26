using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace BreathRateRecognition.Model.DB
{
    public class BreathRateRecognitionContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder options) => options.UseSqlite("Data Source=BreathRateRecognition.db;foreign keys=true");

        public DbSet<Recording> Recordings { get; set; }

        public DbSet<RecordingMetric> RecordingMetrics { get; set; }
    }
}
