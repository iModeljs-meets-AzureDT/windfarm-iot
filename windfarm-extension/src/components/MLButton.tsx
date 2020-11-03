import * as React from "react";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";
import MLClient from "../client/MLClient";
import { TimeSeries } from "../client/TimeSeries";

export default class PowerPredictionPanel extends React.Component<{}, { collapsed: boolean} > {

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
              <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
              <title>Minimize</title>
            </svg>
          </div>

          <PowerPredictionForm></PowerPredictionForm>
        </div>
      </>
    );
  }
}

export class PowerPredictionForm extends React.Component<{}> {

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

    const response = await MLClient.getPredictedMLPower();
    TimeSeries.showTsiForPredictedData(response);


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
            <Button className="ml-submit" size={ButtonSize.Large} buttonType={ButtonType.Blue} onClick={this.alertData.bind(this)}>Submit</Button>
          </p>
        </form>
      </div>
    )
  }
}

