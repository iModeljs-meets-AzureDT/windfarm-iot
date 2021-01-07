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

  static togglePowerError(toggled: boolean, id: string) {

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

  static toggleTempError(toggled: boolean, id: string) {

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
}


