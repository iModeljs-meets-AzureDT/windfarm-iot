import { Marker, BeButtonEvent, StandardViewId, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { Point2d, Point3d, XAndY, XYAndZ } from "@bentley/geometry-core";
import { PowerMarker } from "./PowerMarker";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, StageUsage, UiItemsApplication, UiItemsApplicationAction, UiItemsArbiter, UiItemsManager, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { FillCentered } from "@bentley/ui-core";
import * as React from "react";
import { useState } from "react";
import { I18N } from "@bentley/imodeljs-i18n";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";

export class ErrorMarker extends Marker {

  // private errorListComponent: ErrorListComponent;

  constructor(powerMarker: PowerMarker) {
    super(powerMarker.worldLocation, powerMarker.size);
    this.size = new Point2d(25, 25)
    this.worldLocation = new Point3d(this.worldLocation.x, this.worldLocation.y, this.worldLocation.z + 15);
    const image = imageElementFromUrl(`/imjs_extensions/windfarm/bolt-hollow.svg`);
    this.setImage(image);
  }

  public onMouseButton(_ev: BeButtonEvent): any {
    if (_ev.isDown) {
      FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = FrontstageManager.activeFrontstageDef!.rightPanel!.panelState === StagePanelState.Open ? StagePanelState.Off : StagePanelState.Open;
    }
  }
}

export function ErrorListComponent(props: any = {turbineTitle: "DefaultTitle"}) {
  const [turbineTitle, setTurbineTitle] = useState(props.turbineTitle);

  return (
    <div>
      <p>Turbine: {turbineTitle}</p>
    </div>
  )
}
    
export class ErrorUiItemsProvider implements UiItemsProvider {
  public readonly id = "ErrorUiProvider";
  public static i18n: I18N;

  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): ReadonlyArray<AbstractWidgetProps> {

    const widgets: AbstractWidgetProps[] = []
    if (stageId === "DefaultFrontstage" && location === StagePanelLocation.Right) {
      widgets.push({
        id: "addonWidget",
        getWidgetContent: () => <ErrorListComponent {...{turbineTitle: "default"}} />,
      });
    }

    // Initialize right widget to be off..
    return widgets;
  }

  /*
  public onWidgetArbiterChange(_widget: AbstractWidgetProps, _action: UiItemsApplicationAction): void {
    console.log("WIDGET CHANGED");
    console.log(_widget);
  }
  */

}


