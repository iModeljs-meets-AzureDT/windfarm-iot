import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";
import { ErrorType, PowerMarker } from "../components/markers/PowerMarker";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import { PowerDecorator } from "../components/decorators/PowerDecorator";
import { WindfarmExtension } from "../WindfarmExtension";
import { IModelApp, StandardViewId } from "@bentley/imodeljs-frontend";
import { TemperatureMarker } from "../components/markers/TemperatureMarker";
import { Point3d } from "@bentley/geometry-core";
import { TimeSeries } from "../client/TimeSeries";

// The lists continue to grow but we shouldn't pollute the DOM.
const MAX_ELEMENTS = 12;

function deactivateWidget() {
  FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Off;
}

export function displayAggregate() {
  ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
  ReactDOM.render(<AggregateErrorList></AggregateErrorList>, document.getElementById("error-component"));
  FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Open;
  (window as any).errorWidgetOpened();
}

export function AggregateErrorList() {
  const [errorList, setErrorList] = useState([...PowerMarker.aggregateErrorList]);

  React.useEffect(() => {
    function onUpdateErrorList() {
      setErrorList([...PowerMarker.aggregateErrorList]);
    }

    (window as any).adtEmitter.on("powerevent", onUpdateErrorList);
    (window as any).adtEmitter.on("sensorevent", onUpdateErrorList);

    return function cleanup() {
      (window as any).adtEmitter.removeListener("powerevent", onUpdateErrorList);
      (window as any).adtEmitter.removeListener("sensorevent", onUpdateErrorList);
    }
  })

  const errors = errorList.slice(0, MAX_ELEMENTS).map((error: ErrorType, i: any) => {

    function onErrorClick(markerId: string, errorType: string) {

      PowerDecorator.markers.forEach((marker) => {

        // Hide all other markers and display the appropriate decorators.
        if (markerId === marker.id) {
          PowerDecorator.markers.forEach(otherMarkers => {
            otherMarkers.clicked = false;
            otherMarkers.worldLocation = new Point3d(otherMarkers.initialLocation.x, otherMarkers.initialLocation.y, otherMarkers.initialLocation.z);
            IModelApp.viewManager.dropDecorator(otherMarkers.sensorData);
            IModelApp.viewManager.dropDecorator(otherMarkers.windData);
            IModelApp.viewManager.dropDecorator(otherMarkers.temperatureData);
          });
          marker.clicked = true;
          // marker.worldLocation = new Point3d(marker.initialLocation.x, marker.initialLocation.y + 50, marker.initialLocation.z - 15);

          const xOffset = 60;
          if (FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState === StagePanelState.Open) {
            marker.sensorData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset - 10, marker.worldLocation.y, marker.worldLocation.z)
            marker.temperatureData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset - 10, marker.worldLocation.y, marker.worldLocation.z - 30)
            marker.windData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset - 10, marker.worldLocation.y, marker.worldLocation.z - 55)
          } else {
            marker.sensorData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset + 5, marker.worldLocation.y, marker.worldLocation.z)
            marker.temperatureData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset + 5, marker.worldLocation.y, marker.worldLocation.z - 25)
            marker.windData.marker.worldLocation = new Point3d(marker.worldLocation.x - xOffset + 5, marker.worldLocation.y, marker.worldLocation.z - 45)
          }

        /*
              if (FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState === StagePanelState.Open) {
                marker.sensorData.marker.worldLocation = new Point3d(marker.worldLocation.x, marker.worldLocation.y, marker.worldLocation.z - 35)
                marker.temperatureData.marker.worldLocation = new Point3d(marker.worldLocation.x, marker.worldLocation.y + 75, marker.worldLocation.z)
                marker.windData.marker.worldLocation = new Point3d(marker.sensorData.marker.worldLocation.x, marker.temperatureData.marker.worldLocation.y, marker.sensorData.marker.worldLocation.z + 3)
              } else {
                marker.sensorData.marker.worldLocation = new Point3d(marker.worldLocation.x, marker.worldLocation.y, marker.worldLocation.z - 25)
                marker.temperatureData.marker.worldLocation = new Point3d(marker.worldLocation.x, marker.worldLocation.y + 50, marker.worldLocation.z)
                marker.windData.marker.worldLocation = new Point3d(marker.sensorData.marker.worldLocation.x, marker.temperatureData.marker.worldLocation.y, marker.sensorData.marker.worldLocation.z + 3)
              }
              */

          IModelApp.viewManager.addDecorator(marker.sensorData);
          IModelApp.viewManager.addDecorator(marker.temperatureData);
          IModelApp.viewManager.addDecorator(marker.windData);

          TimeSeries.loadDataForNode(marker.id);
        }

        if (markerId === marker.id && errorType === "Power Alert") {

          WindfarmExtension.viewport?.zoomToElements([marker.bId], { animateFrustumChange: true, standardViewId: StandardViewId.Front });
          ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
          ReactDOM.render(<DetailedPowerErrorList turbinePower={marker}></DetailedPowerErrorList>, document.getElementById("error-component"));
          return;
        } else if (markerId === marker.id && errorType === "Temperature Alert") {
          WindfarmExtension.viewport?.zoomToElements([marker.bId], { animateFrustumChange: true, standardViewId: StandardViewId.Front });

          ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
          ReactDOM.render(<DetailedTemperatureErrorList turbineTemperature={marker.temperatureData.marker}></DetailedTemperatureErrorList>, document.getElementById("error-component"));
          return;
        }
      })
    }

    const timeStart = error.timestampstart.split("T")[0] + " " + error.timestampstart.split("T")[1].split(".")[0]
    let timeEnd;
    if (error.timestampstop) {
      timeEnd = error.timestampstop.split("T")[0] + " " + error.timestampstop.split("T")[1].split(".")[0]
    }

    return (
      <CSSTransition
        key={errorList.length - 1 - i}
        classNames="error"
        timeout={{ enter: 500, exit: 300 }}
      >

        {error.isCurrent ?
         error.errorType === "Power Alert" ? 
          <li className="show-power-error" onClick={() => onErrorClick(error.id, error.errorType)}>
            <div className="card-alert priority-2">
              <svg viewBox="0 0 20 20">
                <path d="m2.5 2.5h15v15h-15z" fill="#f60"/>
                <path d="m17 3v14h-14v-14zm1-1h-16v16h16z"/>
                <path d="m9 14h-2v-2h2zm0-8h-2v4.66667h2zm4 8h-2v-2h2zm0-8h-2v4.66667h2z"/>
              </svg>
              <p className="title">{error.errorType}</p>
              <p className="id">ID: {error.id}</p>
              <p className="metadata">Since {timeStart}</p>
            </div>
          </li>
         :
          <li className="show-temp-error" onClick={() => onErrorClick(error.id, error.errorType)}>
            <div className="card-alert priority-3">
                <svg viewBox="0 0 20 20">
                <path d="m.902 17.5 9.098-14.557 9.098 14.557z" fill="#fff200"/>
                <path d="m10 3.8868 8.19575 13.1132h-16.3915zm0-1.8868-10 16h20z"/>
                <path d="m11 15h-2v-2h2zm0-8h-2v4.66667h2z"/>
              </svg>
              <p className="title">{error.errorType}</p>
              <p className="id">ID: {error.id}</p>
              <p className="metadata">Since {timeStart}</p>
            </div>
          </li>
          :
          <li className="show-non-error" onClick={() => onErrorClick(error.id, error.errorType)}>
            <div className="card-alert priority-4">
                <svg viewBox="0 0 16 16">
                <circle cx="8" cy="8" fill="#0ff" r="7.5"/>
                <path d="m8 1a7 7 0 1 1 -7 7 7 7 0 0 1 7-7m0-1a8 8 0 1 0 8 8 8 8 0 0 0 -8-8zm1 12h-2v-2h2zm0-8h-2v4.66667h2z"/>
              </svg>
              <p className="title">{error.errorType.replace("Alert", "Event")}</p>
              <p className="id">ID: {error.id}</p>
              <p className="metadata">Start: {timeStart}</p>
              <p className="metadata">End: {timeEnd}</p>
            </div>
          </li>
        }
      </CSSTransition>
    )
  });

  return (
    <div>
      <svg className="minimize-error-panel" onClick={deactivateWidget}>
        <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
        <title>Minimize</title>
      </svg>
      <div>
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Events:</u></h3> <br />
        <ul id="list">
          <TransitionGroup>
            {errors}
          </TransitionGroup>
        </ul>
      </div>
    </div>
  )
}

