import { DecorateContext, Marker, Decorator, IModelApp } from "@bentley/imodeljs-frontend";
import { WindfarmExtension } from "../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";

export class PowerDecorator implements Decorator {
  protected _markers: Marker[] = [];

  constructor() {
    this.addMarker();
  }

  private async addMarker() {

    const query = "select origin from bis.physicalelement where userlabel = 'ControlUnit'";

    const rowIterator = WindfarmExtension.imodel!.query(query);

    while (true) {
      const { done, value } = await rowIterator.next();
      if (done) break;
      const marker = new PowerMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z + 20 },
        { x: 50, y: 50 },
      );

      this._markers.push(marker);
    }
  }

  public decorate(context: DecorateContext): void {
    this._markers.forEach((marker) => {
      marker.addDecoration(context);
    });
  }
}
