import { Marker, BeButtonEvent, StandardViewId, IModelApp } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker } from "../markers/PowerMarker";
import { TimeSeries } from "../../client/TimeSeries";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";

// Canvas example.
export class WindMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";
  public sId: string = "";

  public windDirection: number = 0;
  public windSpeed: number = 0;
  private hover: boolean = false;

  public powerMarker: PowerMarker;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    // Move it back and left.
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y - 50, this.worldLocation.z - 30);
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;
    this.sId = powerMarker.sId;

    this.powerMarker = powerMarker;

    const WindNode = document.createElement("div");
    WindNode.id = "wind-node-" + this.id;
    this.htmlElement = WindNode;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('sensorevent', (data: any) => {

      if (this.id === data.observes) {

        this.windDirection = data.windDirection;
        this.windSpeed = data.windSpeed;

        // Manually call draw func on update.
        WindfarmExtension.viewport?.invalidateDecorations();
      }
    });

  }

  public drawFunc(_ctx: CanvasRenderingContext2D) {

    if (FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState === StagePanelState.Open) {
      this.worldLocation = new Point3d(this.powerMarker.sensorData.marker.worldLocation.x, this.powerMarker.temperatureData.marker.worldLocation.y, this.powerMarker.sensorData.marker.worldLocation.z + 5)
    }
   
    const props = {
      onHover: this.hover,
      windDir: this.windDirection,
      windSpeed: this.windSpeed,
    }
    ReactDOM.render(<WindPanel props={props}></WindPanel>, document.getElementById("wind-node-" + this.id));
  }

  public onMouseEnter(_ev: BeButtonEvent): boolean {
    this.hover = true;
    return true;
  }

  public onMouseLeave(): void {
    this.hover = false;
    return;
  }

  public onMouseButton(_ev: BeButtonEvent): boolean {

    WindfarmExtension.viewport?.zoomToElements([this.bId, this.cId, this.sId], {animateFrustumChange: true, standardViewId: StandardViewId.Right});

    TimeSeries.loadTsiDataForNode(this.id+"-S", ["windDirection", "windSpeed"]);
    if (_ev.isDoubleClick) {
      TimeSeries.showTsiGraph();
    }

    return true;
  }
}

function WindPanel({ props }: any) {
  if (props.onHover) {
    return (
      <div className="card-transition">
        <div className="data">
          <div className="left">
            <u>Wind Data</u><br />
            Direction:<br />
            Speed:
          </div>
          <div className="right">
            <br />
            {props.windDir.toFixed(2)}°<br />
            {props.windSpeed.toFixed(2)} km/h
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="data">
          <div className="left">
          <u>Wind Data</u><br />
            Direction:<br />
            Speed:
          </div>
          <div className="right">
            <br />
            {props.windDir.toFixed(2)}°<br />
            {props.windSpeed.toFixed(2)} km/h
          </div>
      </div>
    </div>
  );
}