// Power Error Component
export function DetailedPowerErrorList({ turbinePower }: any) {
  const [power, setPower] = useState({ id: turbinePower.id, observedPower: turbinePower.power, physicalPower: turbinePower.powerPM, datamodelPower: turbinePower.powerDM });
  const [errors, setError] = useState((turbinePower as PowerMarker).errorList);

  React.useEffect(() => {
    function onPowerEvent(data: any) {
      if (power.id === data.$dtId) {
        setPower({ id: turbinePower.id, observedPower: data.powerObserved, physicalPower: data.powerPM, datamodelPower: data.powerDM })
        setError(turbinePower.errorList);
      }
    }

    (window as any).adtEmitter.on("powerevent", onPowerEvent);

    return function cleanup() {
      (window as any).adtEmitter.removeListener("powerevent", onPowerEvent);
    }
  })

  const items = errors.slice(0, MAX_ELEMENTS).map((error, i) => {
    // Reverse key to have transition occur at index 0.
    const date = error.timestamp.split("T")[0]
    const time = error.timestamp.split("T")[1].split(".")[0]
    return (
    <CSSTransition
      key={errors.length - 1 - i}
      classNames="error"
      timeout={{enter: 500, exit: 300}}
      >

      <li className="show-power">
          <div className="card-power-alert priority-2">
            <svg viewBox="0 0 20 20">
              <path d="m2.5 2.5h15v15h-15z" fill="#f60" />
              <path d="m17 3v14h-14v-14zm1-1h-16v16h16z" />
              <path d="m9 14h-2v-2h2zm0-8h-2v4.66667h2zm4 8h-2v-2h2zm0-8h-2v4.66667h2z" />
            </svg>
            <p className="title"><u>{date}</u> at {time}</p>
            <p className="metadata"><b>Observed Power</b>: {error.powerObserved?.toFixed(1)} kW</p>
            <p className="metadata"><b>Physical Power</b>: {error.powerPM?.toFixed(1)} kW</p>
            <p className="metadata"><b>Data Model Power</b>: {error.powerDM?.toFixed(1)} kW</p>
          </div>
      </li>
    </CSSTransition>
  )
  });

  return (
    <div>
      <div className="card-power-status priority-5">
        <svg className="minimize-error-panel" style={{padding: 0, marginRight: "15px"}} onClick={deactivateWidget}>
          <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
          <title>Minimize</title>
        </svg>
        <svg className="back-button" onClick={() => displayAggregate()} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m11 3a1.00006 1.00006 0 0 1 1 1v8a.99991.99991 0 0 1 -1.4961.8682l-7.0001-4a1 1 0 0 1 0-1.7364l7.0001-4a.99862.99862 0 0 1 .4961-.1318z"/></svg>
        <p className="title"><b>Turbine ID: <u>{power.id}</u></b></p>
        <p className="metadata"><b>Observed Power</b>: {power.observedPower?.toFixed(1)} kW</p>
        <p className="metadata"><b>Physical Power</b>: {power.physicalPower?.toFixed(1)} kW</p>
        <p className="metadata"><b>Data Model Power</b>: {power.datamodelPower?.toFixed(1)} kW</p>
      </div>
      <div>
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Power Warnings:</u></h3> <br />
        <ul id="list">
          <TransitionGroup>
            {items}
          </TransitionGroup>
        </ul>
      </div>
    </div>
  )
}

