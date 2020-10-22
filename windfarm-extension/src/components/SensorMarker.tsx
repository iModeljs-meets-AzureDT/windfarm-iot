import { Marker, BeButtonEvent, StandardViewId } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";
import { WindfarmExtension } from "../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";

// Canvas example.
export class SensorMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";

  private blade1PitchAngle: number = 0;
  private blade2PitchAngle: number = 0;
  private blade3PitchAngle: number = 0;
  private yawPosition: number = 0;
  private windDirection: number = 0;
  private windSpeed: number = 0;
  private temperatureNacell: number = 0;
  private temperatureGenerator: number = 0;
  private temperatureGearbox: number = 0;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('sensorevent', (data: any) => {

      if (this.id === data.observes) {

        this.blade1PitchAngle = data.blade1PitchAngle;
        this.blade2PitchAngle = data.blade2PitchAngle;
        this.blade3PitchAngle = data.blade3PitchAngle;
        this.yawPosition = data.yawPosition;
        this.windDirection = data.windDirection;
        this.windSpeed = data.windSpeed;
        this.temperatureNacell = data.temperatureNacell;
        this.temperatureGenerator = data.temperatureGenerator;
        this.temperatureGearbox = data.temperatureGearbox;

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
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    const yPos = 120;
    const xPos = -75;
    const rectWidth = 150;
    this.roundRect(ctx, xPos, yPos, rectWidth, 70, 10, true, true);
    ctx.font = "10px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);
    ctx.fillText("Blade1:" + this.blade1PitchAngle, xPos + (rectWidth / 2), yPos + 30);
    ctx.fillText("Blade2: " + this.blade2PitchAngle, xPos + (rectWidth / 2), yPos + 45);
    ctx.fillText("Blade3: " + this.blade3PitchAngle, xPos + (rectWidth / 2), yPos + 60);
  }

  public onMouseButton(_ev: BeButtonEvent): boolean {
    WindfarmExtension.viewport?.zoomToElements([this.cId, this.bId], {animateFrustumChange: true, standardViewId: StandardViewId.Right});

    // this.showSensorData = true;
    return true;
  }
}

