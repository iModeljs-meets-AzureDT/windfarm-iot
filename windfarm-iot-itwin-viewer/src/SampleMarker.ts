import { Marker, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";

export class SampleMarker extends Marker {
    constructor(worldLocation: XYAndZ, size: XAndY) {
      super(worldLocation, size);
      const image = imageElementFromUrl(`map_pin.svg`);
      this.setImage(image);
    }
  }