export function DetailedTemperatureErrorList({ turbineTemperature }: any) {
  const [temperature, setTemperature] = useState({ id: turbineTemperature.id, tempNacelle: turbineTemperature.temperatureNacelle, tempGenerator: turbineTemperature.temperatureGenerator, tempGearBox: turbineTemperature.temperatureGearBox });
  const [errors, setError] = useState((turbineTemperature as TemperatureMarker).errorList);

  React.useEffect(() => {
    function onSensorEvent(data: any) {
      if (temperature.id === data.$dtId.substring(0, data.$dtId.length - 2)) {
        setTemperature({ id: turbineTemperature.id, tempNacelle: data.temperatureNacelle, tempGenerator: data.temperatureGenerator, tempGearBox: data.temperatureGearBox })
        setError(turbineTemperature.errorList);
      }
    }

    (window as any).adtEmitter.on("sensorevent", onSensorEvent);

    return function cleanup() {
      (window as any).adtEmitter.removeListener("sensorevent", onSensorEvent);
    }
  })

  const items = errors.slice(0, MAX_ELEMENTS).map((error, i) => {
    // Reverse key to have transition occur at index 0.
    const date = error.timestamp.split("T")[0]
    const time = error.timestamp.split("T")[1].split(".")[0]
    return (
    <CSSTransition
      key={errors.length - 1 - i}
      classNames="error"
      timeout={{enter: 500, exit: 300}}
      >

      <li className="show-temp">
          <div className="card-power-alert priority-3">
            <svg viewBox="0 0 20 20">
              <path d="m.902 17.5 9.098-14.557 9.098 14.557z" fill="#fff200" />
              <path d="m10 3.8868 8.19575 13.1132h-16.3915zm0-1.8868-10 16h20z" />
              <path d="m11 15h-2v-2h2zm0-8h-2v4.66667h2z" />
            </svg>
            <p className="title"><u>{date}</u> at {time}</p>
            <p className="metadata"><b>Nacelle Temp.</b>: {error.tempNacelle?.toFixed(1)} °C</p>
            <p className="metadata"><b>Generator Temp.</b>: {error.tempGenerator?.toFixed(1)} °C</p>
            <p className="metadata"><b>Gear Box Temp.</b>: {error.tempGearBox?.toFixed(1)} °C</p>
          </div>
      </li>
    </CSSTransition>
  )
  });

  return (
    <div>
      <div className="card-power-status priority-5">
        <svg className="minimize-error-panel" style={{padding: 0, marginRight: "15px"}} onClick={deactivateWidget}>
          <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
          <title>Minimize</title>
        </svg>
        <svg className="back-button" onClick={() => displayAggregate()} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m11 3a1.00006 1.00006 0 0 1 1 1v8a.99991.99991 0 0 1 -1.4961.8682l-7.0001-4a1 1 0 0 1 0-1.7364l7.0001-4a.99862.99862 0 0 1 .4961-.1318z"/></svg>
        <p className="title"><b>Turbine ID: <u>{temperature.id}</u></b></p>
        <p className="metadata"><b>Temp. Nacelle</b>: {temperature.tempNacelle?.toFixed(1)} °C</p>
        <p className="metadata"><b>Temp. Generator</b>: {temperature.tempGenerator?.toFixed(1)} °C</p>
        <p className="metadata"><b>Temp. Gear Box</b>: {temperature.tempGearBox?.toFixed(1)} °C</p>
      </div>
      <div>
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Temperature Warnings:</u></h3> <br />
        <ul id="list">
          <TransitionGroup>
            {items}
          </TransitionGroup>
        </ul>
      </div>
    </div>
  )
}

function ErrorListComponent() {

  return (
    <div id="error-component">
    </div>
  )
}

export class ErrorUiItemsProvider implements UiItemsProvider {
  public readonly id = "ErrorUiProvider";

  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {

    const widgets: AbstractWidgetProps[] = []
    if (stageId === "DefaultFrontstage" && location === StagePanelLocation.Right) {
      widgets.push({
        id: "addonWidget",
        getWidgetContent: () => <ErrorListComponent />,
      });
    }

    return widgets;
  }
}
