import * as React from "react";
import { PowerDecorator } from "./components/decorators/PowerDecorator";

export class ErrorToggle extends React.Component<{}> {

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


