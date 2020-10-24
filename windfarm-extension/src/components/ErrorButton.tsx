import * as React from "react";
import { Button, ButtonSize, ButtonType, Toggle } from "@bentley/ui-core";
import { PowerDecorator } from "./decorators/PowerDecorator";

export default class ErrorPanel extends React.Component<{}, { collapsed: boolean} > {

  public componentDidMount() {
    this.setState({ collapsed: true });
  }

  private switchCollapse() {
    const collapsed = !this.state.collapsed;
    if (collapsed) {
      this.disableDisaster();
    }
    this.setState({ collapsed });
  }

  private disableDisaster() {
    PowerDecorator.markers.forEach((marker) => {
      marker.disableError();
    })
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
        <div className="sample-error-ui">
          <div className="error-pane-header">
            <div className="sample-instructions">
              <span>Disaster Emulator</span>
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

  private triggerDisaster(id: string) {
    PowerDecorator.markers.forEach((marker) => {
      if (marker.id === id) {
        marker.toggleError();
      }
    })
  }

  public render() {
    return (
      <div>
        <hr></hr>
        <form id="ml-form">
          <p className="ml-p">
            <label className="ml-label">Turbine 1</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG001")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 2</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG002")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 3</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG003")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 4</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG004")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 5</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG005")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 6</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG006")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 7</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG007")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 8</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG008")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 9</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG009")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">Turbine 10</label>
            <label className="ml-label"><Toggle onChange={() => { this.triggerDisaster("WTG010")}}></Toggle></label>
          </p>
        </form>
      </div>
    )
  }
}


