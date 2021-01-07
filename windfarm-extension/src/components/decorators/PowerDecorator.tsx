import { DecorateContext, Decorator, IModelApp } from "@bentley/imodeljs-frontend";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker, PowerMarkerSet } from "../markers/PowerMarker";

export class PowerDecorator implements Decorator {
  public static markers: PowerMarker[] = [];
  private markerSet: PowerMarkerSet = new PowerMarkerSet();

  constructor() {
    this.addMarker();
  }

  private async addMarker() {

    // Structure, ControlUnit and Blades are used to construct the ZoomToElements.
    const query = `SELECT turbine.TID,
                          control.ecinstanceid as cId, 
                          structure.ecinstanceid as sId, 
                          blades.ecinstanceid as bId, 
                          control.origin
                      FROM bis.physicalelement control 
                      INNER JOIN bis.category category ON control.category.id = category.ecinstanceid
                      INNER JOIN bis.physicalelement structure ON control.parent.id = structure.parent.id 
                      INNER JOIN bis.physicalelement blades ON control.parent.id = blades.parent.id 
                      JOIN DgnCustomItemTypes_WindEnergy.Turbine turbine ON control.parent.id = turbine.ecinstanceid
                      WHERE control.userlabel = 'Mesh' AND category.codevalue = 'Nacelle' AND structure.userlabel = 'Base' AND blades.userlabel = 'Blades'`;

    const rowIterator = WindfarmExtension.imodel!.query(query);

    while (true) {
      const { done, value } = await rowIterator.next();
      if (done) break;

      // Special cases for WTG008...
      const powerdisplayMarker = new PowerMarker(
        { x: value.origin.x, y: value.origin.y, z: value.origin.z + 30 },
        { x: 220, y: 120 },
        value.tID,
        value.cId,
        value.sId,
        value.bId,
        this.markerSet
      );

      PowerDecorator.markers.push(powerdisplayMarker);
      this.markerSet.markers.add(powerdisplayMarker);
    }

  }

  public decorate(context: DecorateContext): void {
   this.markerSet.addDecoration(context);
  }
}
  