import { Marker, BeButtonEvent, StandardViewId, IModelApp, MarkerSet, Cluster } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY, Point3d, WritableXYAndZ } from "@bentley/geometry-core";
import { WindfarmExtension } from "../../WindfarmExtension";
import { SensorDecorator } from "../decorators/SensorDecorator";
import { PowerDecorator } from "../decorators/PowerDecorator";
import { WindDecorator } from "../decorators/WindDecorator";
import { TemperatureDecorator } from "../decorators/TemperatureDecorator";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import { TimeSeries } from "../time-series/TimeSeries";

import * as React from "react";
import * as ReactDOM from "react-dom";

export interface PowerDifference {
  id: string;
  percentageDMDiff: number;
  percentagePMDiff: number;
  powerObserved?: number;
  powerDM?: number;
  powerPM?: number;
  timestamp: string;
  isError: boolean;
}

export interface ErrorType {
  id: string;
  errorType: string;
  timestampstart: string;
  timestampstop?: string;
  isCurrent: boolean;
}

// Canvas example.
export class PowerMarker extends Marker {

  public id: string = "";
  public cId: string = "";
  public sId: string = "";
  public bId: string = "";

  public sensorData: SensorDecorator;
  public windData: WindDecorator;
  public temperatureData: TemperatureDecorator;
  public timestamp: string = "";
  public timeChanged: boolean = false;

  // For detailed timestamps/power readings for specified error.
  // Aggregate error list
  public static aggregateErrorList: ErrorType[] = [];

  // Internal error list
  public errorList: PowerDifference[] = [];
  public isPowerError: boolean = false;
  public errorType: string = "Power Alert";
  public initialLocation: WritableXYAndZ;

  public power: number = 0;
  public powerDM: number = 0;
  public powerPM: number = 0;

  private isError: boolean = false;
  public errorSimulation: boolean = false;
  private isBlinking: boolean = false;

  private powerBlinker: any;

  public clicked: boolean = false;
  public hover: boolean = false;

  public markerSet?: PowerMarkerSet;

