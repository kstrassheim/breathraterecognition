using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BreathRateRecognition.Model.DB
{
    public class Training
    {
        public int Id { get; set; }

        public string Port { get; set; }

        public DateTime Start { get; set; }

        public DateTime End { get; set; }

        [Required]
        [JsonIgnore]
        public virtual Recording Recording { get; set; }
    }
}
