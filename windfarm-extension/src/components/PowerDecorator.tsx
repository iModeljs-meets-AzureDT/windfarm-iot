import { DecorateContext, Decorator, IModelApp } from "@bentley/imodeljs-frontend";
import { WindfarmExtension } from "../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";
import { SensorDecorator } from "./SensorDecorator";

export class PowerDecorator implements Decorator {
  public markers: PowerMarker[] = [];

  constructor() {
    this.addMarker().then(() => {
      IModelApp.viewManager.addDecorator(new SensorDecorator(this.markers));
    });
  }

  private async addMarker() {

    // Structure, ControlUnit and Blades are used to construct the ZoomToElements.
    const query = `SELECT turbine.TID, 
                          control.ecinstanceid as cId, 
                          structure.ecinstanceid as sId, 
                          blades.ecinstanceid as bId, 
                          control.origin 
                      FROM bis.physicalelement control 
                      INNER JOIN bis.physicalelement structure ON control.parent.id = structure.parent.id 
                      INNER JOIN bis.physicalelement blades ON control.parent.id = blades.parent.id 
                      JOIN DgnCustomItemTypes_WindEnergy.Turbine turbine ON control.parent.id = turbine.ecinstanceid
                      WHERE control.userlabel = 'ControlUnit' AND structure.userlabel = 'Structure' AND blades.userlabel = 'Blades'`;

    const rowIterator = WindfarmExtension.imodel!.query(query);

    while (true) {
      const { done, value } = await rowIterator.next();
      if (done) break;

      const powerdisplayMarker = new PowerMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z + 30 },
        { x: 100, y: 100 },
        value.tID ? value.tID : "WTG008",
        value.cId,
        value.sId,
        value.bId,
      );

      this.markers.push(powerdisplayMarker);
    }

  }

  public decorate(context: DecorateContext): void {
    this.markers.forEach((marker) => {
      marker.addDecoration(context);
    });

  }
}
  