import * as React from "react";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core";
import MLClient from "../client/MLClient";
import { TimeSeries } from "../client/TimeSeries";

export default class PowerPredictionPanel extends React.Component<{}, { collapsed: boolean }> {

  private async alertData(e: any) {

    e.preventDefault();

    try {

      const response = await MLClient.getPredictedMLPower();
      TimeSeries.showTsiForPredictedData(response);


    } catch (error) {
      console.error(error);
    }
  }

  public render() {
    return (
      <>
        <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-control-pane-button" onClick={this.alertData.bind(this)}>Power Prediction</Button>
      </>
    );
  }
}

