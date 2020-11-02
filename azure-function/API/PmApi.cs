using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using MachineLearning;

namespace PhysicsModel
{
    class PmAPI
    {
        public static async Task<float[]> GetPowerAsync(List<WTInfo> info)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    List<float> windspeeds = new List<float>();

                    foreach (WTInfo MLInput in info)
                    {
                        windspeeds.Add(MLInput.WindSpeed);
                    }

                    var json = JsonConvert.SerializeObject(windspeeds);
                    var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync("http://52.157.19.187/api/pysicalmodel", httpContent);
                    if (response.IsSuccessStatusCode)
                    {
                        var result = await response.Content.ReadAsStringAsync();

                        float[] pmResult = JsonConvert.DeserializeObject<float[]>(result);

                        return pmResult;
                    }
                    else
                    {
                        throw new Exception("Invalid Response:" + response.StatusCode.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"GetDataPowerAsync Error: {ex.ToString()}.");
                throw ex;
            }
        }
    }
}
