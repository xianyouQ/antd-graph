import { take } from "rxjs/operators";
import { PARAMS as LAYOUT_PARAMS } from "./core/layout";
import Minimap from "./core/minimap";

export default class GraphMinmapComponent {
  constructor(hostRef, graphComponent) {
    this.hostRef = hostRef;
    this.graphComponent = graphComponent;
    if (!this.graphComponent) {
      throw new TypeError("nz-graph");
    }
  }

  ngOnInit = () => {
    var _this = this;
    this.hostElement = this.hostRef;
    console.log("init minMap");
    this.zoomInit$ = (msg, data) => {
      console.log("recivice msg " + data);
      _this.init();
    };
    this.graphComponent.zoomInit.addListener("zoomInit", this.zoomInit$); //注册事件
  };

  init = () => {
    if (this.graphComponent.zoom == null) {
      return;
    }
    this.minimap = new Minimap(
      this.graphComponent.$svg,
      this.graphComponent.$root,
      this.graphComponent.zoom.zoom,
      this.hostElement,
      LAYOUT_PARAMS.minimap.size,
      LAYOUT_PARAMS.subscene.meta.labelHeight
    );
  };

  zoom = transform => {
    if (this.minimap) {
      this.minimap.zoom(transform);
    }
  };

  update = () => {
    if (this.minimap) {
      this.minimap.update();
    }
  };

  ngOnDestroy = () => {
    this.graphComponent.zoomInit.removeListener("zoomInit", this.zoomInit$); //取消事件
  };
}
