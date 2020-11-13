import { FitViewTool, IModelApp, ViewState } from "@bentley/imodeljs-frontend";
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

export default class ClockWidget extends React.Component<{}, { 
    time: Date, 
    powerReading: string, 
    futureMode: boolean, 
    minimized:boolean }> {

    private turbinePower: Map<string, number> = new Map();
    private savedView?: ViewState;
    private firstRender = true;

    constructor() {
        super({});
        this.state = { time: new Date(), powerReading: "0", futureMode: false, minimized: true };
        this.dropMarkers();
        setInterval(() => {
            if (!this.state.futureMode)
                this.setState({time: new Date()});
        }, 1000);
        this.addDataListener()
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
        }
        else {
            this.setState({minimized: true});
            this.dropMarkers();
        }
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
        IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
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
        const predictedData: any[] = await MLClient.getPredictedMLPower();
        TimeSeries.showTsiGraph();
        TimeSeries.loadPredictedData(predictedData);

        for (let i = 0; i < predictedData.length; i++) {
            if (!this.state.futureMode) break;

            const targetTime = new Date(predictedData[i].originSysTime);
            const powerDm = Math.round(predictedData[i].power_DM * 100) / 10;
            this.setState({time: targetTime, powerReading: this.numberWithCommas(powerDm)});
             
            if (i === (predictedData.length - 1)) {
                this.setState({futureMode: false});
                this.resetView();
            }
            else {
                const nextTargetTime = new Date(predictedData[i+1].originSysTime);
                this.animateClock(targetTime, nextTargetTime);
                this.animateTimeline(i);
            }
            
            await this.sleep(1000);
        }
    }

    private numberWithCommas(x: number) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    private animateClock(fromTime: Date, toTime: Date) {
        const animationFrames = 30;
        const timeDifference = toTime.getTime() - fromTime.getTime();
        const stepSpan = timeDifference / animationFrames;
        for (let step = 1; step < animationFrames; step++) {
            setTimeout(() => {
                const nextTime = new Date(fromTime.getTime() + step * stepSpan);
                if (this.state.futureMode) 
                    this.setState({time: nextTime })
            }, (step * stepSpan) / 1000);
          }
    }

    private animateTimeline = (stepIndex: number) => {

        const boundRect = document.querySelector(".voronoiRect")?.getBoundingClientRect();
        if (!boundRect) return;
        const initialX = boundRect.left;
        const initialY = boundRect.top;
        const width = boundRect.width;
        const step = width / 84;
        debugger;

        if ((stepIndex*step) <= (initialX + width)) {
            const timelineBar = document.getElementById("timelineBar");

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
        const dockFadeDelay = this.state.minimized ? 500 : 0;
        const futureModeAnimation = this.state.futureMode ? "shake" : undefined;
        const flashDuration = this.state.futureMode ? 1500 : 0;
        const predictionIconImg: string = this.state.futureMode ? "future-selected.png" : "future.png";

        return (
            <>
                <Fade reverse={!this.state.minimized} duration={500} delay={dockFadeDelay}>
                    <div className="clock-dock" title="Performance Watchdog" onClick={this.minimizeToggled}>
                        <img src="clock.png"/>
                    </div>
                </Fade>
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
                <div id= "timelineBar" className="timeline-bar" hidden={!this.state.futureMode}/>
            </>
        );
    }
}

// 1328