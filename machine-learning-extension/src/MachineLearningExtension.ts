import { Extension, IModelApp } from "@bentley/imodeljs-frontend"

export class MachineLearningExtension extends Extension {
  // Override the _defaultNs to setup a namespace.
  protected _defaultNs = "machinelearning";

  /** Invoked the first time this extension is loaded. */
  public async onLoad(): Promise<void> {
    // Wait for the localization to be loaded
    await this.i18n.getNamespace(this._defaultNs)!.readFinished;

    // Add your initialization code here
    alert(this.i18n.translate(`${this._defaultNs}:Hello`));
  }

  /** Invoked each time this extension is loaded. */
  public async onExecute(): Promise<void> {
    alert(this.i18n.translate(`${this._defaultNs}:HelloAgain`));
  }
}

IModelApp.extensionAdmin.register(new MachineLearningExtension("machinelearning"));