  constructor(location: XYAndZ, size: XAndY, id: string, cId: string, sId: string, bId: string, markerSet?: PowerMarkerSet) {
    super(location, size);
    this.initialLocation = location;
    this.id = id;
    this.visible = false;
    this.markerSet = markerSet;
    PowerMarker.aggregateErrorList = [];

    this.cId = cId;
    this.sId = sId;
    this.bId = bId;

    this.sensorData = new SensorDecorator(this);
    this.windData = new WindDecorator(this);
    this.temperatureData = new TemperatureDecorator(this);

    const PowerNode = document.createElement("div");
    PowerNode.id = "power-node-" + this.id;
    this.htmlElement = PowerNode;

    // Add a listener for each marker.
    (window as any).adtEmitter.on('powerevent', (data: any) => {

      if (this.id === data.$dtId) {

        this.id = data.$dtId

        if (this.power !== data.powerObserved ||
          this.powerDM !== data.powerDM ||
          this.powerPM !== data.powerPM) {
        }

        this.power = data.powerObserved;
        this.powerDM = data.powerDM;
        this.powerPM = data.powerPM;

        const powerError = this.calculateDifference(this.power, this.powerPM, this.powerDM, data.$metadata.powerObserved.lastUpdateTime);

        if (this.timestamp !== data.$metadata.powerObserved.lastUpdateTime) {
          this.timeChanged = true;
        } else {
          this.timeChanged = false;
        }
        this.timestamp = data.$metadata.powerObserved.lastUpdateTime;

        if (powerError.isError || this.errorSimulation === true) {
          // To make things more realistic...
          if (this.errorSimulation) powerError.powerObserved = 0;

          // Always add the first error in, even if there was no time change.
          if (this.timeChanged || this.errorList.length < 1) {
            this.errorList.unshift(powerError);
          }

          this.enableError();

          this.isPowerError = true;

          let foundCurrentEntry = false;
          for (let i = 0; i <  PowerMarker.aggregateErrorList.length; ++i) {
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
              timestampstart: data.$metadata.powerObserved.lastUpdateTime,
              isCurrent: true
            });
          }
        } else {

          // Sort errors.
          for (let i = 0; i < PowerMarker.aggregateErrorList.length; ++i) {
            if (PowerMarker.aggregateErrorList[i].id === this.id) {
              // We reset the marker if no longer a power error.
              if (PowerMarker.aggregateErrorList[i].isCurrent === true && PowerMarker.aggregateErrorList[i].errorType === this.errorType) {
                PowerMarker.aggregateErrorList[i].isCurrent = false;
                PowerMarker.aggregateErrorList[i].timestampstop = data.$metadata.powerObserved.lastUpdateTime;
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

          this.isPowerError = false;
          this.disableError();
        }

        // Manually call draw func on update.
        WindfarmExtension.viewport?.invalidateDecorations();
      }
    });

  }

  private calculateDifference(powerObserved: number, powerPM: number, powerDM: number, timestamp: string): PowerDifference {
    // If percentage difference between powerObserved and (powerPM OR powerDM)
    // >= 50%, return true if error
    const diffPowerPM = 100 * (Math.abs(powerObserved - powerPM) / ((powerObserved + powerPM) / 2))
    const diffPowerDM = 100 * (Math.abs(powerObserved - powerDM) / ((powerObserved + powerDM) / 2))

    // We'll only test powerDM right now since powerPM is broken.
    const diff: PowerDifference = {
      id: this.id,
      percentagePMDiff: diffPowerPM,
      percentageDMDiff: diffPowerDM,
      powerObserved,
      powerDM,
      powerPM,
      timestamp: timestamp,
      isError: (diffPowerDM >= 50 || diffPowerPM >= 50) ? true : false
    };

    return diff;
  }

  public drawFunc(_ctx: CanvasRenderingContext2D) {
    const props = {
      onHover: this.hover,
      isClicked: this.clicked,
      id: this.id,
      power: this.power.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}),
      powerDM: this.powerDM.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}),
      powerPM: this.powerPM.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}),
      windSpeed: this.windData.marker.windSpeed,
      windDir: this.windData.marker.windDirection
    }

    ReactDOM.render(<PowerPanel props={props}></PowerPanel>, document.getElementById("power-node-" + this.id));
  }

  public enableError() {
    if (this.isError === true) return;
    this.isError = true;
    this.powerBlinker = setInterval(() => {
      if (this.isBlinking) {
        this.isBlinking = false;
      } else {
        this.isBlinking = true;
      }
    }, 1500);
  }

  public disableError() {
    if (this.isError === false) return;
    this.isError = false;
    clearInterval(this.powerBlinker);
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
    if (_ev.isDown) {
      PowerDecorator.markers.forEach(marker => {
        marker.clicked = false;
        marker.worldLocation = new Point3d(marker.initialLocation.x, marker.initialLocation.y, marker.initialLocation.z);
      });
      this.clicked = true;
    }

    WindfarmExtension.viewport?.zoomToElements([this.bId], { animateFrustumChange: true, standardViewId: StandardViewId.Front });

    // Drop all other markers.
    PowerDecorator.markers.forEach(marker => {
      IModelApp.viewManager.dropDecorator(marker.sensorData);
      IModelApp.viewManager.dropDecorator(marker.windData);
      IModelApp.viewManager.dropDecorator(marker.temperatureData);
    });

    const xOffset = 60;
    /* Corner Layout */
    if (FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState === StagePanelState.Open) { 
      this.sensorData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset - 10, this.worldLocation.y, this.worldLocation.z)
      this.temperatureData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset - 10, this.worldLocation.y, this.worldLocation.z - 30)
      this.windData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset - 10, this.worldLocation.y, this.worldLocation.z - 55)
    } else {
      this.sensorData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset + 5, this.worldLocation.y, this.worldLocation.z)
      this.temperatureData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset + 5, this.worldLocation.y, this.worldLocation.z - 25)
      this.windData.marker.worldLocation = new Point3d(this.worldLocation.x - xOffset + 5, this.worldLocation.y, this.worldLocation.z - 45)
    }

    IModelApp.viewManager.addDecorator(this.sensorData);
    IModelApp.viewManager.addDecorator(this.temperatureData);
    IModelApp.viewManager.addDecorator(this.windData);
    WindfarmExtension.viewport?.invalidateDecorations();

    TimeSeries.loadDataForNodes(this.id + " - Power", [this.id], ["powerObserved", "powerPM", "powerDM"]);
    if (_ev.isDoubleClick) { 
      TimeSeries.showTsiGraph() 
    };
    
    return true;
  }
}

function PowerPanel({ props }: any) {
  if (props.onHover) {
    return (
      <div className="card-transition">
        <h1>{props.id}</h1>
        <div className="data">
          <div className="left">
            Observed power:<br />
            Physical model:<br />
            Data model:
        </div>
          <div className="right">
            {props.power} kW<br />
            {props.powerPM} kW<br />
            {props.powerDM} kW
        </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <h1>{props.id}</h1>
      <div className="data">
        <div className="left">
          Observed power:<br />
            Physical model:<br />
            Data model:
        </div>
        <div className="right">
          {props.power} kW<br />
          {props.powerPM} kW<br />
          {props.powerDM} kW
        </div>
      </div>
    </div>
  );
}

export class PowerMarkerCluster extends Marker {
  constructor(location: XYAndZ, size: XAndY, _cluster: Cluster<PowerMarker>) {
    super(location, size);
  }
}

export class PowerMarkerSet extends MarkerSet<Marker> {
  public minimumClusterSize = 2;

  protected getClusterMarker(cluster: Cluster<Marker>): Marker { return PowerMarkerCluster.makeFrom(cluster.markers[0], cluster); }
}
