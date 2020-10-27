 using System.Collections.Generic;

namespace MachineLearning
{

    public class WTPowerRequestInfo
    {
        public List<WTInfo> PowerInputs { get; set; }
    }
    public class WTInfo
    {
        public string OriginSysTime { get; set; }
        public float WindSpeed { get; set; }
        public float WindDir { get; set; }
        public float YawPosition { get; set; }
        public float Blade1PitchPosition { get; set; }
        public float Blade2PitchPosition { get; set; }
        public float Blade3PitchPosition { get; set; }
        public float Power { get; set; }
        public float Power_PM { get; set; }
        public float Power_DM { get; set; }
        public float PowerGap_PM { get; set; }
        public float PowerGap_DM { get; set; }
    }

    public class WTPowerResultSet
    {
        public List<WTPowerResult> powerResults { get; set; }
    }

    public class WTPowerResult
    {
        public string OriginSysTime { get; set; }
        public float Power_PM { get; set; }
        public float Power_DM { get; set; }
    }
}
