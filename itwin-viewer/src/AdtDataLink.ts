import { AzureAuth } from "./AzureToken";

export class AdtDataLink {

  public static adtHost = "windfarm-iot.api.wcus.digitaltwins.azure.net";

  public static async fetchDataForNode(dtId: string) {
    const adtToken = await AzureAuth.getAdtToken();
    const request = `http://localhost:3000/digitaltwins/${dtId}?api-version=2020-10-31`;
    const response = adtToken ? await fetch(request, { headers: { Authorization: "Bearer " + await AzureAuth.getAdtToken(), Host: AdtDataLink.adtHost } }) : null;
    return response ? response.json() : null;
  }
}
