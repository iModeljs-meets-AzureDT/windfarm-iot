import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import * as React from "react";
import { useState } from "react";
import * as ReactDOM from "react-dom";

// Error Component
export function ErrorList({ turbinePower }: any) {
  const [power, setPower] = useState({ id: turbinePower.id, observedPower: turbinePower.power, physicalPower: turbinePower.powerPM, datamodelPower: turbinePower.powerDM });
  const [errorList, setErrorList] = useState([]);

  React.useEffect(() => {
    function onPowerEvent(data: any) {
      if (power.id === data.$dtId) {
        setPower({ id: turbinePower.id, observedPower: data.powerObserved, physicalPower: data.powerPM, datamodelPower: data.powerDM })
      }
    }

    (window as any).adtEmitter.on("powerevent", onPowerEvent);

    return function cleanup() {
      console.log("we called cleanup");
      (window as any).adtEmitter.removeListener("powerevent", onPowerEvent);
    }
  })

  const addToList = () => {
    const list = document.getElementById('list');
    const newLI = document.createElement('li');
    newLI.innerHTML = 'A new item';
    newLI.className = newLI.className;
    list!.insertBefore(newLI, list!.firstChild);
    setTimeout(function () {
      newLI.className = newLI.className + "show";
    }, 10);
  }


  return (
    <div>
      <div>
        <p>Turbine: {power.id} </p>
        <p>Observed Power: {power.observedPower.toFixed(2)}</p>
        <p>Physical Model power: {power.physicalPower.toFixed(2)}</p>
        <p>Data Model power: {power.datamodelPower.toFixed(2)}</p>
      </div>
      <div className="slide-fade">
        <ul id="list">
          <li className="show">List item</li>
          <li className="show">List item</li>
        </ul>
        <button id="add-to-list" onClick={addToList}>Add a list item</button>
      </div>
    </div>
  )
}

function ErrorListComponent() {

  return (
    <div id="error-component" style={{ zIndex: 100 }}>
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
