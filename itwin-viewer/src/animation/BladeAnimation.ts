import { Matrix3d, Point3d, Transform } from "@bentley/geometry-core"; 
import { } from "@bently"
import { RenderSchedule } from "@bentley/imodeljs-common";
import { IModelApp, NotifyMessageDetails, OutputMessagePriority, OutputMessageType, RenderScheduleState, Tool, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
// import { AnimationTimer } from "./AnimationTimer";
import timelineFile from "./blades.timeline.json";

interface QueryResults {
  id: string;
  model: any;
  roll: number;
  pitch: number;
  yaw: number;
  origin: {x:number, y:number, z:number};
}

interface BladeProps {
  elementId: string;
  modelId: string;
  originXYZ: {x:number, y:number, z:number};
  originArray: number[];
}

interface AntherProps {
  elementId: string;
  originXYZ: {x:number, y:number, z:number};
  originArray: number[];
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
    // vp.timePoint = script?.computeDuration().low;
    // vp.displayStyle.scheduleScript = script;

    this.getElements(vp).then((bladeElements) => {
      console.debug(bladeElements.map((result) => result.origin));
      const script = this.createScript(vp, bladeElements.map((results) => ({ elementId: results.id, modelId: results.model.id, originArray: [results.origin.x, results.origin.y, results.origin.z], originXYZ: results.origin}) as BladeProps));
      IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Script", JSON.stringify(script?.toJSON()), OutputMessageType.Sticky));
      vp.timePoint = script?.computeDuration().low;
      vp.displayStyle.scheduleScript = script;
    });

    (vp.view as ViewState3d).getDisplayStyle3d().backgroundMapSettings

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
    const query = "SELECT ECInstanceID,Origin,Roll,Pitch,Yaw,Model FROM DgnCustomItemTypes_WindEnergy.Blades";
    for await (const row of vp.iModel.query(query))
      rows.push(row);
    console.log(rows);
    return rows as QueryResults[];
  }

  private createScript(vp: Viewport, elements: BladeProps[]): RenderScheduleState.Script | undefined {
    const modelMap = new Map<string, Array<AntherProps>>();
    elements.forEach(elements => {
      const key = elements.modelId;
      const value = {elementId: elements.elementId, originArray: elements.originArray, originXYZ: elements.originXYZ};
      if (modelMap.has(key))
        modelMap.get(key)!.push(value);
      else
        modelMap.set(key, [value]);
    });
    let i = 0;
    const getOffset = () => {
      const offset = i * 50;
      i+=1;
      return offset;
    };

    const script = new RenderScheduleState.Script(vp.displayStyle.id);
    const timeNow = Date.now(), timeEnd = timeNow + 1000.0 * 60.0 * 60.0, timeMid = timeNow + (1000.0 * 60.0 * 60.0)/2;
    const modelTimeline: RenderSchedule.ModelTimelineProps = { modelId: "", elementTimelines: [] };
    // const elementTimeline: RenderSchedule.ElementTimelineProps = { batchId: 1, elementIds: []};
    // const shiftTimeline = new Array<RenderSchedule.TransformEntryProps>();
    // private formatTransformEntry(pos: number[], ori: number[], piv: number[]): RenderSchedule.TransformProps
    // shiftTimeline.push({ time: timeNow, interpolation: 2, value: this.formatTransformEntry([0,0,0,0],[0,0,0,0],[0,0,0,0])});
    // shiftTimeline.push({ time: timeMid, interpolation: 2, value: this.formatTransformEntry([0,0,0,0],[0,0,1,0],[50,0,0,0])});
    // shiftTimeline.push({ time: timeEnd, interpolation: 2, value: this.formatTransformEntry([0,0,0,0],[0,0,0,-1],[50,0,0,0])});
    // elementTimeline.transformTimeline = shiftTimeline;
    // modelTimeline.elementTimelines.push(elementTimeline);

    modelMap.forEach((props, modelId) => { // Loop models
      modelTimeline.modelId = modelId;
      props.forEach((element) => { // Loop elements in model
        const elementTimeline: RenderSchedule.ElementTimelineProps = { batchId: 1, elementIds: []};
        elementTimeline.transformTimeline = [];
        elementTimeline.elementIds = [element.elementId];
        const offset = getOffset();
        const shiftTimeline = new Array<RenderSchedule.TransformEntryProps>();
        // private formatTransformEntry(pos: number[], ori: number[], piv: number[]): RenderSchedule.TransformProps
        // const trans = Transform.createFixedPointAndMatrix(Point3d.createFrom(element.originXYZ), Matrix3d.identity);
        // shiftTimeline.push({ time: timeNow, interpolation: 2, value: { transform: trans.toJSON()}});
        shiftTimeline.push({ time: timeNow, interpolation: 2, value: this.formatTransformEntry([0,offset,0,0],[0,0,0,0],[...element.originArray,0])});
        shiftTimeline.push({ time: timeMid, interpolation: 2, value: this.formatTransformEntry([0,offset,0,0],[0,0,1,0],[...element.originArray,0])});
        shiftTimeline.push({ time: timeEnd, interpolation: 2, value: this.formatTransformEntry([0,offset,0,0],[0,0,0,-1],[...element.originArray,0])});
        shiftTimeline.push({ time: timeEnd, interpolation: 2, value: this.formatTransformEntry([0,offset,0,0],[0,0,0,-1],[...element.originArray,0])});
        shiftTimeline.push({ time: timeEnd, interpolation: 2, value: this.formatTransformEntry([0,offset,0,0],[0,0,0,-1],[...element.originArray,0])});
        elementTimeline.transformTimeline = shiftTimeline;
        modelTimeline.elementTimelines.push(elementTimeline);
      });
      script.modelTimelines.push(RenderScheduleState.ModelTimeline.fromJSON(modelTimeline));
    });
    // modelMap.forEach((elementIds, modelId) => {
    //   modelTimeline.modelId = modelId;
    //   elementTimeline.elementIds = elementIds;
    //   script.modelTimelines.push(RenderScheduleState.ModelTimeline.fromJSON(modelTimeline));
    // });
    // vp.view.forEachModel((model) => {
    //   modelTimeline.modelId = model.id;
    //   script.modelTimelines.push(RenderScheduleState.ModelTimeline.fromJSON(modelTimeline));
    // });
    console.log(script.toJSON());
    return script;
  }

  private attachColorTimeline(elementTimeline: RenderSchedule.ElementTimelineProps, timeNow: number, timeEnd: number) {
    const shiftTimeline = new Array<RenderSchedule.ColorEntryProps>();
    shiftTimeline.push({ time: timeNow, interpolation: 2, value: {red: 0, green: 255, blue: 0} });
    shiftTimeline.push({ time: timeEnd, interpolation: 2, value: {red: 0, green: 0, blue: 255} });
    elementTimeline.colorTimeline = shiftTimeline;
  }

  private formatTransformEntry(pos: number[], ori: number[], piv: number[]): RenderSchedule.TransformProps {
    return { position: pos, orientation: ori, pivot: piv, transform: [pos, ori, piv] };
  }

  private attachTransformTimeline(timeline: RenderSchedule.TimelineProps, timeNow: number, timeEnd: number) {
    const shiftTimeline = new Array<RenderSchedule.TransformEntryProps>();
    shiftTimeline.push({ time: timeNow, interpolation: 2, value: this.formatTransformEntry([0,0,0],[0,0,0],[0,0,0])});
    shiftTimeline.push({ time: timeEnd, interpolation: 2, value: this.formatTransformEntry([10,0,50],[0,0,0],[-1,1,0])});
    timeline.transformTimeline = shiftTimeline;
  }

  private attachFadeOutTimeline(elementTimeline: RenderSchedule.ElementTimelineProps, timeNow: number, timeEnd: number) {
    const fadeOutTimeline = new Array<RenderSchedule.VisibilityEntryProps>();
    fadeOutTimeline.push({ time: timeNow, interpolation: 2, value: 0.0 });
    fadeOutTimeline.push({ time: timeEnd, interpolation: 2, value: 100.0 });
    elementTimeline.visibilityTimeline = fadeOutTimeline;
  }

  private getScriptFromJson(vp: Viewport): RenderScheduleState.Script | undefined {
    const script = RenderScheduleState.Script.fromJSON(vp.displayStyle.id, (timelineFile as any))
    return script;
  }

}
