import { Marker, BeButtonEvent, StandardViewId, IModelApp, EmphasizeElements } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { SensorDecorator } from "../decorators/SensorDecorator";
import { PowerDecorator } from "../decorators/PowerDecorator";
import { WindDecorator } from "../decorators/WindDecorator";
import { TemperatureDecorator } from "../decorators/TemperatureDecorator";
import { ColorDef } from "@bentley/imodeljs-common";

// Canvas example.
export class PowerMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public sId: string = "";
  public bId: string = "";

  public sensorData: SensorDecorator;
  public windData: WindDecorator;
  public temperatureData: TemperatureDecorator;

  private power: number = 0;
  private powerDM: number = 0;
  private powerPM: number = 0;
  private emphasizedElements: EmphasizeElements;

  private isError: boolean = false;
  private isBlinking: boolean = false;

  // Our default color transitioned.
  private r: number = 87;
  private g: number = 229;
  private b: number = 130;

  // Reduce/Increase this to change duration of color fade.
  private steps: number = 20;
  private step: number = 0;

  private desiredRed = 255;
  private desiredBlue = 255;
  private desiredGreen = 255;

  private dr: number = Math.abs(this.desiredRed - this.r) / this.steps;
  private dg: number = Math.abs(this.desiredGreen - this.g) / this.steps;
  private db: number = Math.abs(this.desiredBlue - this.b) / this.steps;

  private powerChanged: boolean = false;
  private powerBlinker: any;

  constructor(location: XYAndZ, size: XAndY, id: string, cId: string, sId: string, bId: string) {
    super(location, size);
    this.id = id;
    this.cId = cId;
    this.sId = sId;
    this.bId = bId;

    this.emphasizedElements = EmphasizeElements.getOrCreate(WindfarmExtension.viewport!);
    this.sensorData = new SensorDecorator(this);
    this.windData = new WindDecorator(this);
    this.temperatureData = new TemperatureDecorator(this);

    // Add a listener for each marker.
    (window as any).adtEmitter.on('powerevent', (data: any) => {

      if (this.id === data.$dtId) {

        this.id = data.$dtId

        if (this.power !== data.powerObserved ||
          this.powerDM !== data.powerDM ||
          this.powerPM !== data.powerPM) {
            this.powerChanged = true;
        }

        this.power = data.powerObserved;
        this.powerDM = data.powerDM;
        this.powerPM = data.powerPM;

        // Manually call draw func on update.
        WindfarmExtension.viewport?.invalidateDecorations();
      }
    });

  }

  private colorReset(desiredColor?: number[]) {
    if (desiredColor) {
      this.desiredRed = desiredColor[0];
      this.desiredGreen = desiredColor[1];
      this.desiredBlue = desiredColor[2];
    } else {
      this.desiredRed = 255;
      this.desiredGreen = 255;
      this.desiredBlue = 255;
    }

    this.dr = Math.abs(this.desiredRed - this.r) / this.steps;
    this.dg = Math.abs(this.desiredGreen - this.g) / this.steps;
    this.db = Math.abs(this.desiredBlue - this.b) / this.steps;
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

    // Slight green blinker.
    if (fill) {
      ctx.fill();
    }
  }

  public drawFunc(ctx: CanvasRenderingContext2D) {

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";

    // Color blinking logic.
    if (this.powerChanged && (window as any).DEBUG_MODE === true) {
      ctx.fillStyle = 'rgba(' + Math.round(this.r + this.dr * this.step) + ','
        + Math.round(this.g + this.dg * this.step) + ','
        + Math.round(this.b + this.db * this.step) + ', 0.5)';

      if (this.isError) {
        // Reverse the additions/subtractions here depending on the color
        // difference of update color and error color.
        ctx.fillStyle = 'rgba(' + Math.round(this.r + this.dr * this.step) + ','
          + Math.round(this.g - this.dg * this.step) + ','
          + Math.round(this.b - this.db * this.step) + ', 0.5)';
      }
      
      ++this.step;
      
      if (this.step === this.steps) {
        this.powerChanged = false;
        this.step = 0;
      }
    } else {
      ctx.fillStyle = "rgba(" + this.desiredRed + ", " + this.desiredGreen + "," + this.desiredBlue + ", 0.5)";
    }

    const yPos = -20;
    const xPos = -75;
    const rectWidth = 150;
    this.roundRect(ctx, xPos, yPos, rectWidth, 70, 10, true, true);
    ctx.font = "10px";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.textAlign = "center";
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);

    ctx.textAlign = "left";
    ctx.fillText("Actual Power: " + this.power.toFixed(2) + " kW⋅h", xPos + 5, yPos + 30);
    ctx.fillText("Physical Model: " + this.powerPM.toFixed(2) + " kW⋅h", xPos + 5, yPos + 45);
    ctx.fillText("Data Model: " + this.powerDM.toFixed(2) + " kW⋅h", xPos + 5, yPos + 60);

    if (this.powerChanged) {
      WindfarmExtension.viewport?.invalidateDecorations();
    }
  }

  public toggleError() {
    if (!this.isError) {
      this.colorReset([255, 10, 10])

      this.powerBlinker = setInterval(() => {
        if (this.isBlinking) {
          this.emphasizedElements?.overrideElements([this.cId, this.sId, this.bId], WindfarmExtension.viewport!, ColorDef.red);
          this.isBlinking = false;
        } else {
          this.emphasizedElements?.overrideElements([this.cId, this.sId, this.bId], WindfarmExtension.viewport!, ColorDef.create("rgb(153, 153, 153)"));
          this.isBlinking = true;
        }
      }, 1500);
      this.isError = true;
    } else if (this.isError) {

      this.colorReset();
      this.isError = false;
      clearInterval(this.powerBlinker);
      this.emphasizedElements?.overrideElements([this.cId, this.sId, this.bId], WindfarmExtension.viewport!, ColorDef.create("rgb(153, 153, 153)"));
      this.isError = false;
    }

  }

  public disableError() {
      this.colorReset();
      this.isError = false;
      clearInterval(this.powerBlinker);
      this.emphasizedElements?.overrideElements([this.cId, this.sId, this.bId], WindfarmExtension.viewport!, ColorDef.create("rgb(153, 153, 153)"));
      this.isError = false;
  }

  public onMouseButton(_ev: BeButtonEvent): boolean {
    WindfarmExtension.viewport?.zoomToElements([this.cId, this.sId, this.bId], {animateFrustumChange: true, standardViewId: StandardViewId.Right});

    // Drop all other markers.
    PowerDecorator.markers.forEach(marker => {
      IModelApp.viewManager.dropDecorator(marker.sensorData);
      IModelApp.viewManager.dropDecorator(marker.windData);
      IModelApp.viewManager.dropDecorator(marker.temperatureData);
    });

    IModelApp.viewManager.addDecorator(this.sensorData);
    IModelApp.viewManager.addDecorator(this.windData);
    IModelApp.viewManager.addDecorator(this.temperatureData);

    return true;
  }
}
