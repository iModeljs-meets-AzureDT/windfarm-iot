import { Extension, IModelApp, NotifyMessageDetails, OutputMessagePriority } from "@bentley/imodeljs-frontend"
import { I18N } from "@bentley/imodeljs-i18n";
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsManager, UiItemsProvider } from "@bentley/ui-abstract"
import { MarkupApp } from "@bentley/imodeljs-markup";
import MachineLearningPanel from "./components/MLButton";
import * as ReactDOM from "react-dom";
import * as React from "react";

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
        "machinelearningextension-button",
        200,
        "icon-lightbulb",
        "Machine Learning",
        () => {
          IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Machine learning button"));
        }
      )
    ]
  }

}


export class MachineLearningExtension extends Extension {
  // Override the _defaultNs to setup a namespace.
  protected _defaultNs = "machinelearning";

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
    ReactDOM.render(<MachineLearningPanel></MachineLearningPanel>, document.getElementById("machine-learning-panel"));
  }
}

IModelApp.extensionAdmin.register(new MachineLearningExtension("machinelearning"));