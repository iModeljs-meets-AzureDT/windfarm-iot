import { RenderSchedule } from "@bentley/imodeljs-common";
import { IModelApp, RenderScheduleState, Tool, Viewport } from "@bentley/imodeljs-frontend";
// import { AnimationTimer } from "./AnimationTimer";
import timelineFile from "./blades.timeline.json";

interface QueryResults {
  id: string;
  model: any;
  roll: number;
  pitch: number;
  yaw: number;
}

interface BladeProps {
  elementId: string;
  modelId: string;
}

export class AnimationTool extends Tool {
  public static toolId = "Animation";
  public static get minArgs() { return 0; }
  public static get maxArgs() { return 1; }

  // public static timer: AnimationTimer;
  // Blade Ids
  //  0x2000000009f

  public run(vp: Viewport): boolean {
    // AnimationTool.timer = new AnimationTimer(vp);


    // this.programmatically(vp);
    // this.fromJson(vp);
    console.debug(vp.viewportId, "animation tool active");
    // vp.iModel.selectionSet.onChanged.addListener((ev) => {
    //   console.debug([...vp.iModel.selectionSet.elements]);
    // });
    // const script = this.getScriptFromJson(vp);

    this.getElements(vp).then((bladeElements) => {
      const script = this.createScript(vp, bladeElements.map((results) => ({ elementId: results.id, modelId: results.model.id}) as BladeProps));
      console.debug(script);
      vp.timePoint = script?.computeDuration().low;
      vp.displayStyle.scheduleScript = script;
    });

    // script?.modelTimelines.forEach()

    // AnimationTool.timer.start();
    // console.debug("Timer: ",  AnimationTool.timer.isPlaying ? "Start" : "Paused");
    // SELECT * FROM DgnCustomItemTypes_WindEnergy.Blades
    console.debug(Date.now());

    return true;
  }

  public parseAndRun(...args: string[]): boolean {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return false;
    return this.run(vp);
  }

  private async getElements(vp: Viewport) {
    const rows = [];
    const query = "SELECT ECInstanceID,Roll,Pitch,Yaw,Model FROM DgnCustomItemTypes_WindEnergy.Blades";
    for await (const row of vp.iModel.query(query))
      rows.push(row);
    console.log(rows);
    return rows as QueryResults[];
  }

  private createScript(vp: Viewport, elements: BladeProps[]): RenderScheduleState.Script | undefined {
    const script = new RenderScheduleState.Script(vp.displayStyle.id);
    const timeNow = Date.now(), timeEnd = timeNow + 1000.0 * 60.0 * 60.0;
    const modelTimeline: RenderSchedule.ModelTimelineProps = { modelId: "", elementTimelines: [] };
    const elementTimeline: RenderSchedule.ElementTimelineProps = { batchId: 1, elementIds: []};

    const fadeOutTimeline = new Array<RenderSchedule.VisibilityEntryProps>();
    fadeOutTimeline.push({ time: timeNow, interpolation: 2, value: 0.0 });
    fadeOutTimeline.push({ time: timeEnd, interpolation: 2, value: 100.0 });
    elementTimeline.visibilityTimeline = fadeOutTimeline;
    modelTimeline.elementTimelines.push(elementTimeline);

    elements.forEach((props) => {
      modelTimeline.modelId = props.modelId;
      elementTimeline.elementIds = [props.elementId];
      script.modelTimelines.push(RenderScheduleState.ModelTimeline.fromJSON(modelTimeline));
    });
    // vp.view.forEachModel((model) => {
    //   modelTimeline.modelId = model.id;
    //   script.modelTimelines.push(RenderScheduleState.ModelTimeline.fromJSON(modelTimeline));
    // });
    return script;
  }

  private getScriptFromJson(vp: Viewport): RenderScheduleState.Script | undefined {
    const script = RenderScheduleState.Script.fromJSON(vp.displayStyle.id, (timelineFile as any))
    return script;
  }

}
