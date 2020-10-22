import { Marker, BeButtonEvent, StandardViewId, IModelApp } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY, Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";
import { PowerDecorator } from "./PowerDecorator";

// Canvas example.
export class WindMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";

  private windDirection: number = 0;
  private windSpeed: number = 0;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    // Move it back and left.
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y - 50, this.worldLocation.z - 30);
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;

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

  public drawFunc(ctx: CanvasRenderingContext2D) {

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "rgba(87, 229, 130, 0.64)";
    const yPos = -20;
    const xPos = -75;
    const rectWidth = 150;
    this.roundRect(ctx, xPos, yPos, rectWidth, 70, 10, true, true);
    ctx.font = "11px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);
    ctx.fillText("windDirection: " + this.windDirection, xPos + (rectWidth / 2), yPos + 30);
    ctx.fillText("windSpeed: " + this.windSpeed, xPos + (rectWidth / 2), yPos + 45);
  }

  public onMouseButton(_ev: BeButtonEvent): boolean {

    WindfarmExtension.viewport?.zoomToElements([this.bId], {animateFrustumChange: true, standardViewId: StandardViewId.Front});

    PowerDecorator.markers.forEach(marker => {
      IModelApp.viewManager.dropDecorator(marker.temperatureData);
      IModelApp.viewManager.dropDecorator(marker.sensorData);
    });

    return true;
  }
}

