import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";
import { PowerMarker } from "./PowerMarker";
import { SensorMarker } from "./SensorMarker";

export class SensorDecorator implements Decorator {
  protected marker: SensorMarker;

  constructor(powerMarker: PowerMarker) {
    this.marker = new SensorMarker(powerMarker);
  }

  public decorate(context: DecorateContext): void {
    this.marker.addDecoration(context);
  }
}
  
