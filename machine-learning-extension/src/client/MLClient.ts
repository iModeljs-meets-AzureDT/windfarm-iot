export default class MLClient {

  public static url: string = "http://localhost:7071/api/triggerml";

  public static async getPredictedMLPower(inputParams: any): Promise<any> {

    const response = await fetch(this.url, {
      method: "POST",
      body: inputParams,
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