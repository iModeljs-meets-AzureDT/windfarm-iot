import { Extension, IModelApp, IModelConnection, NotifyMessageDetails, OutputMessagePriority, ScreenViewport } from "@bentley/imodeljs-frontend"
import { I18N } from "@bentley/imodeljs-i18n";
import { AbstractWidgetProps, BackstageItem, BackstageItemsManager, CommonToolbarItem, StagePanelLocation, StagePanelSection, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsApplication, UiItemsApplicationAction, UiItemsArbiter, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract"
import { MarkupApp } from "@bentley/imodeljs-markup";
import PowerPredictionPanel from "./components/MLButton";
import * as ReactDOM from "react-dom";
import * as React from "react";

import "./WindFarm.scss";
import { PowerDecorator } from "./components/decorators/PowerDecorator";
import ErrorPanel from "./components/ErrorButton";
import { displayAggregate, ErrorUiItemsProvider } from "./providers/ErrorPovider";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";

(window as any).DEBUG_MODE = false;

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
          if (!this.DEBUG_MODE_TOGGLE) {
            ReactDOM.render(<PowerPredictionPanel></PowerPredictionPanel>, document.getElementById("power-prediction-panel"));
            ReactDOM.render(<ErrorPanel></ErrorPanel>, document.getElementById("error-panel"));
            (window as any).DEBUG_MODE = true;
          } else {
            ReactDOM.unmountComponentAtNode(document.getElementById("power-prediction-panel")!);
            ReactDOM.unmountComponentAtNode(document.getElementById("error-panel")!);
            (window as any).DEBUG_MODE = false;
          }
          this.DEBUG_MODE_TOGGLE = !this.DEBUG_MODE_TOGGLE;
        }
      )
    ]
  }
}

export class WindfarmExtension extends Extension {
  // Override the _defaultNs to setup a namespace.
  protected _defaultNs = "windfarm";
  public static viewport?: ScreenViewport;
  public static imodel?: IModelConnection;

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
    // UiItemsManager.register(new ErrorUiItemsProvider());

    // We need a location to bind the component to.
    const MLNode = document.createElement("div");
    MLNode.id = "power-prediction-panel";
    document.getElementById("root")?.appendChild(MLNode);

    // We need a location to bind the component to.
    const ErrorNode = document.createElement("div");
    ErrorNode.id = "error-panel";
    document.getElementById("root")?.appendChild(ErrorNode);

    await IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
      WindfarmExtension.viewport = vp;
      WindfarmExtension.imodel = vp.iModel;

      FrontstageManager.activeFrontstageDef!.rightPanel!.panelState = StagePanelState.Off;
      // Add decorators.
      IModelApp.viewManager.addDecorator(new PowerDecorator());
    });

  }
}

IModelApp.extensionAdmin.register(new WindfarmExtension("windfarm"));