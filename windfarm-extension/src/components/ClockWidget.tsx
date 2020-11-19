import { FitViewTool, IModelApp, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import * as React from "react";
import Clock from "react-clock";
import 'react-clock/dist/Clock.css';
import Draggable from 'react-draggable';
import MLClient from "../client/MLClient";
import { TimeSeries } from "../client/TimeSeries";
import { PowerDecorator } from "./decorators/PowerDecorator";
import HoverImage from "./HoverImage";
import Reveal, { AttentionSeeker, Fade } from "react-awesome-reveal";
import { keyframes } from "@emotion/core";
import { WindfarmExtension } from "../WindfarmExtension";

export default class ClockWidget extends React.Component<{}, { 
    time: Date, 
    powerReading: string, 
    futureMode: boolean, 
    minimized:boolean }> {

    private turbinePower: Map<string, number> = new Map();
    private savedView?: ViewState;
    private firstRender = true;
    private predictedData: any[] = [];

    constructor() {
        super({});
        this.state = { time: new Date(), powerReading: "0", futureMode: false, minimized: true };
        this.dropMarkers();
        setInterval(() => {
            if (!this.state.futureMode)
                this.setState({time: new Date()});
        }, 1000);
        this.addDataListener()
        this.addErrorWidgetEventListener();
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    private addDataListener = () => {
        (window as any).adtEmitter.on('powerevent', (data: any) => {​​
            this.turbinePower.set(data["$dtId"], data["powerObserved"])
            if (!this.state.futureMode) this.updatePowerReading();
        });
    }

    private addErrorWidgetEventListener() {
        (window as any).errorWidgetOpened = () => {
            if (this.state.futureMode) {
                TimeSeries.loadPredictedData(this.predictedData);
            }
        }
    }

    private updatePowerReading() {
        let powerReading = 0;
        for (const [_tId, power] of this.turbinePower)
            powerReading += power;
        
        powerReading = Math.round(powerReading * 10) / 10
        this.setState({powerReading: this.numberWithCommas(powerReading)});
    }

    private showTsiData = () => {
        if (!this.state.futureMode) 
            TimeSeries.loadPowerForAllTurbines();
        TimeSeries.showTsiGraph();
    }

    private futureModeToggled = async () => {
        if (this.state.futureMode === true){
            this.setState({futureMode: false});
            this.resetView();
        }
        else {
            this.setState({futureMode: true});
            this.configureView();
            this.runPowerPrediction();
        }
    }

    private minimizeToggled = () => {
        if (this.state.minimized === true){
            this.setState({minimized: false});
            this.addMarkers();
            this.dockAppear();
        }
        else {
            this.setState({minimized: true});
            this.dropMarkers();
            this.dockDisappear();
        }
    }

    private dockAppear() {
        const dock = document.getElementById("clock-dock");

        dock?.animate([
            { opacity: 1.0 }, 
            { opacity: 0.0 }
          ], {duration: 500, fill: "forwards", easing: "ease-out"});
    }

    private dockDisappear() {
        const dock = document.getElementById("clock-dock");

        dock?.animate([
            { opacity: 0.0 }, 
            { opacity: 1.0 }
          ], {duration: 500, delay: 500, fill: "forwards", easing: "ease-out"});
    }


    private resetView() {
        this.addMarkers();
        TimeSeries.loadPowerForAllTurbines();
        this.setState({time: new Date()});
        if (this.savedView){
            // restore view
        }
    }

  private configureView() {
    this.savedView = IModelApp.viewManager.selectedView!.view.clone();
    // IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
    const allElements: any = [];
    PowerDecorator.markers.forEach(marker => {
      allElements.push(marker.cId)
      allElements.push(marker.sId)
      allElements.push(marker.bId)
    });

    WindfarmExtension.viewport?.zoomToElements(allElements, { animateFrustumChange: true, standardViewId: StandardViewId.RightIso });
    this.dropMarkers();
  }

    private dropMarkers() {
        PowerDecorator.markers.forEach(marker => {
            IModelApp.viewManager.dropDecorator(marker.sensorData);
            IModelApp.viewManager.dropDecorator(marker.windData);
            IModelApp.viewManager.dropDecorator(marker.temperatureData);
            marker.visible = false;
          });
    }

    private addMarkers() {
        PowerDecorator.markers.forEach(marker => {​​​​​​​​
            marker.visible = true;
             }​​​​​​​​);
    }

    private runPowerPrediction = async() => {
        this.predictedData = await MLClient.getPredictedMLPower();
        TimeSeries.showTsiGraph();
        TimeSeries.loadPredictedData(this.predictedData);

        for (let i = 0; i < this.predictedData.length; i++) {
            if (!this.state.futureMode) break;

            const targetTime = new Date(this.predictedData[i].originSysTime);
            const powerDm = Math.round(this.predictedData[i].power_DM * 100) / 10;
            this.setState({time: targetTime, powerReading: this.numberWithCommas(powerDm)});

            if (i === (this.predictedData.length - 1)) {
                this.setState({futureMode: false});
                this.resetView();
            }
            else {
                const nextTargetTime = new Date(this.predictedData[i+1].originSysTime);
                this.animateClock(targetTime, nextTargetTime);
                this.animateTimeline(i, this.predictedData.length);
            }
            
            await this.sleep(1000);
        }
    }

    private numberWithCommas(x: number) {
        return x.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    private animateClock(fromTime: Date, toTime: Date) {
        const animationFrames = 30;
        const timeDifference = toTime.getTime() - fromTime.getTime();
        const stepSpan = timeDifference / animationFrames;
        for (let step = 1; step < animationFrames; step++) {
            setTimeout(() => {
                const nextTime = new Date(fromTime.getTime() + step * stepSpan);
                if (this.state.futureMode) 
                    this.setState({time: nextTime})
            }, (step * stepSpan) / 1000);
          }
    }

    private animateTimeline = (stepIndex: number, stepCount: number) => {

        const boundRect = document.querySelector(".voronoiRect")?.getBoundingClientRect();
        if (!boundRect) return;
        const initialX = boundRect.left;
        const initialY = boundRect.top;
        const width = boundRect.width;
        const step = width / stepCount;

        if ((stepIndex*step) <= (initialX + width)) {
            const timelineBar = document.getElementById("clock-timeline-bar");

            const keyFrames = [
                { transform: `translate(${initialX + step*stepIndex}px, ${initialY}px)` }, 
                { transform: `translate(${initialX + step*(stepIndex+1)}px, ${initialY}px)` }
              ]
            timelineBar?.animate(keyFrames, {duration: 1000});
        }
    }

    private getEntryAnimation = () => {
        return keyframes`
        from {
            opacity: 0.1;
            transform: translate(-50vw, -50vh) scale(0.001, 0.001);
        }

        to {
            opacity: 1;
            transform: translate(200px, -700px) scale(1, 1);
        }`;
    }

    private getExitAnimation = () => {
        return keyframes`
        from {
            opacity: 1;
            transform: scale(1, 1) translate(200px, -700px);
        }

        to {
            opacity: 0.1;
            transform: translate(-50vw, -50vh) scale(0.001, 0.001);
        }`;
    }

    public render() {
        const animDuration = this.firstRender ? 0 : 1000;
        this.firstRender = false;
        const clockAnimation = this.state.minimized ? this.getExitAnimation() : this.getEntryAnimation();
        const futureModeAnimation = this.state.futureMode ? "shake" : undefined;
        const flashDuration = this.state.futureMode ? 1500 : 0;
        const predictionIconImg: string = this.state.futureMode ? "future-selected.png" : "future.png";

        return (
            <>
                <div id="clock-dock" className="clock-dock" title="Performance Watchdog" onClick={this.minimizeToggled}>
                    <img src="clock.png"/>
                </div>
                <Reveal keyframes={clockAnimation} duration={animDuration}>
                    <AttentionSeeker effect={futureModeAnimation} duration={flashDuration}>
                        <Draggable>
                            <div className="clock-widget">
                                <Clock value={new Date(this.state.time)} size={130} renderSecondHand={!this.state.futureMode}/>
                                <div className="minimize-icon" title="Minimize" onClick={this.minimizeToggled}>
                                    <HoverImage src="minimize.png" hoverSrc="minimize-selected.png"/>
                                </div>
                                <div className="prediction-icon" title="Power Prediction" onClick={this.futureModeToggled}>
                                    <HoverImage src={predictionIconImg} hoverSrc="future-selected.png"/>
                                </div>
                                <div className="power-reading" onDoubleClick={this.showTsiData}>
                                    <div className="title">Power Output:</div>
                                    {this.state.powerReading} kW
                                </div>
                            </div>
                        </Draggable>
                    </AttentionSeeker>
                </Reveal>
                <div id= "clock-timeline-bar" className="timeline-bar" hidden={!this.state.futureMode}>
                    <div id = "timelineHandle" className="power-handle">
                        {this.state.powerReading}
                    </div>
                </div>
            </>
        );
    }
}
