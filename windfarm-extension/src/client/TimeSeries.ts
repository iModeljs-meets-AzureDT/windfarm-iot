import { Dictionary } from "@bentley/bentleyjs-core";
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

  public static showTsiForPredictedData(data: any) {
    const powerDM: { [key: string]: {} } = {};
    const powerPM: { [key: string]: {} } = {};

    const result = [{"" : {"/powerDM" : {}, "/powerPM" : {}}}];
    for (const entry of data) {
      const sysTime = entry.originSysTime;
      powerDM[sysTime]= {"value" : (entry.power_DM)};
      powerPM[sysTime]= {"value" : (entry.power_PM)};
    }      
    result[0][""]["/powerDM"] = powerPM;
    result[0][""]["/powerPM"] = powerDM;
    this.showTsiGraph();
    this.updateTsiGraph(result);
  }

  public static async loadTsiDataForNode(_dtId: string, properties?: string[]) {
    const tsiToken = await AzureAuth.getTsiToken();
    debugger;
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

  private static generatePropertyQuery(properties: string[]) {
    let query = " AND ";
    for (let i = 0; i < properties.length; i++) {
      query += `[patch.path].string = '/${properties[i]}'`;
      if (i === (properties.length - 1)) break;
      query += " OR ";
    }

    return query;
  }

  private static updateTsiGraph(result: any, aggregateExpressions?: any) {
    var transformedResult = !aggregateExpressions ? result : this.tsiClient.ux.transformAggregatesForVisualization(result, aggregateExpressions);
    const diagram = document.getElementById('diagramDIV');
    if (diagram) {
      this.lineChart = !this.lineChart ? new this.tsiClient.ux.LineChart(diagram) : this.lineChart;
      this.lineChart.render(transformedResult, {theme: 'light', legend: 'compact',  grid: true, tooltip: true}, aggregateExpressions);
    }
  }
}
