import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import * as React from "react";
import { useState } from "react";
import { PowerMarker } from "../components/markers/PowerMarker";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";

function deactivateWidget() {
  FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Off;
}
// Error Component
export function ErrorList({ turbinePower }: any) {
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

  const items = errors.map((error, i) => {
    // Reverse key to have transition occur at index 0.
    const date = error.timestamp.split("T")[0]
    const time = error.timestamp.split("T")[1].split(".")[0]
    return (
    <CSSTransition
      key={errors.length - 1 - i}
      classNames="error"
      timeout={{enter: 500, exit: 300}}
      >

      <li className="show">
        <table style={{borderCollapse: "collapse"}} cellSpacing="0" cellPadding="0">
          <tr>
            <td>
              <u>{date}</u> <br></br> {time}
            </td>
            <td>
              <ul>
                  <li> OB: {error.powerObserved?.toFixed(2)} </li>
                  <li> DM: {error.powerDM?.toFixed(2)} </li>
                  <li> PM: {error.powerPM?.toFixed(2)} </li>
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
