namespace MachineLearning
{
    public class DMGenSpeedRequestInfo
    {
        public GenSpeedRequestData[] data { get; set; }
    }

    public class GenSpeedRequestData
    {
        public string SYSDATETIME { get; set; }
        public float VA_WiTurActPowOut_Avg10s { get; set; }
        public float VA_WiSpe_Avg10s { get; set; }
        public float VA_WiDir_Avg30s { get; set; }
        public float VA_PiPosBla1 { get; set; }
        public float VA_PiPosBla2 { get; set; }
        public float VA_PiPosBla3 { get; set; }
        public float VA_YawPos { get; set; }
        public float VA_GenTorCon { get; set; }
    }
}
