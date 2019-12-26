using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BreathRateRecognition.Model
{
    public class Recording
    {
        public long Id { get; set; }

        public Metric[] Metrics { get; set; }
    }
}
