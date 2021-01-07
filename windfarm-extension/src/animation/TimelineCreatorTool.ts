import { Transform } from "@bentley/geometry-core";
import { RenderSchedule } from "@bentley/imodeljs-common";
import { IModelApp, RenderScheduleState, Tool, Viewport } from "@bentley/imodeljs-frontend";

/*---------------------------------------------------------------------------------------------
* This file is for generating a RenderSchedule for rotating the turbine blade.
* This works by querying the iModel for the origins and element ids of the geometry that
*   will transformed by the transformation.  The rotation is controlled by the quaternion
*   rotations in the pivot property of the timeline.  I select per-calculated angles from an
*   array and loop.  The timeline should end at the same pivot it began for smooth looping.
*   The time used in the timeline is arbitrary for our uses case.
* Even after this timeline is generated, it must be embedded in the iModel directly so the
*   tiles can be updated correctly by the backend.  This can be done using the 
*   synchro-schedule-importer in the iModel.js repo under the test-apps directory.
*   https://github.com/imodeljs/imodeljs/tree/master/test-apps/synchro-schedule-importer
* Before the JSON this file produces can be embedded the importer, there must be a few
*   changes must be made.  An example of such changes would be the "elementIds" properties
*   being change to "elementId" that only accepts a single string.
* See the file "timeline.json" the final file that was embedded in the iModel we used.
*--------------------------------------------------------------------------------------------*/
const quaternionRotation = [
  [0,0,0,1], // 0 | 306
  [0,0.7071068,0,-0.7071068], // 270
  [0,1,0,0], // 180
  [0,0.7071068,0,0.7071068], // 90
];

interface QueryResults {
  id: string;
  model: any;
  roll: number;
  pitch: number;
  yaw: number;
  origin: {x: number, y: number, z: number};
}

interface BladeProps {
  elementId: string;
  modelId: string;
  originXYZ: {x: number, y: number, z: number};
  originArray: number[];
}

interface AntherProps {
  elementId: string;
  originXYZ: { x: number, y: number, z: number};
  originArray: number[];
}

export class TimelineCreatorTool extends Tool {
  public static toolId = "Animation";
  public static get minArgs() { return 0; }
  public static get maxArgs() { return 6; }

  public run(vp: Viewport): boolean {

    this.getElements(vp).then((bladeElements) => {
      // console.log(bladeElements.map((result) => result.origin));
      const script = this.createScript(vp, bladeElements.map((results) => ({ elementId: results.id, modelId: results.model.id, originArray: [results.origin.x, results.origin.y, results.origin.z], originXYZ: results.origin}) as BladeProps));
      vp.timePoint = script?.computeDuration().low;
      vp.displayStyle.scheduleScript = script;
    }).catch(() => {});

    return true;
  }

  private async getElements(vp: Viewport): Promise<QueryResults[]> {
    const rows = [];
    const query = "SELECT ECInstanceID,Roll,Pitch,Yaw,Model,Origin FROM DgnCustomItemTypes_WindEnergy.Blades";
    for await (const row of vp.iModel.query(query))
      rows.push(row);
    console.log("Queried Rows", rows);
    return rows as QueryResults[];
  }

  public createScript(vp: Viewport, elements: BladeProps[]): RenderScheduleState.Script {
    const modelMap = new Map<string, Array<AntherProps>>();
    elements.forEach((element) => {
      const key = element.modelId;
      const value = {elementId: element.elementId, originArray: element.originArray, originXYZ: element.originXYZ};
      if (modelMap.has(key))
        modelMap.get(key)!.push(value);
      else
        modelMap.set(key, [value]);
    });

    const script = new RenderScheduleState.Script(vp.displayStyle.id);
    const timeNow = Date.now(), timeEnd = timeNow + 1000.0 * 60.0 * 60.0;
    const modelTimeline: RenderSchedule.ModelTimelineProps = { modelId: "", elementTimelines: [] };

    const timeDiff = timeEnd - timeNow;
    if (timeDiff !== Math.round(timeDiff)) {
      console.log("Time different not equally divisible.");
      return script;
    }


    modelMap.forEach((props, modelId) => { // Loop models
      modelTimeline.modelId = modelId;
      modelTimeline.elementTimelines = [];
      props.forEach((element) => { // Loop elements in model
        const elementTimeline: RenderSchedule.ElementTimelineProps = { batchId: 1, elementIds: [element.elementId], transformTimeline: []};
        const shiftTimeline = new Array<RenderSchedule.TransformEntryProps>();
        // private formatTransformEntry(pos: number[], ori: number[], piv: number[]): RenderSchedule.TransformProps
        // const trans = Transform.createFixedPointAndMatrix(Point3d.createFrom(element.originXYZ), Matrix3d.identity);
        // shiftTimeline.push({ time: timeNow, interpolation: 2, value: { transform: trans.toJSON()}});
        const points = quaternionRotation.length
        let pivotIndex = Math.floor(Math.random() * points);
        for (let i = 0; i<points+1; i+=1) {
          const time = timeNow + (timeDiff * i);
          const origin = element.originArray;
          const negOrigin = origin.map((value) => value * -1);
          const pivot = quaternionRotation[pivotIndex];
          shiftTimeline.push({ time, interpolation: 2, value: this.formatTransformEntry(origin,negOrigin,pivot)});
          pivotIndex = (pivotIndex + 1) % points;
        }

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

  private formatTransformMatrix(matrix: number[][] | Transform): RenderSchedule.TransformProps {
    let value: number[][]
    if (matrix instanceof Transform)
      value = (matrix.toJSON() as number[][])
    else
      value = matrix;

    return { position: (null as any), orientation: (null as any), pivot: (null as any), transform: value };
  }

  private formatTransformEntry(pos: number[], ori: number[], piv: number[]): RenderSchedule.TransformProps {
    // At the time of creating this, due to bug in the RenderSchedule's TransformTimeline,
    //   sometimes the transform matrix will be used in place of other parameters.
    return { position: pos, orientation: ori, pivot: piv, transform: [[...pos, 0], [...ori, 0], [...piv, 0]] };
  }

  public parseAndRun(..._args: string[]): boolean {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return false;
    return this.run(vp);
  }
}
