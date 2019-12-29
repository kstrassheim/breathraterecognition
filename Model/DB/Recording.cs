using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BreathRateRecognition.Model.DB
{
    public class Recording
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public List<RecordingMetric> RecordingMetrics { get; set; }

        public List<Training> Trainings { get; set; }
    }
}
