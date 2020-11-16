import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import TsiClient from "tsiclient";
import { AzureAuth } from "./AzureToken";

const EnvironmentFqdn = "97f798b7-7f8e-49a3-9423-5465f3aba78e.env.timeseries.azure.com";

export class TimeSeries {

  private static tsiClient = new TsiClient();
  private static lineChart: any = null;

  public static showTsiGraph() {
      FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState = StagePanelState.Open;
  }

  public static loadPredictedData(data: any) {
    const powerDM: { [key: string]: {} } = {};
    const powerPM: { [key: string]: {} } = {};
    const windSpeed: { [key: string]: {} } = {};

    const result = [{"kW" : {"Power - Data Model" : {}, "Power - Physics Model" : {}}}, {"km/hr" : {"Wind Speed": {}}}];
    const maxVal = {"power" : 0, "windSpeed" : 0};
    for (const entry of data) {
      const sysTime = entry.originSysTime;
      powerDM[sysTime]= {"value" : (entry.power_DM * 10)};
      powerPM[sysTime]= {"value" : (entry.power_PM * 10)};
      windSpeed[sysTime]= {"value" : (entry.windSpeed)};

      // track max value for each measurement (for y extents)
      maxVal.power = (entry.power_DM > maxVal.power) ? entry.power_DM : maxVal.power;
      maxVal.power = (entry.power_PM > maxVal.power) ? entry.power_PM : maxVal.power;
      maxVal.windSpeed = (entry.windSpeed > maxVal.windSpeed) ? entry.windSpeed : maxVal.windSpeed;
    }      
    result[0]["kW"]!["Power - Data Model"] = powerDM;
    result[0]["kW"]!["Power - Physics Model"] = powerPM;
    result[1]["km/hr"]!["Wind Speed"] = windSpeed;
    this.updateTsiGraph(result, null, [{alias: 'kW', yExtent: [0, maxVal.power * 10]}, {alias: 'km/hr', yExtent: [0, maxVal.windSpeed]}]);

    return result;
  }

  public static async loadPowerForAllTurbines() {
    const tsiToken = await AzureAuth.getTsiToken();
    if (!tsiToken) return;
    
    const aggregateExpressions: any[] = [];
    const now = new Date();
    // var startDate = now.setHours(now.getHours() - 1);
    // var endDate = now.setHours(now.getHours() - 25);
    var startDate = new Date("10/23/2020 08:34:31.496");
    var endDate = new Date("10/23/2020 10:34:53.551");
    var searchSpan = { from: startDate, to: endDate, bucketSize: '5m' };
    aggregateExpressions.push(
      new this.tsiClient.ux.AggregateExpression(
        {predicateString: `[patch.path] = '/powerObserved'`},
        {property: 'patch.value', type: "Double"},
        ['avg'],
        searchSpan,
        {property: 'cloudEvents:subject', type: "String"},
        {color:'#00B294' , alias: 'Power Output (kW)'}));

    const result: any = await this.tsiClient.server.getAggregates(tsiToken, EnvironmentFqdn, aggregateExpressions.map(function(ae){return ae.toTsx()}));
    if (result[0]) this.updateTsiGraph(result, aggregateExpressions);
  }

  public static async loadDataForNode(_dtId: string, properties?: string[]) {
    const tsiToken = await AzureAuth.getTsiToken();
    if (!tsiToken) return;
    
    const aggregateExpressions: any[] = [];
    const now = new Date();
    var startDate = new Date("10/23/2020 08:34:31.496");
    var endDate = new Date("10/23/2020 10:34:53.551");
    // var startDate = new Date(now.valueOf() - 1000*60*60*24);
    // var endDate = new Date(now.valueOf() - 1000*60*60*30);
    var searchSpan = { from: startDate, to: endDate, bucketSize: '5m' };
    const propertyQuery = properties ? this.generatePropertyQuery(properties) : "";
    aggregateExpressions.push(
      new this.tsiClient.ux.AggregateExpression(
        {predicateString: `[cloudEvents:subject].String = '${_dtId}'`+`${propertyQuery}`},
        {property: 'patch.value', type: "Double"},
        ['avg', 'min', 'max'],
        searchSpan,
        {property: 'patch.path', type: "String"},
        {color:'#00B294', includeEnvelope: true, alias: ''}));

    const result: any = await this.tsiClient.server.getAggregates(tsiToken, EnvironmentFqdn, aggregateExpressions.map(function(ae){return ae.toTsx()}));
    if (result[0]) this.updateTsiGraph(result, aggregateExpressions);
  }

  public static updateTsiGraph(result: any, aggregateExpressions?: any, chartOptions?: any) {
    var transformedResult = !aggregateExpressions ? result : this.tsiClient.ux.transformAggregatesForVisualization(result, aggregateExpressions);
    let customOptions = chartOptions ? chartOptions : aggregateExpressions;
    const diagram = document.getElementById('diagramDIV');
    if (diagram) {
      this.lineChart = !this.lineChart ? new this.tsiClient.ux.LineChart(diagram) : this.lineChart;
      this.lineChart.render(transformedResult, {yAxisState: 'overlap', theme: 'light', legend: 'compact',  grid: true, tooltip: true}, customOptions);
    }
  }

  private static generatePropertyQuery(properties: string[]) {
    let query = " AND ";
    for (let i = 0; i < properties.length; i++) {
      query += `[patch.path].string = '/${properties[i]}'`;
      if (i === (properties.length - 1)) break;
      query += " OR ";
    }

    return query;
  }
}
