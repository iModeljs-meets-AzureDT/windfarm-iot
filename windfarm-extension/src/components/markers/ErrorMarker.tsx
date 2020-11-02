import { Marker, BeButtonEvent, StandardViewId, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { Point2d, Point3d, XAndY, XYAndZ } from "@bentley/geometry-core";
import { PowerMarker } from "./PowerMarker";
import * as React from "react";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import * as ReactDOM from "react-dom";
import { DetailedErrorList } from "../../providers/ErrorPovider";

export class ErrorMarker extends Marker {

  private id: string;
  private powerMarker: PowerMarker;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);
    this.id = powerMarker.id;
    this.powerMarker = powerMarker;
    this.size = new Point2d(25, 25)
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y, this.worldLocation.z + 15);
    const image = imageElementFromUrl(`/imjs_extensions/windfarm/bolt-hollow.svg`);
    this.setImage(image);
  }

  public onMouseButton(_ev: BeButtonEvent): any {
    if (_ev.isDown) {
      FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Open;
      // Remove the listener if swapping.
      ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
      ReactDOM.render(<DetailedErrorList turbinePower={this.powerMarker}></DetailedErrorList>, document.getElementById("error-component"));
    }

    return true;
  }
}
