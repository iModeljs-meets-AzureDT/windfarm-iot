import { Marker, BeButtonEvent, StandardViewId, IModelApp } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";
import { PowerDecorator } from "../decorators/PowerDecorator";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { AggregateErrorList } from "../../providers/ErrorPovider";

export interface TempDifference {
  id: string;
  tempNacelle: number;
  tempGenerator: number;
  tempGearBox: number;
  timestamp: string;
}

export class TemperatureMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public bId: string = "";
  public sId: string = "";

  public errorSimulation: boolean = false;
  public errorType: string = "Temperature Alert";
  public errorList: TempDifference[] = [];
  public timestamp: string = "";
  public timeChanged: boolean = false;

  public temperatureNacelle: number = 0;
  public temperatureGenerator: number = 0;
  public temperatureGearBox: number = 0;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    // Move it back and left.
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y + 50, this.worldLocation.z - 30);
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;
    this.sId = powerMarker.sId;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('sensorevent', (data: any) => {

      if (this.id === data.observes) {

        this.temperatureGearBox = data.temperatureGearBox;
        this.temperatureGenerator = data.temperatureGenerator;
        this.temperatureNacelle = data.temperatureNacelle;

        if (this.timestamp !== data.$metadata.temperatureGearBox.lastUpdateTime) {
          this.timeChanged = true;
        } else {
          this.timeChanged = false;
        }
        this.timestamp = data.$metadata.temperatureGearBox.lastUpdateTime;

        if (this.temperatureGearBox >= 80 || this.temperatureGenerator >= 80 || this.temperatureNacelle >= 80 || this.errorSimulation === true) {

          // To make things more realistic...
          if (this.errorSimulation === true) this.temperatureGearBox = 80;

          const tempDiff: TempDifference = {
            id: this.id,
            tempNacelle: this.temperatureNacelle,
            tempGenerator: this.temperatureGenerator,
            tempGearBox: this.temperatureGearBox,
            timestamp: data.$metadata.temperatureGearBox.lastUpdateTime
          };

          if (this.timeChanged || this.errorList.length < 1) {
            this.errorList.unshift(tempDiff);
          }

          let foundCurrentEntry = false;
          for (let i = 0; i < PowerMarker.aggregateErrorList.length; ++i) {
            if (PowerMarker.aggregateErrorList[i].id === this.id && PowerMarker.aggregateErrorList[i].errorType === this.errorType) {
              if (PowerMarker.aggregateErrorList[i].isCurrent === true) {
                foundCurrentEntry = true;
                break;
              }
              break;
            }
          }

          if (!foundCurrentEntry) {

            PowerMarker.aggregateErrorList.unshift({
              id: this.id,
              errorType: this.errorType,
              timestampstart: data.$metadata.temperatureGearBox.lastUpdateTime,
              isCurrent: true
            })
          }

          // Open new error panel aggregate.
          if (FrontstageManager.activeFrontstageDef!.rightPanel!.panelState === StagePanelState.Off) {
            ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
            ReactDOM.render(<AggregateErrorList></AggregateErrorList>, document.getElementById("error-component"));
            FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Open;
          }

        } else {


          // This huge mess to sort the list.
          for (let i = 0; i < PowerMarker.aggregateErrorList.length; ++i) {
            if (PowerMarker.aggregateErrorList[i].id === this.id) {
              // We reset the marker if no longer a power error.
              if (PowerMarker.aggregateErrorList[i].isCurrent === true && PowerMarker.aggregateErrorList[i].errorType === this.errorType) {
                PowerMarker.aggregateErrorList[i].isCurrent = false;
                PowerMarker.aggregateErrorList[i].timestampstop = data.$metadata.temperatureGearBox.lastUpdateTime;

                // Move element to first position of non-current queue.
                for (let j = i + 1; j < PowerMarker.aggregateErrorList.length; ++j) {
                  // Continue where this error position was.
                  if (!PowerMarker.aggregateErrorList[j].isCurrent) {
                    PowerMarker.aggregateErrorList.splice(j - 1, 0, PowerMarker.aggregateErrorList.splice(i, 1)[0])
                    break;
                  }

                  // This is the first non-current error.
                  if (j === PowerMarker.aggregateErrorList.length - 1) {
                    PowerMarker.aggregateErrorList.splice(j, 0, PowerMarker.aggregateErrorList.splice(i, 1)[0])
                  }
                }
                break;
              }
              break;
            }
          }
        }

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
    ctx.fillStyle = "rgba(125, 157, 232, 0.67)";
    const yPos = -20;
    const xPos = -75;
    const rectWidth = 130;
    this.roundRect(ctx, xPos, yPos, rectWidth, 70, 10, true, true);
    ctx.font = "10px";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";

    // Manually placing positions since fillText doesn't wrap.
    ctx.textAlign = "center";
    ctx.fillText(this.id, xPos + (rectWidth / 2), yPos + 10);

    ctx.textAlign = "left";
    ctx.fillText("Temp. Gear Box: " + this.temperatureGearBox.toFixed(2) + "°C", xPos + 5, yPos + 30);
    ctx.fillText("Temp. Generator: " + this.temperatureGenerator.toFixed(2) + "°C", xPos + 5, yPos + 45);
    ctx.fillText("Temp. Nacelle: " + this.temperatureNacelle.toFixed(2) + "°C", xPos + 5, yPos + 60);
  }

  public onMouseButton(_ev: BeButtonEvent): boolean {

    WindfarmExtension.viewport?.zoomToElements([this.cId, this.bId, this.sId], {animateFrustumChange: true, standardViewId: StandardViewId.Back});

    PowerDecorator.markers.forEach(marker => {
      IModelApp.viewManager.dropDecorator(marker.windData);
      IModelApp.viewManager.dropDecorator(marker.sensorData);
    });

    return true;
  }
}

