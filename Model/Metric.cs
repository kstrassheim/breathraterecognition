using System;

namespace BreathRateRecognition.Model
{
    public class Metric
    {
        public string Name { get; set; }

        public string Port { get; set; }

        public DateTime Timestamp { get; set; }

        public int Value { get; set; }
    }
}
