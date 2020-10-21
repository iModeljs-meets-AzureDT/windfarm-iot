namespace MachineLearning
{
    public class DMPowerRequestInfo
    {
        public DMPowerData[] data { get; set; }
    }

    public class DMPowerData
    {
        public string SYSDATETIME { get; set; }
        public float VA_WiSpe_Avg10s { get; set; }
        public float VA_WiDir_Avg30s { get; set; }
        public float VA_PiPosBla1 { get; set; }
        public float VA_PiPosBla2 { get; set; }
        public float VA_PiPosBla3 { get; set; }
        public float VA_YawPos { get; set; }
    }

    public class DMResultInfo
    {
        public double[] result { get; set; }
    }
}
