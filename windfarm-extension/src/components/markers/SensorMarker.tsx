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

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: boolean, stroke: boolean) {
    if (typeof stroke == "undefined") {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
      ctx.stroke();
    }
    if (fill) {
      ctx.fill();
    }
  }

  private radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
  }

  public drawFunc(_ctx: CanvasRenderingContext2D) {

    /*
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "rgba(255, 237, 102, 0.5)";
    const yPos = -20;
    const xPos = -75;
    const rectWidth = 150;
    this.roundRect(ctx, xPos, yPos, rectWidth, 85, 10, true, true);
    ctx.font = "10px";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.textAlign = "center";
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);

    ctx.textAlign = "left";
    ctx.fillText("Blade 1 Pitch Angle : " + this.radiansToDegrees(this.blade1PitchAngle).toFixed(2) + "°", xPos + 5, yPos + 30);
    ctx.fillText("Blade 2 Pitch Angle : " + this.radiansToDegrees(this.blade2PitchAngle).toFixed(2) + "°", xPos + 5, yPos + 45);
    ctx.fillText("Blade 3 Pitch angle : " + this.radiansToDegrees(this.blade3PitchAngle).toFixed(2) + "°", xPos + 5, yPos + 60);
    ctx.fillText("Yaw Position: " + this.yawPosition.toFixed(2) + "°", xPos + 5, yPos + 75);
    */
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
    
    TimeSeries.loadTsiDataForNode(this.id+"-S", ["blade1PitchAngle", "blade2PitchAngle", "blade3PitchAngle", "yawPosition"]);
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
