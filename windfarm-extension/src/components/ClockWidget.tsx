import { FitViewTool, IModelApp } from "@bentley/imodeljs-frontend";
import * as React from "react";
import Clock from "react-clock";
import 'react-clock/dist/Clock.css';
import Draggable from 'react-draggable';
import MLClient from "../client/MLClient";
import { TimeSeries } from "../client/TimeSeries";
import { PowerDecorator } from "./decorators/PowerDecorator";
import HoverImage from "./HoverImage";

export default class ClockWidget extends React.Component<{}, { time: Date, powerReading: number }> {

    private turbinePower: Map<string, number> = new Map();
    private futureMode: boolean = false;

    constructor() {
        super({});
        this.state = { time: new Date(), powerReading: 0 };
        setInterval(() => {
            if (!this.futureMode)
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
            if (!this.futureMode) this.updatePowerReading();
        });
    }

    private updatePowerReading() {
        let powerReading = 0;
        for (const [_tId, power] of this.turbinePower)
            powerReading += power;
        powerReading = Math.round(powerReading * 10) / 10
        this.setState({powerReading});
    }

    private showTsiData = () => {
        if (!this.futureMode) 
            TimeSeries.loadPowerForAllTurbines();
        TimeSeries.showTsiGraph();
    }

    private futureModeToggled = async () => {
        if (this.futureMode === true){
            this.futureMode = false;
            this.resetView();
        }
        else {
            this.futureMode = true;
            this.runPowerPrediction();
            this.configureView();
        }
    }

    private resetView() {
        PowerDecorator.markers.forEach(marker => {​​​​​​​​
            marker.visible = true;
             }​​​​​​​​);
    }

    private configureView() {
        IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
        PowerDecorator.markers.forEach(marker => {
            IModelApp.viewManager.dropDecorator(marker.sensorData);
            IModelApp.viewManager.dropDecorator(marker.windData);
            IModelApp.viewManager.dropDecorator(marker.temperatureData);
            marker.visible = false;
          });
    }

    private runPowerPrediction = async() => {
        const predictedData: any[] = await MLClient.getPredictedMLPower();
        TimeSeries.showTsiGraph();
        TimeSeries.loadPredictedData(predictedData);

        for (let i = 1; i < predictedData.length; i++) {
            if (!this.futureMode) break;

            const targetTime = new Date(predictedData[i].originSysTime);
            const powerDm = Math.round(predictedData[i].power_DM * 100) / 10;
            this.setState({time: targetTime, powerReading: powerDm});
            
            if (i === (predictedData.length - 1))
                this.futureMode = false;
            else {
                const nextTargetTime = new Date(predictedData[i+1].originSysTime);
                this.animateClock(targetTime, nextTargetTime);
            }
            
            await this.sleep(1000);
        }


        // predictedData.forEach((entry, index) => {
        //     const targetTime = new Date(entry.originSysTime);
        //     const powerDm = Math.round(entry.power_DM * 100) / 10;
            
        //     setTimeout(() => {
        //         this.setState({time: targetTime, powerReading: powerDm});
        //         if (index === (predictedData.length - 1))
        //             this.futureMode = false;
        //         else {
        //             const nextTargetTime = new Date(predictedData[index+1].originSysTime);
        //             this.animateClock(targetTime, nextTargetTime);
        //         }
        //     }, 1000 * index);
        // });
    }

    private animateClock(fromTime: Date, toTime: Date) {
        const animationFrames = 30;
        const timeDifference = toTime.getTime() - fromTime.getTime();
        const stepSpan = timeDifference / animationFrames;
        for (let step = 1; step < animationFrames; step++) {
            setTimeout(() => {
                const nextTime = new Date(fromTime.getTime() + step * stepSpan);
                this.setState({time: nextTime })
            }, (step * stepSpan) / 1000);
          }
    }

    public render() {
        const predictionIconImg: string = this.futureMode ? "future-selected.png" : "future.png";

        return (
            <>
                <Draggable>
                    <div className="clock-widget">
                        <Clock value={new Date(this.state.time)} size={130} renderSecondHand={!this.futureMode}/>
                        <div className="minimize-icon" title="Minimize">
                            <HoverImage src="minimize.png" hoverSrc="minimize-selected.png"/>
                        </div>
                        <div className="prediction-icon" title="Power Prediction" onClick={this.futureModeToggled}>
                            <HoverImage src={predictionIconImg} hoverSrc="future-selected.png"/>
                        </div>
                        <div className="power-reading" onDoubleClick={this.showTsiData}>{this.state.powerReading} kW</div>
                    </div>
                </Draggable>
            </>
        );
    }
}

