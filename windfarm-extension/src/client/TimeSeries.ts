import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import TsiClient from "tsiclient";
import { AzureAuth } from "./AzureToken";

const EnvironmentFqdn = "b62ef342-563d-4e83-8c06-1d46143e934c.env.timeseries.azure.com";

export class TimeSeries {

  public static AllNodes = ["WTG001", "WTG002", "WTG003", "WTG004", "WTG005", "WTG006", "WTG007", "WTG008", "WTG009", "WTG010"];
  public static liveMode = false;
  private static tsiClient = new TsiClient();
  private static lineChart: any = null;
  private static pollData: any;
  private static lastCallContext: any = {};
  private static latestRequestId: string;

  public static switchToLiveMode() {
    TimeSeries.liveMode = true;

    this.loadDataForNodes(
        this.lastCallContext["title"],
        this.lastCallContext["dtIds"], 
        this.lastCallContext["properties"], 
        this.lastCallContext["nameByDtId"], 
        this.lastCallContext["includeEnvelope"])
  }

  public static switchToNormalMode() {
    TimeSeries.liveMode = false;

    this.loadDataForNodes(
        this.lastCallContext["title"],
        this.lastCallContext["dtIds"], 
        this.lastCallContext["properties"], 
        this.lastCallContext["nameByDtId"], 
        this.lastCallContext["includeEnvelope"])
  }

  public static showTsiGraph() {
      FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState = StagePanelState.Open;
  }

  public static loadPredictedData(data: any) {
    clearInterval(this.pollData);

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
    
    this.updateTsiGraph(result, "Total Predicted Power", null, [{alias: 'kW', yExtent: [0, maxVal.power * 10]}, {alias: 'km/hr', yExtent: [0, maxVal.windSpeed]}], -240);

    return result;
  }

  public static async loadDataForNodes(title: string, dtIds: string[], properties: string[], nameByDtId = false, includeEnvelope = true ) {
    this.lastCallContext["title"] = title;
    this.lastCallContext["dtIds"] = dtIds;
    this.lastCallContext["properties"] = properties;
    this.lastCallContext["nameByDtId"] = nameByDtId;
    this.lastCallContext["includeEnvelope"] = includeEnvelope;
    
    clearInterval(this.pollData);
    this._loadData(title, dtIds, properties, nameByDtId, includeEnvelope);

    if(this.liveMode) {
      this.pollData = setInterval(() => {
        if(this.liveMode) this._loadData(title, dtIds, properties, nameByDtId, includeEnvelope);
      }, 1000);
    }
  }

  private static async _loadData(title: string, dtIds: string[], properties: string[], nameByDtId = false, includeEnvelope = true ) {
    const tsiToken = await AzureAuth.getTsiToken();
    if (!tsiToken) return;
    
    const linechartTsqExpressions: any[] = [];
    let searchSpan;
    const now = new Date();
    
    if (this.liveMode)
      searchSpan = { from: now.valueOf() - (0.25*60*60*1000), to: now }
    else
      searchSpan = { from: now.valueOf() - (2*60*60*1000), to: now, bucketSize: '10m' }

    for (const dtId of dtIds) {
      for (const property of properties) {
        linechartTsqExpressions.push(new this.tsiClient.ux.TsqExpression(
          {timeSeriesId: [dtId, "/" + property] }, // instance json
          {avg: {
              kind: 'numeric',
              value: {tsx: 'coalesce($event.patch.value.Double, todouble($event.patch.value.Long))'},
              filter: null,
              aggregation: {tsx: 'avg($value)'}
          },
          min: {
            kind: 'numeric',
            value: {tsx: 'coalesce($event.patch.value.Double, todouble($event.patch.value.Long))'},
            filter: null,
            aggregation: {tsx: 'min($value)'}
          },
          max: {
            kind: 'numeric',
            value: {tsx: 'coalesce($event.patch.value.Double, todouble($event.patch.value.Long))'},
            filter: null,
            aggregation: {tsx: 'max($value)'}
          }}, // variable json
          searchSpan, // search span
          {includeEnvelope: includeEnvelope, alias: nameByDtId ? dtId : property }
          )); // alias
      }
    }
    
    const liveMode = this.liveMode;
    const requestGuid = this.generateGuid();
    this.latestRequestId = requestGuid;
    const result: any = await this.tsiClient.server.getTsqResults(tsiToken, EnvironmentFqdn, linechartTsqExpressions.map(function(ae){return liveMode ? ae.toTsq(false, false, true) : ae.toTsq()}));
    if (result[0] && (this.latestRequestId == requestGuid)) this.updateTsiGraph(result, title, linechartTsqExpressions, null, -300, 'shared', liveMode);
  }

  public static updateTsiGraph(result: any, title: string, linechartTsqExpressions?: any, chartDataOptions?: any, timeOffset: number = 0, yAxisState = 'overlap', noAnimate = true) {
    var transformedResult = !linechartTsqExpressions ? result : this.tsiClient.ux.transformTsqResultsForVisualization(result, linechartTsqExpressions);
    let customOptions = chartDataOptions ? chartDataOptions : linechartTsqExpressions;
    
    (window as any).setTsiTitle(title);

    const diagram = document.getElementById('diagramDIV');
    if (diagram) {
      this.lineChart = !this.lineChart ? new this.tsiClient.ux.LineChart(diagram) : this.lineChart;
      this.lineChart.render(transformedResult, {yAxisState, theme: 'light', legend: 'compact',  grid: true, tooltip: true, offset: timeOffset, noAnimate}, customOptions);
    }
  }

  private static generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
}
