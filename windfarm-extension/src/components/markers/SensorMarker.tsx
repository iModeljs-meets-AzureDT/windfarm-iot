import { Marker, BeButtonEvent, StandardViewId } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";
import { TimeSeries } from "../../client/TimeSeries";

import * as React from "react";
import * as ReactDOM from "react-dom";

// Canvas example.
export class SensorMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";
  public sId: string = "";

  public blade1PitchAngle: number = 0;
  public blade2PitchAngle: number = 0;
  public blade3PitchAngle: number = 0;
  public yawPosition: number = 0;
  public hover: boolean = false;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    // Move it back.
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y + 65, this.worldLocation.z - 35);
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;
    this.sId = powerMarker.sId;

    const SensorNode = document.createElement("div");
    SensorNode.id = "sensor-node-" + this.id;
    this.htmlElement = SensorNode;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('sensorevent', (data: any) => {

      if (this.id === data.observes) {

        this.blade1PitchAngle = data.blade1PitchAngle;
        this.blade2PitchAngle = data.blade2PitchAngle;
        this.blade3PitchAngle = data.blade3PitchAngle;
        this.yawPosition = data.yawPosition;

        // Manually call draw func on update.
        WindfarmExtension.viewport?.invalidateDecorations();
      }
    });

  }

  private radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
  }

  public drawFunc(_ctx: CanvasRenderingContext2D) {

    const props = {
      onHover: this.hover,
      blade1Angle: this.radiansToDegrees(this.blade1PitchAngle).toFixed(2),
      blade2Angle: this.radiansToDegrees(this.blade2PitchAngle).toFixed(2),
      blade3Angle: this.radiansToDegrees(this.blade3PitchAngle).toFixed(2),
      yawPosition: this.yawPosition,
    }
    ReactDOM.render(<SensorPanel props={props}></SensorPanel>, document.getElementById("sensor-node-" + this.id));
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

    WindfarmExtension.viewport?.zoomToElements([this.cId, this.bId, this.sId], {animateFrustumChange: true, standardViewId: StandardViewId.Right});
    
    TimeSeries.loadDataForNode(this.id+"-S", ["blade1PitchAngle", "blade2PitchAngle", "blade3PitchAngle", "yawPosition"]);
    if (_ev.isDoubleClick) TimeSeries.showTsiGraph();

    return true;
  }
}

function SensorPanel({ props }: any) {
  if (props.onHover) {
    return (
      <div className="card-transition">
        <div className="data">
          <div className="left">
            <u>Pitch Angles</u><br />
              Blade 1:<br />
              Blade 2:<br />
              Blade 3:<br />
              Yaw:
          </div>
          <div className="right">
            <br />
            {props.blade1Angle}°<br />
            {props.blade2Angle}°<br />
            {props.blade3Angle}°<br />
            {props.yawPosition.toFixed(2)}°
      </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="data">
      <div className="left">
        <u>Pitch Angles</u><br />
              Blade 1:<br />
              Blade 2:<br />
              Blade 3:<br />
              Yaw:
          </div>
      <div className="right">
        <br />
        {props.blade1Angle}°<br />
        {props.blade2Angle}°<br />
        {props.blade3Angle}°<br />
        {props.yawPosition.toFixed(2)}°
      </div>
      </div>
    </div>
  );
}
