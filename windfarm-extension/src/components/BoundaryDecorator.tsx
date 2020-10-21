import { ColorDef } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType } from "@bentley/imodeljs-frontend";


export default class BoundaryDecorator implements Decorator {

  /* Implement this method to add Decorations into the supplied DecorateContext. */
  public decorate(context: DecorateContext): void {

    // Check view type, project extents is only applicable to show in spatial views.hi
    const vp = context.viewport;
    if (!vp.view.isSpatialView())
      return;

    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration, undefined);
    // Set edge color to white or black depending on current view background color and set line weight to 2.
    builder.setSymbology(vp.getContrastToBackgroundColor(), ColorDef.black, 2);
    // Add range box edge geometry to builder.
    builder.addRangeBox(vp.iModel.projectExtents);
    context.addDecorationFromBuilder(builder);
  }
}
