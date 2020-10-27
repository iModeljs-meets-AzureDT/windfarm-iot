using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace MachineLearning
{
    class MlApi
    {
        public static async Task<float> GetPowerAsync(WTPowerRequestInfo info)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://3f48dc9f-8b7c-41d8-9b00-00245bc05c9b.westus.azurecontainer.io/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    var requestInfo = new DMPowerData
                    {
                        SYSTIME = info.MLInputs[0].OriginSysTime,
                        VA_PiPosBla1 = info.MLInputs[0].Blade1PitchPosition,
                        VA_PiPosBla2 = info.MLInputs[0].Blade2PitchPosition,
                        VA_PiPosBla3 = info.MLInputs[0].Blade3PitchPosition,
                        VA_WiDir_Avg30s = info.MLInputs[0].WindDir,
                        VA_WiSpe_Avg10s = info.MLInputs[0].WindSpeed,
                        VA_YawPos = info.MLInputs[0].YawPosition
                    };

/*
                    var otherRequest = new DMPowerData
                    {
                        SYSTIME = info.OriginSysTime,
                        VA_PiPosBla1 = 3,
                        VA_PiPosBla2 = 2,
                        VA_PiPosBla3 = 1,
                        VA_WiDir_Avg30s = info.WindDir,
                        VA_WiSpe_Avg10s = info.WindSpeed,
                        VA_YawPos = info.YawPosition
                    };
                    */

                    var requestBody = new DMPowerRequestInfo { data = new DMPowerData[2] };
                    requestBody.data[0] = requestInfo;
                    requestBody.data[1] = requestInfo;

                    var response = await client.PostAsJsonAsync("score", requestBody);
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        Console.WriteLine(result);
                        result = result.Replace("\\\"", "");
                        result = result.Substring(1);
                        result = result.Substring(0, result.Length - 1);
                        var dmResult = JsonConvert.DeserializeObject<DMResultInfo>(result);

                        info.MLInputs[0].Power_DM = (dmResult.result.Length > 0 ? float.Parse(dmResult.result[0].ToString()) : 0.0f);
                        // Gap
                        info.MLInputs[0].PowerGap_DM = Math.Abs(info.MLInputs[0].Power - info.MLInputs[0].Power_DM);

                        return info.MLInputs[0].Power_DM;
                    }
                    else
                    {
                        throw new Exception("Invalid Response:" + response.StatusCode.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                info.MLInputs[0].Power_DM = 0.0f;
                Console.Error.WriteLine($"GetDataPowerAsync Error: {ex.ToString()}.");
                throw ex;
            }
        }
    }
}
