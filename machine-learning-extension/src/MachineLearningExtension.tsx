import { Extension, IModelApp, IModelConnection, NotifyMessageDetails, OutputMessagePriority, ScreenViewport } from "@bentley/imodeljs-frontend"
import { I18N } from "@bentley/imodeljs-i18n";
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract"
import { MarkupApp } from "@bentley/imodeljs-markup";
import MachineLearningPanel from "./components/MLButton";
import * as ReactDOM from "react-dom";
import * as React from "react";

import "./MachineLearning.scss";
import { UiFramework } from "@bentley/ui-framework";

export class MachineLearningUiItemsProvider implements UiItemsProvider {
  public readonly id = "MachineLearningProvider";
  public static i18n: I18N;
  
  public constructor(i18n: I18N) {
    MachineLearningUiItemsProvider.i18n = i18n;
  }

  public provideToolbarButtonItems(_stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage !== StageUsage.General ||
      toolbarUsage !== ToolbarUsage.ContentManipulation ||
      toolbarOrientation !== ToolbarOrientation.Vertical)
      return [];

    return [
      ToolbarItemUtilities.createActionButton(
        "machinelearningextension-button-notify",
        200,
        "icon-lightbulb",
        "Machine Learning",
        () => {
          IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "The opened imodel is " + MachineLearningExtension.imodel!.name));
        }
      ),
      ToolbarItemUtilities.createActionButton(
        "machinelearningextension-button-backstage",
        205,
        "icon-window",
        "Machine Learning Backstage",
        () => {
          UiFramework.backstageManager.toggle();
        }
      )
    ]
  }

}


export class MachineLearningExtension extends Extension {
  // Override the _defaultNs to setup a namespace.
  protected _defaultNs = "machinelearning";
  public static viewport?: ScreenViewport;
  public static imodel?: IModelConnection;

  /** Invoked the first time this extension is loaded. */
  public async onLoad(): Promise<void> {
    // Wait for the localization to be loaded
    await this.i18n.getNamespace(this._defaultNs)!.readFinished;

    await MarkupApp.initialize();

    UiItemsManager.register(new MachineLearningUiItemsProvider(this.i18n));
    // Add your initialization code here
  }

  /** Invoked each time this extension is loaded. */
  public async onExecute(): Promise<void> {

    // We need a location to bind the component to.
    const MLNode = document.createElement("div");
    MLNode.id = "machine-learning-panel";
    document.getElementById("root")?.appendChild(MLNode);

    await IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
      MachineLearningExtension.viewport = vp;
      MachineLearningExtension.imodel = vp.iModel;

      // You can pass the viewport/imodel as a prop instead, I made it part of the extension class to simplify the example.
      ReactDOM.render(<MachineLearningPanel></MachineLearningPanel>, document.getElementById("machine-learning-panel"));
    });
  }
}

IModelApp.extensionAdmin.register(new MachineLearningExtension("machinelearning"));