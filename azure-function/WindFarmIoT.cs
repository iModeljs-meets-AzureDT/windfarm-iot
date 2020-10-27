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
using PhysicsModel;
namespace Doosan.Function
{

    struct DtIds {
        public string sensor;
        public string turbineObserved;
    }

    struct TemperatureValues {
        public float nacelle;
        public float gearBox;
        public float generator;
    }

    struct PowerValues {
        public float powerObserved;
        public float powerPM;
        public float powerDM;
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
            
            // extract sensor data
            var info = new WTPowerRequestInfo { MLInputs = new List<WTInfo>() };
            info.MLInputs.Add(new WTInfo {
                    Blade1PitchPosition = (float)sensorData.GetValue("pitchAngle1"),
                    Blade2PitchPosition = (float)sensorData.GetValue("pitchAngle2"),
                    Blade3PitchPosition = (float)sensorData.GetValue("pitchAngle3"),
                    OriginSysTime = (string)sensorData.GetValue("originSysTime"),
                    WindDir = (float)sensorData.GetValue("windDirection"),
                    WindSpeed = (float)sensorData.GetValue("windSpeed"),
                    YawPosition = (float)sensorData.GetValue("yawPosition")
            });

            var tempValues = new TemperatureValues() {
                nacelle = (float)sensorData.GetValue("nacelleTemp"),
                gearBox = (float)sensorData.GetValue("gearboxTemp"),
                generator = (float)sensorData.GetValue("convTemp"),
            };

            // update sensor data on ADT
            string query = $"SELECT * FROM DigitalTwins T WHERE IS_OF_MODEL(T, 'dtmi:adt:chb:Sensor;1') AND T.deviceId = '{deviceId}'";
            DtIds dtIds = await fetchDtIds(query);
            if (dtIds.sensor == null || dtIds.turbineObserved == null) return;
            client.UpdateDigitalTwin(dtIds.sensor, generatePatchForSensor(info.MLInputs[0], tempValues));

            // update turbine data on ADT. We return index 0 since only a single
            // value should only be processed.
            var powerValues = new PowerValues() {
                powerObserved = (float)sensorData.GetValue("power"),
                powerDM = (float)(await MlApi.GetPowerAsync(info.MLInputs)).result[0],
                powerPM = (float)(await PmAPI.GetPowerAsync(info.MLInputs))[0]
            };
            client.UpdateDigitalTwin(dtIds.turbineObserved, generatePatchForTurbine(powerValues));
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

        private static string generatePatchForSensor(WTInfo info, TemperatureValues tempValues) {
            UpdateOperationsUtility uou = new UpdateOperationsUtility();

            uou.AppendReplaceOp("/blade1PitchAngle", info.Blade1PitchPosition);
            uou.AppendReplaceOp("/blade2PitchAngle", info.Blade2PitchPosition);
            uou.AppendReplaceOp("/blade3PitchAngle", info.Blade3PitchPosition);
            uou.AppendReplaceOp("/yawPosition", info.YawPosition);
            uou.AppendReplaceOp("/windDirection", info.WindDir);
            uou.AppendReplaceOp("/windSpeed", info.WindSpeed);
            uou.AppendReplaceOp("/temperatureNacelle", tempValues.nacelle);
            uou.AppendReplaceOp("/temperatureGenerator", tempValues.generator);
            uou.AppendReplaceOp("/temperatureGearBox", tempValues.gearBox);

            return uou.Serialize();
        }

        private static string generatePatchForTurbine(PowerValues powerValues) {
            UpdateOperationsUtility uou = new UpdateOperationsUtility();

            uou.AppendReplaceOp("/powerObserved", powerValues.powerObserved);
            uou.AppendReplaceOp("/powerPM", powerValues.powerPM);
            uou.AppendReplaceOp("/powerDM", powerValues.powerDM);

            return uou.Serialize();
        }

        [FunctionName("TriggerPrediction")]
        public static async Task<IActionResult> HttpTriggerPrediction(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
            HttpRequest req, ILogger log)
        {
            log.LogInformation("Machine Learning HTTP trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            try {
                WTPowerRequestInfo data = JsonConvert.DeserializeObject<WTPowerRequestInfo>(requestBody);

                /*
                Example request body:
                {     
                    "MLInputs": [{
                        "Blade1PitchPosition": 1.99,
                        "Blade2PitchPosition": 2.02,
                        "Blade3PitchPosition": 1.92,
                        "OriginSysTime": "7/29/2018 11:43:00",
                        "WindDir": -8.6,
                        "WindSpeed": 6.66,
                        "YawPosition": 5.05
                    },{
                        "Blade1PitchPosition": 3.1,
                        "Blade2PitchPosition": 2.1,
                        "Blade3PitchPosition": 1.2,
                        "OriginSysTime": "7/29/2018 11:43:01",
                        "WindDir": -8.6,
                        "WindSpeed": 6.66,
                        "YawPosition": 5.05
                    }]
                }
                */

                WTPowerResultSet results = new WTPowerResultSet { powerResults = new List<WTPowerResult>() };

                // These get processed sequentially so a key isn't required. We
                // assume the request has sequential data.
                DMResultInfo PowerDMSet = await MlApi.GetPowerAsync(data.MLInputs);
                float[] PowerPMSet = await PmAPI.GetPowerAsync(data.MLInputs);

                int iterator = 0;
                foreach (WTInfo powerInfo in data.MLInputs)
                {
                    results.powerResults.Add(new WTPowerResult
                    {
                        OriginSysTime = powerInfo.OriginSysTime,
                        Power_DM = (float)PowerDMSet.result[iterator],
                        Power_PM = (float)PowerPMSet[iterator]
                    });

                    ++iterator;
                }

                return (ActionResult)new OkObjectResult(results);
            }
            catch (Exception e)
            {
                return new BadRequestObjectResult(e.ToString());
            }
        }

    }
}
