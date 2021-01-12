/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { FrontstageManager, StagePanelState } from "@bentley/ui-framework";
import { TimeSeries } from "./TimeSeries";

enum TsiMode {
  hour2 = 1,
  min15
}

/** A widget control for browsing the building structure */
export class TimeSeriesDiagram extends React.Component<{}, {mode: TsiMode, hideButtons: boolean, title: string}> {

  constructor() {
    super({});
    this.state = {mode: TsiMode.hour2, hideButtons: false, title: ""};

    (window as any).futureModeOn = () => {this.setState({hideButtons: true})};
    (window as any).futureModeOff = () => {this.setState({hideButtons: false})};
    (window as any).setTsiTitle = (title: string) => {this.setState({title})};
  }

  public closeMyParent = (_event: any) => {
    FrontstageManager.activeFrontstageDef!.bottomPanel!.panelState = StagePanelState.Off;
  }

  private _switchTo8HourMode = (_event: any) => {
    this.setState({mode: TsiMode.hour2});
    TimeSeries.switchToNormalMode();
  }

  private _switchTo30MinMode = (_event: any) => {
    this.setState({mode: TsiMode.min15});
    TimeSeries.switchToLiveMode();
  }

  public render() {

    const hour8TabStyle = (this.state.mode === TsiMode.hour2) ? 
      {borderBottom: "0px", background: "white"} : {};
    const min30TabStyle = (this.state.mode === TsiMode.min15) ? 
      {borderBottom: "0px", background: "white", marginLeft: "0.5px"} : {marginLeft: "0.5px"};

    return (
      <>
          <button onClick={this.closeMyParent} style={{ float: "right", marginRight: "5px", marginTop: "5px", fontWeight: "bold", zIndex: 100, position: "relative" }}>X</button>
          <div style={{zIndex: 105, position: "relative" }}>
            <div className="time-series-title">{this.state.title}</div>
          </div>  
          <div hidden={this.state.hideButtons} style={{zIndex: 101, position: "relative" }}>
            <div className="diagram-tab" style={hour8TabStyle} onClick={this._switchTo8HourMode}>2 Hours</div>
            <div className="diagram-tab" style={min30TabStyle} onClick={this._switchTo30MinMode}>15 Minutes</div>
          </div>
          <div ref="diagramDIV" id="diagramDIV" style={{ width: "100%", height: "275px", marginTop: "-10px", marginLeft: "10px", pointerEvents: "auto" }} ></div>
      </>
    );
  }
}
