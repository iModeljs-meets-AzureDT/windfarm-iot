import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";
import { PowerMarker } from "../markers/PowerMarker";
import { ErrorMarker } from "../markers/ErrorMarker";

export class ErrorDecorator implements Decorator {
  public marker: ErrorMarker;

  constructor(powerMarker: PowerMarker) {
    this.marker = new ErrorMarker(powerMarker);
  }

  public decorate(context: DecorateContext): void {
    this.marker.addDecoration(context);
  }
}
  

