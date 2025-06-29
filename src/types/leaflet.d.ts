declare module 'leaflet.markercluster' {
  import { LayerGroup } from 'leaflet';
  
  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    maxClusterRadius?: number;
    iconCreateFunction?: (cluster: any) => any;
  }
  
  class MarkerClusterGroup extends LayerGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: any): this;
    removeLayer(layer: any): this;
    getLayers(): any[];
    getBounds(): any;
  }
  
  export = MarkerClusterGroup;
} 