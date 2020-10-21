import { Marker, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";
import { WindfarmExtension } from "../WindfarmExtension";

// SVG example.
export class PowerMarker extends Marker {
    constructor(worldLocation: XYAndZ, size: XAndY) {
      super(worldLocation, size);
      const image = imageElementFromUrl(`/imjs_extensions/windfarm/map_pin.svg`);
      this.setImage(image);
    }
  }

// Canvas example.
export class PowerDisplayMarker extends Marker {

  public id: string = "PLACEHOLDER";
  private power: number = 800;
  private powerDM: number = 1000;
  private powerPM: number = 900;

  constructor(location: XYAndZ, size: XAndY, id: string) {
    super(location, size);
    this.id = id;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('event', (data: any) => {

      /* Test if ADT isn't changing.
      PowerDisplayMarker.power += 1;
      PowerDisplayMarker.powerDM += 1;
      PowerDisplayMarker.powerPM += 1;
      */

      if (this.id === data.$dtId) {

        this.id = data.$dtId
        this.power = data.powerObserved;
        this.powerDM = data.powerDM;
        this.powerPM = data.powerPM;

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
    if (!(window as any).DATA_LINK) return;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.roundRect(ctx, 10, 10, 150, 70, 10, true, true);
    ctx.font = "10px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    const rectWidth = 150;
    const rectX = 10;

    // Manually placing positions since fillText doesn't wrap.
    ctx.fillText(this.id, rectX + (rectWidth / 2), 20);
    ctx.fillText("Actual Power:" + this.power, rectX + (rectWidth / 2), 35);
    ctx.fillText("Physical Model: " + this.powerPM, rectX + (rectWidth / 2), 50);
    ctx.fillText("Data Model: " + this.powerDM, rectX + (rectWidth / 2), 65);
  }
}
