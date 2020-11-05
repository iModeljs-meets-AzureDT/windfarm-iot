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

// The lists continue to grow but we shouldn't pollute the DOM.
const MAX_ELEMENTS = 12;

function deactivateWidget() {
  FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Off;
}

export function displayAggregate() {
  ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
  ReactDOM.render(<AggregateErrorList></AggregateErrorList>, document.getElementById("error-component"));
  FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Open;
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
        if (markerId === marker.id && errorType === "Power Alert") {
          // Remove all other markers.
          PowerDecorator.markers.forEach(otherMarkers => {
            otherMarkers.clicked = false;
            otherMarkers.worldLocation = new Point3d(otherMarkers.initialLocation.x, otherMarkers.initialLocation.y, otherMarkers.initialLocation.z);
          });
          marker.clicked = true;
          marker.worldLocation = new Point3d(marker.initialLocation.x, marker.initialLocation.y + 65, marker.initialLocation.z - 25);

          WindfarmExtension.viewport?.zoomToElements([marker.cId, marker.sId, marker.bId], { animateFrustumChange: true, standardViewId: StandardViewId.Right });
          ReactDOM.unmountComponentAtNode(document.getElementById("error-component")!);
          ReactDOM.render(<DetailedPowerErrorList turbinePower={marker}></DetailedPowerErrorList>, document.getElementById("error-component"));
          return;
        } else if (markerId === marker.id && errorType === "Temperature Alert") {
          WindfarmExtension.viewport?.zoomToElements([marker.cId, marker.sId, marker.bId], { animateFrustumChange: true, standardViewId: StandardViewId.Right });

          // Remove all other markers.
          PowerDecorator.markers.forEach(otherMarkers => {
            otherMarkers.clicked = false;
            otherMarkers.worldLocation = new Point3d(otherMarkers.initialLocation.x, otherMarkers.initialLocation.y, otherMarkers.initialLocation.z);
          });
          marker.clicked = true;
          marker.worldLocation = new Point3d(marker.initialLocation.x, marker.initialLocation.y + 65, marker.initialLocation.z - 25);

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


    /*
            <div>Turbine: {error.id} <br></br>
              Type: {error.errorType} <br></br>
              <span className="time-caption">Since {timeStart}</span>
            </div>
            */
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
        <table style={{borderCollapse: "collapse"}} cellSpacing="0" cellPadding="0">
          <tr>
            <td>
              <u>{date}</u> <br></br> {time}
            </td>
            <td>
              <ul>
                  <li> OB: {error.powerObserved?.toFixed(2)} </li>
                  <li> PM: {error.powerPM?.toFixed(2)} </li>
                  <li> DM: {error.powerDM?.toFixed(2)} </li>
              </ul>
            </td>
          </tr>
        </table>
      </li>
    </CSSTransition>
  )
  });

  return (
    <div>
      <svg className="minimize-error-panel" onClick={deactivateWidget}>
        <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
        <title>Minimize</title>
      </svg>
      <button style={{float: "right", marginTop: "10px"}} onClick={displayAggregate}>Back</button>
      <div className="rcorners">
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Turbine: {power.id}</u></h3> <br />
        Observed: {power.observedPower.toFixed(2)} <br />
        Physical: {power.physicalPower.toFixed(2)} <br />
        Data Model: {power.datamodelPower.toFixed(2)} <br />
      </div>
      <div>
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Warnings:</u></h3> <br />
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
        <table style={{borderCollapse: "collapse"}} cellSpacing="0" cellPadding="0">
          <tr>
            <td>
              <u>{date}</u> <br></br> {time}
            </td>
            <td>
              <ul>
                  <li> NA: {error.tempNacelle?.toFixed(2)} </li>
                  <li> GN: {error.tempGenerator?.toFixed(2)} </li>
                  <li> GB: {error.tempGearBox?.toFixed(2)} </li>
              </ul>
            </td>
          </tr>
        </table>
      </li>
    </CSSTransition>
  )
  });

  return (
    <div>
      <svg className="minimize-error-panel" onClick={deactivateWidget}>
        <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
        <title>Minimize</title>
      </svg>
      <button style={{float: "right", marginTop: "10px"}} onClick={displayAggregate}>Back</button>
      <div className="rcorners">
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Turbine: {temperature.id}</u></h3> <br />
        Nacelle: {temperature.tempNacelle.toFixed(2)} <br />
        Generator: {temperature.tempGenerator.toFixed(2)} <br />
        GearBox: {temperature.tempGearBox.toFixed(2)} <br />
      </div>
      <div>
        <h3 style={{margin: "0", marginBottom: "-13px"}}><u>Warnings:</u></h3> <br />
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
