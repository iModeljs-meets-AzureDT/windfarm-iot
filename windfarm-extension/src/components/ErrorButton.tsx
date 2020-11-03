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
      this.disableErrorSimulation();
    }
    this.setState({ collapsed });
  }

  public componentWillUnmount() {
    this.disableErrorSimulation();
  }

  private disableErrorSimulation() {
    PowerDecorator.markers.forEach((marker) => {
      marker.errorSimulation = false;
      marker.temperatureData.marker.errorSimulation = false;
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
              <span>Error Simulation</span>
            </div>
            <svg className="minimize-button control-pane-minimize" onClick={this.switchCollapse.bind(this)}>
              <use href="/imjs_extensions/windfarm/icons.svg#minimize"></use>
              <title>Minimize</title>
            </svg>
          </div>

          <ErrorPanelForm></ErrorPanelForm>
        </div>
      </>
    );
  }
}

export class ErrorPanelForm extends React.Component<{}> {

  private togglePowerError(toggled: boolean, id: string) {

    PowerDecorator.markers.forEach((marker) => {
      if (marker.id === id) {
        if (toggled) {
          marker.errorSimulation = true;
        } else {
          marker.errorSimulation = false;
        }
      }
    })
  }

  private toggleTempError(toggled: boolean, id: string) {

    PowerDecorator.markers.forEach((marker) => {
      if (marker.id === id) {
        if (toggled) {
          marker.temperatureData.marker.errorSimulation = true;
        } else {
          marker.temperatureData.marker.errorSimulation = false;
        }
      }
    })
  }

  public render() {
    return (
      <div>
        <hr></hr>
        <form id="ml-form">
          <p className="ml-p">
            <label className="ml-label">T1 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG001")}}></Toggle></label>
            <label className="ml-label">  TEMP: </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG001")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T2 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG002")}}></Toggle></label>
            <label className="ml-label">  TEMP: </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG002")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T3 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG003")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG003")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T4 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG004")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG004")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T5 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG005")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG005")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T6 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG006")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG006")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T7 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG007")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG007")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T8 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG008")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG008")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T9 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG009")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG009")}}></Toggle></label>
          </p>
          <p className="ml-p">
            <label className="ml-label">T10 | POW : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.togglePowerError(toggled, "WTG010")}}></Toggle></label>
            <label className="ml-label">  TEMP : </label>
            <label className="ml-label"><Toggle onChange={(toggled: boolean) => { this.toggleTempError(toggled, "WTG010")}}></Toggle></label>
          </p>
        </form>
      </div>
    )
  }
}


