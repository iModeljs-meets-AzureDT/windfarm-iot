 using System.Collections.Generic;

namespace MachineLearning
{

    public class WTPowerRequestInfo
    {
        public IList<WTInfo> MLInputs { get; set; }
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

    public class WTMLInfo
    {
        public float Power_DM { get; set; }
    }
}
