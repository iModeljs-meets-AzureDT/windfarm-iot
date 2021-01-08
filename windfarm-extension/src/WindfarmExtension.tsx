import { Extension, IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend"
import { I18N } from "@bentley/imodeljs-i18n";
import { AbstractWidgetProps, CommonToolbarItem, StagePanelLocation, StagePanelSection, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract"
import { MarkupApp } from "@bentley/imodeljs-markup";
import * as ReactDOM from "react-dom";
import * as React from "react";
import "./WindFarm.scss";
import { ErrorPanelForm } from "./components/ErrorButton";
import { displayAggregate, ErrorUiItemsProvider } from "./providers/ErrorPovider";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import { PowerDecorator } from "./components/decorators/PowerDecorator";
import { TimeSeriesDiagram } from "./client/TimeSeriesDiagram";
import { AnimationTimer } from "./animation/AnimationTimer";
import ClockWidget from "./components/ClockWidget";
import { Range1d } from "@bentley/geometry-core";

export class WindfarmUiItemsProvider implements UiItemsProvider {
  public readonly id = "WindfarmProvider";
  public static i18n: I18N;
  private DEBUG_MODE_TOGGLE: boolean;
  
  public constructor(i18n: I18N) {
    WindfarmUiItemsProvider.i18n = i18n;
    this.DEBUG_MODE_TOGGLE = false;
  }

  public provideToolbarButtonItems(_stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage !== StageUsage.General ||
      toolbarUsage !== ToolbarUsage.ContentManipulation ||
      toolbarOrientation !== ToolbarOrientation.Vertical)
      return [];

    return [
      ToolbarItemUtilities.createActionButton(
        "windfarm-extension-button-notify",
        200,
        "icon-lightbulb",
        "Opened IModel",
        () => {
          displayAggregate();
        }
      ),
      ToolbarItemUtilities.createActionButton(
        "windfarm-debug-button",
        205,
        "icon-window",
        "Toggle Debug Mode",
        () => {
        PowerDecorator.markers.forEach(marker => {
            IModelApp.viewManager.dropDecorator(marker.sensorData);
            IModelApp.viewManager.dropDecorator(marker.windData);
            IModelApp.viewManager.dropDecorator(marker.temperatureData);
          });

          if (!this.DEBUG_MODE_TOGGLE) {
            ErrorPanelForm.togglePowerError(true, "WTG001");
            ErrorPanelForm.toggleTempError(true, "WTG001");
            ErrorPanelForm.togglePowerError(true, "WTG005");
            ErrorPanelForm.toggleTempError(true, "WTG005");
            ErrorPanelForm.togglePowerError(true, "WTG009");
            ErrorPanelForm.toggleTempError(true, "WTG009");
          } else {
            ErrorPanelForm.togglePowerError(false, "WTG001");
            ErrorPanelForm.toggleTempError(false, "WTG001");
            ErrorPanelForm.togglePowerError(false, "WTG005");
            ErrorPanelForm.toggleTempError(false, "WTG005");
            ErrorPanelForm.togglePowerError(false, "WTG009");
            ErrorPanelForm.toggleTempError(false, "WTG009");
          }
          this.DEBUG_MODE_TOGGLE = !this.DEBUG_MODE_TOGGLE;
        }
      ),
    ]
  }

  public provideWidgets(_stageId: string, stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection) {

    if (stageUsage === StageUsage.General &&
      location === StagePanelLocation.Bottom) {
        const widget: AbstractWidgetProps = {
          fillZone: true,
          label: "Time Series Browser",
          getWidgetContent: () => {
            return (<TimeSeriesDiagram />)
          }
        }
        return [widget];
      }
    return [];
    }
}

export class WindfarmExtension extends Extension {
  // Override the _defaultNs to setup a namespace.
  protected _defaultNs = "windfarm";
  public static viewport?: ScreenViewport;
  public static imodel?: IModelConnection;
  public static timer?: AnimationTimer;

  /** Invoked the first time this extension is loaded. */
  public async onLoad(): Promise<void> {
    // Wait for the localization to be loaded
    await this.i18n.getNamespace(this._defaultNs)!.readFinished;
    await MarkupApp.initialize();

    // Register UI Providers.
    UiItemsManager.register(new WindfarmUiItemsProvider(this.i18n));
    UiItemsManager.register(new ErrorUiItemsProvider());

    // Add your initialization code here
  }

  /** Invoked each time this extension is loaded. */
  public async onExecute(): Promise<void> {

    await IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
      WindfarmExtension.viewport = vp;
      WindfarmExtension.imodel = vp.iModel;

      WindfarmExtension.timer = new AnimationTimer(vp, 6);
      const duration = vp.view.scheduleScript!.computeDuration();
      const buffer = 60 * 1000;
      WindfarmExtension.timer.setOverrideDuration(Range1d.createXX(duration.low + buffer, duration.high - buffer));
      WindfarmExtension.timer.start();

      FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Off;
      // Keep bottom panel closed by default.
      FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState = StagePanelState.Off;

      // Add decorators.
      IModelApp.viewManager.addDecorator(new PowerDecorator());

      // You can pass the viewport/imodel as a prop instead, I made it part of the extension class to simplify the example.
      
      // We need a location to bind the component to.
      const ClockNode = document.createElement("div");
      ClockNode.id = "clock-widget";
      document.getElementById("root")?.appendChild(ClockNode);
  
      // We need a location to bind the component to.
      const MLNode = document.createElement("div");
      MLNode.id = "power-prediction-panel";
      document.getElementById("root")?.appendChild(MLNode);
  
      // We need a location to bind the component to.
      const ErrorNode = document.createElement("div");
      ErrorNode.id = "error-panel";
      document.getElementById("root")?.appendChild(ErrorNode);

      // Quick work around to hide sign in/sign out buttons in itwin-viewer.
      const header = document.getElementsByTagName("header")[0];
      (header as HTMLElement).style.display = "none";

      // Add clock widget.
      ReactDOM.render(<ClockWidget/>, document.getElementById("clock-widget"));
    
    });

  }
}

IModelApp.extensionAdmin.register(new WindfarmExtension("windfarm"));