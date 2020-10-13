using Microsoft.Azure.WebJobs;
using Microsoft.Azure.EventHubs;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using MachineLearning;

namespace Doosan.Function
{
    public static class WindFarmIoT
    {
        private static HttpClient client = new HttpClient();

        [FunctionName("WindFarmIoT")]
        public static async void Run([EventHubTrigger("iothub-m6vf5", Connection = "EventHubConnectionAppSetting")]EventData[] events, ILogger log)
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
                    client = null;
                }
            }
        }
    }
}