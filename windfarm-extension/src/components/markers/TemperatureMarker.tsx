import { Marker, BeButtonEvent, StandardViewId, IModelApp } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { PowerMarker } from "./PowerMarker";
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
import { TimeSeries } from "../../client/TimeSeries";

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

  private hover: boolean = false;
  public powerMarker: PowerMarker;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);

    this.powerMarker = powerMarker;

    // Move it back and left.
    this.id = powerMarker.id;
    this.cId = powerMarker.cId;
    this.bId = powerMarker.bId;
    this.sId = powerMarker.sId;

    // Create temperature marker.
    const TemperatureNode = document.createElement("div");
    TemperatureNode.id = "temperature-node-" + this.id;
    this.htmlElement = TemperatureNode;

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

  public drawFunc(_ctx: CanvasRenderingContext2D) {

    if (FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState === StagePanelState.Open) {
      this.worldLocation = new Point3d(this.powerMarker.worldLocation.x, this.powerMarker.worldLocation.y + 120, this.powerMarker.worldLocation.z)
    }

    const props = {
      onHover: this.hover,
      tempGearBox: this.temperatureGearBox,
      tempNacelle: this.temperatureNacelle,
      tempGenerator: this.temperatureGenerator
    }
    ReactDOM.render(<TemperaturePanel props={props}></TemperaturePanel>, document.getElementById("temperature-node-" + this.id));
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

    TimeSeries.loadTsiDataForNode(this.id+"-S", ["temperatureGearBox", "temperatureGenerator", "temperatureNacelle"]);
    if (_ev.isDoubleClick) {
      TimeSeries.showTsiGraph();
    }

    return true;
  }
}

function TemperaturePanel({ props }: any) {
  if (props.onHover) {
    return (
      <div className="card-transition">
        <div className="data">
          <div className="left">
            <u>Temperatures</u><br />
            Gear Box:<br />
            Generator:<br />
            Nacelle:
          </div>
          <div className="right">
            <br />
            {props.tempGearBox.toFixed(2)}° C<br />
            {props.tempGenerator.toFixed(2)}° C<br />
            {props.tempNacelle.toFixed(2)}° C
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="data">
          <div className="left">
            <u>Temperatures</u><br />
            Gear Box:<br />
            Generator:<br />
            Nacelle:
          </div>
          <div className="right">
            <br />
            {props.tempGearBox.toFixed(2)}° C<br />
            {props.tempGenerator.toFixed(2)}° C<br />
            {props.tempNacelle.toFixed(2)}° C
          </div>
      </div>
    </div>
  );
}

