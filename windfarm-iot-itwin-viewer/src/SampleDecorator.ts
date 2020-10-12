import { DecorateContext, Marker, Decorator } from "@bentley/imodeljs-frontend";
import { SampleMarker } from "./SampleMarker";

export class SampleDecorator implements Decorator{
  protected _markers: Marker[] = [];

  constructor(positions: any[]) {
    positions.forEach( (position) => {
      if (position.position) this.addMarker(position);
    });
  }

  private addMarker(position: any) {
    const marker = new SampleMarker(
      { x: position[0], y: position[1], z: position[2] },
      { x: 50, y: 50 },
    );
    this._markers.push(marker);
  }

  public decorate(context: DecorateContext): void {
    this._markers.forEach((marker) => {
      marker.addDecoration(context);
        });
    }

}