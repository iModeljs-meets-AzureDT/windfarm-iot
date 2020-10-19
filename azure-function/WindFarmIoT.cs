using Microsoft.Azure.WebJobs;
using Microsoft.Azure.EventHubs;
using System;
using System.Text;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using MachineLearning;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using Newtonsoft.Json;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure.DigitalTwins.Core.Serialization;

namespace Doosan.Function
{

    struct DtIds {
        public string sensor;
        public string turbineObserved;
    }

    public static class WindFarmIoT
    {
        private static DigitalTwinsClient client;
        private const string adtInstanceUrl = "https://windfarm-iot.api.wcus.digitaltwins.azure.net";

        [FunctionName("WindFarmIoT")]
        public static async void RunWindFarmIoT([EventHubTrigger("iothub-m6vf5", Connection = "EventHubConnectionAppSetting")]EventData[] events, ILogger log)
        {
            if (client == null) Authenticate(log);
            var exceptions = new List<Exception>();
            foreach (EventData eventData in events) {
                try
                {
                    string messageBody = Encoding.UTF8.GetString(eventData.Body.Array, eventData.Body.Offset, eventData.Body.Count);
                    JObject messageData = JObject.Parse(messageBody); 
                    string deviceIdString = eventData.SystemProperties["iothub-connection-device-id"].ToString();
                    string deviceId = deviceIdString.Substring(deviceIdString.IndexOf('.') + 1);

                    await processSensorData(deviceId, messageData);

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

        private static void Authenticate(ILogger log)
        {
            try
            {
                var credential = new DefaultAzureCredential();
                client = new DigitalTwinsClient(new Uri(adtInstanceUrl), credential);
            } catch(Exception e)
            {
                Console.WriteLine($"Authentication or client creation error: {e.Message}");
                Environment.Exit(0);
            }
        }

        private static async Task processSensorData(string deviceId, JObject sensorData) {
            var info = new WTInfo
            {
                Blade1PitchPosition = (float)sensorData.GetValue("pitchAngle1"),
                Blade2PitchPosition = (float)sensorData.GetValue("pitchAngle2"),
                Blade3PitchPosition = (float)sensorData.GetValue("pitchAngle3"),
                GenSpeed = (float)sensorData.GetValue("genSpeed"),
                GenTorque = (float)sensorData.GetValue("genTorque"),
                OriginSysTime = (string)sensorData.GetValue("originSysTime"),
                Power = (float)sensorData.GetValue("power_PM"),
                WindDir = (float)sensorData.GetValue("windDirection"),
                WindSpeed = (float)sensorData.GetValue("windSpeed"),
                YawPosition = (float)sensorData.GetValue("yawPosition")
            };

            string query = $"SELECT * FROM DigitalTwins T WHERE IS_OF_MODEL(T, 'dtmi:adt:chb:Sensor;1') AND T.deviceId = '{deviceId}'";
            DtIds dtIds = await fetchDtIds(query);
            client.UpdateDigitalTwin(dtIds.sensor, generatePatchForSensor(info));

            float powerDM = await MlApi.GetPowerAsync(info);
            float powerPM = (float)sensorData.GetValue("power_PM");
            float powerObserved = (float)sensorData.GetValue("power");
            client.UpdateDigitalTwin(dtIds.turbineObserved, generatePatchForTurbine(powerObserved, powerPM, powerDM));
        }

        private static async Task<DtIds> fetchDtIds(string query) {
            DtIds dtIds = new DtIds();

            try { 
                Azure.AsyncPageable<string> result = client.QueryAsync(query);
                IAsyncEnumerator<Azure.Page<string>> enumerator = result.AsPages().GetAsyncEnumerator();
                while (await enumerator.MoveNextAsync()) {
                    IReadOnlyList<string> values = enumerator.Current.Values;
                    if (values.Count > 0) {
                        JObject nodeData = JObject.Parse(values[0]); 
                        dtIds.sensor = (string)nodeData["$dtId"];
                        dtIds.turbineObserved = (string)nodeData["observes"];
                    } else throw new Exception("Node not found!");
                }
             } catch {}
            return dtIds;
        }

        private static string generatePatchForSensor(WTInfo info) {
            UpdateOperationsUtility uou = new UpdateOperationsUtility();

            uou.AppendReplaceOp("/blade1PitchAngle", info.Blade1PitchPosition);
            uou.AppendReplaceOp("/blade2PitchAngle", info.Blade2PitchPosition);
            uou.AppendReplaceOp("/blade3PitchAngle", info.Blade3PitchPosition);
            uou.AppendReplaceOp("/yawPosition", info.YawPosition);
            uou.AppendReplaceOp("/windDirection", info.WindDir);
            uou.AppendReplaceOp("/windSpeed", info.WindSpeed);
            uou.AppendReplaceOp("/temperatureNacelle", 50);
            uou.AppendReplaceOp("/temperatureGenerator", 50);
            uou.AppendReplaceOp("/temperatureGearBox", 50);

            return uou.Serialize();
        }

        private static string generatePatchForTurbine(float powerObserved, float powerPM, float powerDM) {
            UpdateOperationsUtility uou = new UpdateOperationsUtility();

            uou.AppendReplaceOp("/powerObserved", powerObserved);
            uou.AppendReplaceOp("/powerPM", powerPM);
            uou.AppendReplaceOp("/powerDM", powerDM);

            return uou.Serialize();
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
                    Power_DM = await MlApi.GetPowerAsync(info),
                    GenSpeed_DM = await MlApi.GetGenSpeedAsync(info)
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