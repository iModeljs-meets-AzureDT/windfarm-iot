import { IModelApp,  Viewport, RenderScheduleState } from "@bentley/imodeljs-frontend";
import {AnimationTimer} from "./AnimationTimer";
import React = require("react");
import { Slider } from "@bentley/ui-core";

interface PanelState {v?: Viewport, s?: RenderScheduleState.Script, t?: number};

export class  AnimationDebugPanel extends React.Component<{}, PanelState> {

  public state: PanelState = { s: undefined, v: undefined, t: undefined };

  public timer?: AnimationTimer;

  public dropListeners: Array<() => void> = [];

  componentDidMount() {
    console.log("mount");
    const vp = IModelApp.viewManager.selectedView;
    if (!vp)
      this.dropListeners.push(IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
      this.initViewport(viewport);
      }));
    else
      this.initViewport(vp);
  }

  componentWillUnmount() {
    console.log("unmount");
    this.dropListeners.forEach((callback: ()=>void) => callback());
    this.dropListeners.length = 0;
  }

  public readonly onSliderChange = (values: readonly number[]) => {
    const t = values[0];
    console.debug("poop", t);
    this.timer!.setTime(t);
    this.setState({t});
  }

  public initViewport(vp: Viewport): void {
    IModelApp.tools.run("Animation", vp);
    this.timer = new AnimationTimer(vp, 6);
    this.dropListeners.push(vp.onViewChanged.addListener((updateVp) => {
      const script = updateVp.displayStyle.scheduleScript;
      if (undefined === script || undefined === updateVp.timePoint)
        return;
      if (this.state.s === undefined || this.state.s!.computeDuration() !== script.computeDuration()) {
        this.timer!.start();
        this.setState({s: script, t: updateVp.timePoint });
      }
    }));
    this.setState({ v: vp, s: vp.displayStyle.scheduleScript, t: vp.timePoint });
    this.timer.start();
    this.dropListeners.push(this.timer.onAnimationTick.addListener((t) => this.setState({t})));
  }

  render() {
    const vp = this.state.v, script = this.state.s, time = this.state.t;
    const isReady = vp && script && time !== undefined && this.timer;

    return <div>
      {isReady ? 
      <Slider
        min={script!.computeDuration().low}
        max={script!.computeDuration().high}
        values={[time!]}
        step={(script!.computeDuration().length())/100}
      />
      : <></>}
    </div>;
  }
}
