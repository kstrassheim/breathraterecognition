using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BreathRateRecognition.Model
{
    public class TrainingRange
    {
        public string Port { get; set; }

        public DateTime Start { get; set; }

        public DateTime End { get; set; }
    }
}
