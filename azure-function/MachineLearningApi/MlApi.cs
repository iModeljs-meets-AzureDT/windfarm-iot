using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace MachineLearning
{
    class MlApi
    {
        public static async Task<float> GetPowerAsync(WTInfo info)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://3f48dc9f-8b7c-41d8-9b00-00245bc05c9b.westus.azurecontainer.io/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    var requestInfo = new DMPowerData
                    {
                        SYSTIME = info.OriginSysTime,
                        VA_PiPosBla1 = info.Blade1PitchPosition,
                        VA_PiPosBla2 = info.Blade2PitchPosition,
                        VA_PiPosBla3 = info.Blade3PitchPosition,
                        VA_WiDir_Avg30s = info.WindDir,
                        VA_WiSpe_Avg10s = info.WindSpeed,
                        VA_YawPos = info.YawPosition
                    };

                    var requestBody = new DMPowerRequestInfo { data = new DMPowerData[1] };
                    requestBody.data[0] = requestInfo;

                    var response = await client.PostAsJsonAsync("score", requestBody);
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        result = result.Replace("\\\"", "");
                        result = result.Substring(1);
                        result = result.Substring(0, result.Length - 1);
                        var dmResult = JsonConvert.DeserializeObject<DMResultInfo>(result);

                        info.Power_DM = (dmResult.result.Length > 0 ? float.Parse(dmResult.result[0].ToString()) : 0.0f);
                        // Gap
                        info.PowerGap_DM = Math.Abs(info.Power - info.Power_DM);

                        Console.WriteLine($"Power_DM: {info.Power_DM}");

                        return info.Power_DM;
                    }
                    else
                    {
                        throw new Exception("Invalid Response:" + response.StatusCode.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                info.Power_DM = 0.0f;
                Console.Error.WriteLine($"GetDataPowerAsync Error: {ex.ToString()}.");
                throw ex;
            }
        }
    }
}
