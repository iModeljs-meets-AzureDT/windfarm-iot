using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace pysical_model_api.Data
{
    public class PredictionData
    {
        public DateTime forecastDateTime { get; set; }

        public double windspeed { get; set; }

        public double winddirection { get; set; }

        public double yawposition { get; set; }

        public double bladepitch1 { get; set; }

        public double bladepitch2 { get; set; }

        public double bladepitch3 { get; set; }
    }
}
