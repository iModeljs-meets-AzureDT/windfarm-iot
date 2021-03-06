﻿using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MachineLearning
{
    class MlApi
    {
        public static async Task<DMResultInfo> GetPowerAsync(List<WTInfo> info)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri("http://3f48dc9f-8b7c-41d8-9b00-00245bc05c9b.westus.azurecontainer.io/");
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    DMPowerRequestInfo requestBody = new DMPowerRequestInfo { data = new DMPowerData[info.Count] };
                    int iterator = 0;
                    foreach (WTInfo MLInput in info)
                    {
                        var request = new DMPowerData
                        {
                            SYSTIME = MLInput.OriginSysTime,
                            VA_PiPosBla1 = MLInput.Blade1PitchPosition,
                            VA_PiPosBla2 = MLInput.Blade2PitchPosition,
                            VA_PiPosBla3 = MLInput.Blade3PitchPosition,
                            VA_WiDir_Avg30s = MLInput.WindDir,
                            VA_WiSpe_Avg10s = MLInput.WindSpeed,
                            VA_YawPos = MLInput.YawPosition
                        };
                        requestBody.data[iterator++] = request;
                    }

                    HttpResponseMessage response = await client.PostAsJsonAsync("score", requestBody);
                    if (response.IsSuccessStatusCode)
                    {
                        string result = await response.Content.ReadAsStringAsync();
                        result = result.Replace("\\\"", "");
                        result = result.Substring(1);
                        result = result.Substring(0, result.Length - 1);

                        DMResultInfo dmResult = JsonConvert.DeserializeObject<DMResultInfo>(result);

                        return dmResult;
                    }
                    else
                    {
                        throw new Exception("Invalid Response:" + response.StatusCode.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                info[0].Power_DM = 0.0f;
                Console.Error.WriteLine($"GetDataPowerAsync Error: {ex.ToString()}.");
                throw ex;
            }
        }
    }
}
