using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace pysical_model_api.Data
{
    public class WeatherData
    {
        public Response response { get; set; }
    }

    public class Response
    {
        public Header header { get; set; }
        public Body body { get; set; }
    }

    public class Header
    {
        public string resultCode { get; set; }
        public string resultMsg { get; set; }
    }

    public class Body
    {
        public string dataType { get; set; }
        public Items items { get; set; }
        public int pageNo { get; set; }
        public int numOfRows { get; set; }
        public int totalCount { get; set; }
    }

    public class Items
    {
        public Item[] item { get; set; }
    }

    public class Item
    {
        public string baseDate { get; set; }
        public string baseTime { get; set; }
        public string category { get; set; }
        public string fcstDate { get; set; }
        public string fcstTime { get; set; }
        public string fcstValue { get; set; }
        public int nx { get; set; }
        public int ny { get; set; }
    }

}
