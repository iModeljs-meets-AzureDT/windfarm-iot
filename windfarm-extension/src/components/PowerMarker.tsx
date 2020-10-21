import { Marker, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";

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

  constructor(location: XYAndZ, size: XAndY) {
    super(location, size);
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
    ctx.fillStyle = "#abc";
    this.roundRect(ctx, 10, 10, 100, 70, 10, true, true);
    ctx.font = "10px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    // var rectHeight = 200;
    var rectWidth = 100;
    var rectX = 10;
    // var rectY = 10;
    ctx.fillText((window as any).DATA_LINK.$dtId, rectX + (rectWidth / 2), 20);
    ctx.fillText("Actual Power:" + (window as any).DATA_LINK.powerObserved, rectX + (rectWidth / 2), 35);
    ctx.fillText("Physical Model: " + (window as any).DATA_LINK.powerPM, rectX + (rectWidth / 2), 50);
    ctx.fillText("Data Model: " + (window as any).DATA_LINK.powerDM, rectX + (rectWidth / 2), 65);
  }
}
