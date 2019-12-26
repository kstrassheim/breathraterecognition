using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BreathRateRecognition.Model.DB
{
    public class RecordingMetric
    {
        public long Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Port { get; set; }

        public int Value { get; set; }

        public DateTime Timestamp { get; set; }

        [Required]
        public virtual Recording Recording { get; set; }
    }
}
