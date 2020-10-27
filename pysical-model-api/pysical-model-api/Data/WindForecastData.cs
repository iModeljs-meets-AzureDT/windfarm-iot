using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace pysical_model_api.Data
{
    public class WindForecastData
    {
        public DateTime forecastDateTime { get; set; }
        public double winddir { get; set; }
        public double windspeed { get; set; }
    }
}
