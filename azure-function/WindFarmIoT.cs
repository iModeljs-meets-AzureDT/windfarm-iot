using Microsoft.Azure.WebJobs;
using Microsoft.Azure.EventHubs;
using System.Text;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using MachineLearning;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;

namespace Doosan.Function
{
    public static class WindFarmIoT
    {
        [FunctionName("WindFarmIoT")]
        public static async void RunWindFarmIoT([EventHubTrigger("iothub-m6vf5", Connection = "EventHubConnectionAppSetting")]EventData[] events, ILogger log)
        {
            var exceptions = new List<Exception>();
            foreach (EventData eventData in events) {
                try
                {
                    string messageBody = Encoding.UTF8.GetString(eventData.Body.Array, eventData.Body.Offset, eventData.Body.Count);
                    JObject messageData = JObject.Parse(messageBody); 
                    var info = new WTInfo
                    {
                        Blade1PitchPosition = (float)messageData.GetValue("pitchAngle1"),
                        Blade2PitchPosition = (float)messageData.GetValue("pitchAngle2"),
                        Blade3PitchPosition = (float)messageData.GetValue("pitchAngle3"),
                        GenSpeed = (float)messageData.GetValue("genSpeed"),
                        GenTorque = (float)messageData.GetValue("genTorque"),
                        OriginSysTime = (string)messageData.GetValue("originSysTime"),
                        Power = (float)messageData.GetValue("power_PM"),
                        WindDir = (float)messageData.GetValue("windDirection"),
                        WindSpeed = (float)messageData.GetValue("windSpeed"),
                        YawPosition = (float)messageData.GetValue("yawPosition")
                    };
                    Console.WriteLine($"Power_Actual: {messageData.GetValue("power")}");
                    Console.WriteLine($"Power_PM: {messageData.GetValue("power_PM")}");
                    await MlApi.GetPowerAsync(info);
                    await MlApi.GetGenSpeedAsync(info);
                    await Task.Yield();
                }
                catch (Exception e)
                {
                    // We need to keep processing the rest of the batch - capture this exception and continue.
                    // Also, consider capturing details of the message that failed processing so it can be processed again later.
                    exceptions.Add(e);
                }
            }
        }

        [FunctionName("TriggerML")]
        public static async Task<IActionResult> HttpTriggerML(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
            HttpRequest req, ILogger log)
        {
            log.LogInformation("Machine Learning HTTP trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            try {
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                /*
                Example request body:
                {     
                    "pitchAngle1": 1.99,
                    "pitchAngle2": 2.02,
                    "pitchAngle3": 1.92,
                    "genSpeed": 1212.28,
                    "genTorque": 6824.49,
                    "originSysTime": "7/29/2018 11:43:00",
                    "windDirection": -8.6,
                    "windSpeed": 6.66,
                    "yawPosition": 5.05
                }
                */

                var info = new WTInfo
                {
                    Blade1PitchPosition = data.pitchAngle1,
                    Blade2PitchPosition = data.pitchAngle2,
                    Blade3PitchPosition = data.pitchAngle3,
                    GenSpeed = data.genSpeed,
                    GenTorque = data.genTorque,
                    OriginSysTime = data.originSysTime,
                    WindDir = data.windDirection,
                    WindSpeed = data.windSpeed,
                    YawPosition = data.yawPosition
                };

                var result = new WTMLInfo {
                    Power_ML = await MlApi.GetPowerAsync(info),
                    GenSpeed_ML = await MlApi.GetGenSpeedAsync(info)
                };

                return (ActionResult)new OkObjectResult(result);
            }
            catch (Exception e)
            {
                return new BadRequestObjectResult(e.ToString());
            }
        }

    }
}