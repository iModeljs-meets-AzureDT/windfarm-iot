import { DecorateContext, Marker, Decorator } from "@bentley/imodeljs-frontend";
import { WindfarmExtension } from "../WindfarmExtension";
import { PowerDisplayMarker, PowerMarker } from "./PowerMarker";

export class PowerDecorator implements Decorator {
  protected _markers: Marker[] = [];

  constructor() {
    this.addMarker();
  }

  private async addMarker() {

    // Structure, ControlUnit and Blades are used to construct the ZoomToElements.
    const query = `SELECT control.ecinstanceid as cId, 
                          structure.ecinstanceid as sId, 
                          blades.ecinstanceid as bId, 
                          control.origin 
                      FROM bis.physicalelement control 
                      INNER JOIN bis.physicalelement structure ON control.parent.id = structure.parent.id 
                      INNER JOIN bis.physicalelement blades ON control.parent.id = blades.parent.id 
                      WHERE control.userlabel = 'ControlUnit' AND structure.userlabel = 'Structure' AND blades.userlabel = 'Blades'`;

    const rowIterator = WindfarmExtension.imodel!.query(query);

    let turbineIndex = 1;
    while (true) {
      const { done, value } = await rowIterator.next();
      if (done) break;


      /* SVG example..
      const marker = new PowerMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z + 20 },
        { x: 50, y: 50 }
      );
      this._markers.push(marker);
      */

      let prefix = "WTG00";
      if (turbineIndex >= 10) prefix = "WTG0";
      const powerdisplayMarker = new PowerDisplayMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z + 30 },
        { x: 100, y: 100 },
        prefix + turbineIndex++,
        value.cId,
        value.sId,
        value.bId,
      );

      this._markers.push(powerdisplayMarker);
    }

  }

  public decorate(context: DecorateContext): void {
    this._markers.forEach((marker) => {
      marker.addDecoration(context);
    });

  }
}
  