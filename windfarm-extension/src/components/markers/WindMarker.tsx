import { Marker, BeButtonEvent, StandardViewId, IModelApp } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker } from "../markers/PowerMarker";
import { PowerDecorator } from "../decorators/PowerDecorator";
import { TimeSeries } from "../../client/TimeSeries";

import * as React from "react";
import * as ReactDOM from "react-dom";

// Canvas example.
export class WindMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";
  public sId: string = "";

  public windDirection: number = 0;
  public windSpeed: number = 0;
  private hover: boolean = false;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    // Move it back and left.
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y - 50, this.worldLocation.z - 30);
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;
    this.sId = powerMarker.sId;

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

  public drawFunc(_ctx: CanvasRenderingContext2D) {

    /*
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "rgba(255, 145, 36, 0.5)";
    const yPos = -20;
    const xPos = -75;
    const rectWidth = 120;
    this.roundRect(ctx, xPos, yPos, rectWidth, 70, 10, true, true);
    ctx.font = "11px";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.textAlign = "center";
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);

    ctx.textAlign = "left";
    ctx.fillText("Wind Direction: " + this.windDirection.toFixed(2) + "°", xPos + 5, yPos + 30);
    ctx.fillText("Wind Speed: " + Math.abs(this.windSpeed).toFixed(2) + " km/h", xPos + 5, yPos + 45);
    */
   
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

    /*
    PowerDecorator.markers.forEach(marker => {
      IModelApp.viewManager.dropDecorator(marker.temperatureData);
      IModelApp.viewManager.dropDecorator(marker.sensorData);
    });
    */

    TimeSeries.loadTsiDataForNode(this.id+"-S", ["windDirection", "windSpeed"]);
    if (_ev.isDoubleClick) TimeSeries.showTsiGraph();

    return true;
  }
}

function WindPanel({ props }: any) {
  if (props.onHover) {
    return (
      <div className="card-transition">
        <div className="data">
          <div className="left">
            Wind direction:<br />
            Wind speed:
          </div>
          <div className="right">
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
            Wind direction:<br />
            Wind speed:
          </div>
          <div className="right">
            {props.windDir.toFixed(2)}°<br />
            {props.windSpeed.toFixed(2)} km/h
          </div>
      </div>
    </div>
  );
}
