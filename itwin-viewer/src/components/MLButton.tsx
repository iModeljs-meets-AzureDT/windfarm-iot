import * as React from "react";
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@bentley/ui-abstract";
import { IModelApp, NotifyMessageDetails, OutputMessagePriority } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";

export class MachineLearningPanel extends React.Component<{}, { collapsed: boolean} > {

  public componentDidMount() {
    this.setState({ collapsed: true });
  }

  private switchCollapse() {
    const collapsed = !this.state.collapsed;
    this.setState({ collapsed });
  }

  public render() {
    if (this.state && this.state.collapsed) {
      return (
        <>
          <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-control-pane-button" onClick={this.switchCollapse.bind(this)}>Power Prediction</Button>
        </>
      );
    }
    return (
      <>
        <div className="sample-ui">
          <div className="control-pane-header">
            <div className="sample-instructions">
              <span>Input Parameters</span>
            </div>
            <svg className="minimize-button control-pane-minimize" onClick={this.switchCollapse.bind(this)}>
              <use href="icons.svg#minimize"></use>
              <title>Minimize</title>
            </svg>
          </div>

          <MachineLearningForm></MachineLearningForm>
        </div>
      </>
    );
  }
}

export class MachineLearningForm extends React.Component<{}> {

  private alertData(e: any) {
    e.preventDefault();

    const messageBody: any = {};

    [...document.getElementsByClassName("ml-input")].forEach((mlInput) => {
      let inputElement = mlInput as HTMLInputElement;
      if (inputElement.name === "originSysTime") {
        messageBody[inputElement.name] = inputElement.value;
      } else {
        messageBody[inputElement.name] = parseFloat(inputElement.value);
      }
    })

    console.log(JSON.stringify(messageBody));
  }


  public render() {
    return (
      <div>
        <hr></hr>
        <form id="ml-form">
          <p className="ml-p">
            <label className="ml-label">Blade 1 Pitch Angle: </label>
            <input type="text" name="pitchAngle1" className="ml-input" defaultValue="1.99"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Blade 1 Pitch Angle: </label>
            <input type="text" name="pitchAngle2" className="ml-input" defaultValue="2.02"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Blade 2 Pitch Angle: </label>
            <input type="text" name="pitchAngle3" className="ml-input" defaultValue="1.92"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Generator Speed: </label>
            <input type="text" name="genSpeed" className="ml-input" defaultValue="1212.28"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Generator Torque: </label>
            <input type="text" name="genTorque" className="ml-input" defaultValue="6824.49"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Time: </label>
            <input type="text" name="originSysTime" className="ml-input" defaultValue="7/29/2018 11:43:03"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Wind Direction: </label>
            <input type="text" name="windDirection" className="ml-input" defaultValue="-8.6"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Wind Speed: </label>
            <input type="text" name="windSpeed" className="ml-input" defaultValue="6.66"></input> <br />
          </p>
          <p className="ml-p">
            <label className="ml-label">Yaw Position: </label>
            <input type="text" name="yawPosition" className="ml-input" defaultValue="5.05"></input> <br />
          </p>
          <label className="ml-label"></label>
          <Button className="ml-submit" size={ButtonSize.Large} buttonType={ButtonType.Blue} onClick={this.alertData.bind(this)}>Submit</Button>
        </form>
      </div>
    )
  }
}

export class MachineLearningButton implements UiItemsProvider {
  public readonly id = "MLButtonProvider";
  /** provideToolbarButtonItems() is called for each registered UI provider as the Frontstage is building toolbars. We are adding an action button to the ContentManipulation Horizontal toolbar
   * in General use Frontstages.
   */
  public provideToolbarButtonItems(_stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage === StageUsage.General && toolbarUsage === ToolbarUsage.ContentManipulation && toolbarOrientation === ToolbarOrientation.Horizontal) {
      const simpleActionSpec = ToolbarItemUtilities.createActionButton("Open message box", 1000, "icon-lightbulb", "Added Tool", () => this.startTool());
      return [simpleActionSpec];
    }
    return [];
  }
  public startTool() {
    IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "A test button"));
  }
}
