import * as React from "react";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";

export default class ErrorPanel extends React.Component<{}, { collapsed: boolean} > {

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
          <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-error-pane-button" onClick={this.switchCollapse.bind(this)}>Error Simulator</Button>
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
              <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
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

  private async alertData(e: any) {
    e.preventDefault();

    const messageBody: any = {};

    try {
    [...document.getElementsByClassName("ml-input")].forEach((mlInput) => {
      let inputElement = mlInput as HTMLInputElement;
      if (inputElement.name === "originSysTime") {
        messageBody[inputElement.name] = inputElement.value;
      } else {
        messageBody[inputElement.name] = parseFloat(inputElement.value);
      }
    })

    } catch (error) {
      console.error(error);
    }
  }

  public render() {
    return (
      <div>
        <hr></hr>
        <form id="ml-form">
          <p className="ml-p">
            <label className="ml-label">Turbine Number</label>
            <label className="ml-label">Actual Power </label>
            <label className="ml-label">Physical Model Power </label>
            <label className="ml-label">Data Model Power </label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 10: </label>
            <input type="text" name="pitchAngle1" className="ml-input" defaultValue="1.99"></input> <br />
            <input type="text" name="pitchAngle1" className="ml-input" defaultValue="1.99"></input> <br />
            <input type="text" name="pitchAngle1" className="ml-input" defaultValue="1.99"></input> <br />
          </p>
          <p className="ml-p">
            <Button className="ml-submit" size={ButtonSize.Large} buttonType={ButtonType.Blue} onClick={this.alertData.bind(this)}>Submit</Button>
            <div className="ml-label"><label>Predicted Power: </label><textarea readOnly id="ml-power-result"></textarea></div> <br />
          </p>
        </form>
      </div>
    )
  }
}


