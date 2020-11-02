import TsiClient from "tsiclient";
import { AzureAuth } from "./AzureToken";

const EnvironmentFqdn = "97f798b7-7f8e-49a3-9423-5465f3aba78e.env.timeseries.azure.com";

export class TimeSeries {

  private static tsiClient = new TsiClient();

  public static async showTsiDataForNode(_dtId: string) {
    const tsiToken = await AzureAuth.getTsiToken();
    if (!tsiToken) return;
    
    const aggregateExpressions: any[] = [];
    const now = new Date();
    var startDate = new Date(now.valueOf() - 1000*60*60*1);
    var searchSpan = { from: startDate, to: now, bucketSize: '20s' };
    aggregateExpressions.push(
      new this.tsiClient.ux.AggregateExpression(
        {predicateString: `[cloudEvents:subject].String = '${_dtId}'`},
        {property: 'patch.value', type: "Double"},
        ['avg', 'min', 'max'],
        searchSpan,
        null,  // split by property
        {color:'#00B294', includeEnvelope: false, alias: 'Node Reading'}));

    const result: any = await this.tsiClient.server.getAggregates(tsiToken, EnvironmentFqdn, aggregateExpressions.map(function(ae){return ae.toTsx()}));
    if (result[0] && result[0].measures.length > 0) return result[0].measures;
  }
}
