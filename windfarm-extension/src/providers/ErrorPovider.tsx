import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import * as React from "react";
import { useState } from "react";
import { PowerMarker } from "../components/markers/PowerMarker";
import { CSSTransition, TransitionGroup } from "react-transition-group"

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
    return (
    <CSSTransition
      key={errors.length - 1 - i}
      classNames="error"
      timeout={{enter: 500, exit: 300}}
      >

      <li className="show">{error.powerObserved}</li>
    </CSSTransition>
  )
  });

  return (
    <div>
      <div>
        <p>Turbine: {power.id} </p>
        <p>Observed Power: {power.observedPower.toFixed(2)}</p>
        <p>Physical Model power: {power.physicalPower.toFixed(2)}</p>
        <p>Data Model power: {power.datamodelPower.toFixed(2)}</p>
      </div>
      <div>
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
