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
                    client.BaseAddress = new Uri("http://7e3b9761-3192-479e-af6d-d498302e531d.westus.azurecontainer.io/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    var requestInfo = new DMPowerData
                    {
                        //datetime = info.EventEnqueuedUtcTime.ToString(),
                        SYSDATETIME = info.OriginSysTime,
                        VA_GenSpe = info.GenSpeed,
                        VA_GenTorCon = info.GenTorque,
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

        public static async Task<float> GetGenSpeedAsync(WTInfo info)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://c9864822-5e7b-4358-b3ba-c3305c4284a2.westus.azurecontainer.io/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    var requestInfo = new GenSpeedRequestData
                    {
                        SYSDATETIME = info.OriginSysTime,
                        VA_GenTorCon = info.GenTorque,
                        VA_PiPosBla1 = info.Blade1PitchPosition,
                        VA_PiPosBla2 = info.Blade2PitchPosition,
                        VA_PiPosBla3 = info.Blade3PitchPosition,
                        VA_WiDir_Avg30s = info.WindDir,
                        VA_WiSpe_Avg10s = info.WindSpeed,
                        VA_YawPos = info.YawPosition,
                        VA_WiTurActPowOut_Avg10s = info.Power
                    };
                    var requestBody = new DMGenSpeedRequestInfo { data = new GenSpeedRequestData[1] };
                    requestBody.data[0] = requestInfo;
                    var response = await client.PostAsJsonAsync("score", requestBody);
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();
                        result = result.Replace("\\\"", "");
                        result = result.Substring(1);
                        result = result.Substring(0, result.Length - 1);
                        var dmResult = JsonConvert.DeserializeObject<DMResultInfo>(result);

                        info.GenSpeed_DM = (dmResult.result.Length > 0 ? float.Parse(dmResult.result[0].ToString()) : 0.0f);

                        Console.WriteLine($"GenSpeed_DM: {info.GenSpeed_DM}");

                        return info.GenSpeed_DM;
                    } else {
                        throw new Exception("Invalid Response:" + response.StatusCode.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                info.GenSpeed_DM = 0.0f;
                Console.Error.WriteLine($"GetGenSpeedAsync Error: {ex.ToString()}.");
                throw ex;
            }
        }
    }
}
