export default class MLClient {

  public static url: string = "http://localhost:7071/api/TriggerPrediction?steps=12&alldata";

  public static async getPredictedMLPower(): Promise<any> {

    const response = await fetch(this.url, {
      method: "POST",
    }).then((response) => {
      if(response.status === 200) {
        return response.json();
      } else {
        throw response.statusText;
      }
    })
    .then((data) => {
      return data;
    })

    return response;
  }

}