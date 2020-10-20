namespace MachineLearning
{
    public class WTInfo
    {
        public string OriginSysTime { get; set; }
        public float WindSpeed { get; set; }
        public float WindDir { get; set; }
        public float YawPosition { get; set; }
        public float Blade1PitchPosition { get; set; }
        public float Blade2PitchPosition { get; set; }
        public float Blade3PitchPosition { get; set; }
        public string State { get; set; }
        public string Stop { get; set; }
        public float Service { get; set; }
        public float Power { get; set; }
        public float Power_PM { get; set; }
        public float Power_DM { get; set; }

        public float GenSpeed { get; set; }
        public float GenSpeed_PM { get; set; }
        public float GenSpeed_DM { get; set; }
        public float GenTorque { get; set; }
        public float GenTorque_PM { get; set; }
        //       public float GenTorque_DM { get; set; }

        public float PitchAngle1_PM { get; set; }
        public float PitchAngle2_PM { get; set; }
        public float PitchAngle3_PM { get; set; }

        public float PowerGap_PM { get; set; }
        public float PowerGap_DM { get; set; }
        public string PowerGap_Status { get; set; }

    }

    public class WTMLInfo
    {
        public float Power_DM { get; set; }
        public float GenSpeed_DM { get; set; }
    }
}
