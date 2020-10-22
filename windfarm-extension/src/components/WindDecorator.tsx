import { DecorateContext, Decorator } from "@bentley/imodeljs-frontend";
import { PowerMarker } from "./PowerMarker";
import { WindMarker } from "./WindMarker";

export class WindDecorator implements Decorator {
  protected marker: WindMarker;

  constructor(powerMarker: PowerMarker) {
    this.marker = new WindMarker(powerMarker);
  }

  public decorate(context: DecorateContext): void {
    this.marker.addDecoration(context);
  }
}
  
