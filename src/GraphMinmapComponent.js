import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PARAMS as LAYOUT_PARAMS } from '../core/layout';
import { Minimap } from '../core/minimap';

export default class GraphMinmapComponent {
  constructor(hostRef, graphComponent) {
    this.hostRef = hostRef;
    this.graphComponent = graphComponent;
    this.zoomInit$ = new Subscription();
    if (!this.graphComponent) {
      throw new TypeError('nz-graph');
    }
  }

  ngOnInit = () => {
    var _this = this;
    this.hostElement = this.hostRef;
    this.zoomInit$ = this.graphComponent.zoomInit.asObservable().pipe(take(1)).subscribe(function () {
      _this.init();
    });
  };

  init = () => {
    this.minimap = new Minimap(this.graphComponent.$svg, this.graphComponent.$root, this.graphComponent.zoom.zoom, this.hostElement, LAYOUT_PARAMS.minimap.size, LAYOUT_PARAMS.subscene.meta.labelHeight);
  };

  zoom = (transform) => {
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
    this.zoomInit$.unsubscribe();
  };
}
