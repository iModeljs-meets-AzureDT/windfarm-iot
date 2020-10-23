import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";
import { PowerMarker } from "../markers/PowerMarker";
import { TemperatureMarker } from "../markers/TemperatureMarker";

export class TemperatureDecorator implements Decorator {
  protected marker: TemperatureMarker;

  constructor(powerMarker: PowerMarker) {
    this.marker = new TemperatureMarker(powerMarker);
  }

  public decorate(context: DecorateContext): void {
    this.marker.addDecoration(context);
  }
}
  
