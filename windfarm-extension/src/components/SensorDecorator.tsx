import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";
import { PowerMarker } from "./PowerMarker";
import { SensorMarker } from "./SensorMarker";

export class SensorDecorator implements Decorator {
  protected _markers: SensorMarker[] = [];

  constructor(powerMarkers: PowerMarker[]) {
    this.addMarker(powerMarkers);
  }

  private async addMarker(powerMarkers: PowerMarker[]) {
    powerMarkers.forEach((powerMarker) => {
      console.log("ADDING POWER MARKERS.");
      console.log(powerMarker);
      // powerMarker.id
      // this._markers.push(new SensorMarker(powerMarker))
    })
  }

  public decorate(_context: DecorateContext): void {
    /*
    this._markers.forEach((marker) => {
      marker.addDecoration(context);
    });
    */
  }
}
  
