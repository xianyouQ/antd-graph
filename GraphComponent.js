import { buildDef } from '../core/graph';
import { buildHierarchy } from '../core/hierarchy';
import { NodeType, ROOT_NAME } from '../core/interface';
import { layoutScene } from '../core/layout';
import { stylize, traceInputs } from '../core/node';
import { buildRender } from '../core/render';
import { buildGroupScene, getNodeElementByName } from '../core/scene';
import { DagreZoom } from '../core/zoom';
import * as d3 from 'd3'
import GraphMinmapComponent from "./GraphMinmapComponent";



export default  class GraphComponent {
  constructor(beforeToggleExpand,
              event,
              zoomInit
              ) {
    this.beforeToggleExpand = beforeToggleExpand
    this.event = event
    this.zoomInit = zoomInit
    this.$root = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    this.$root.setAttribute("id","svg")
    this.$svg = document.createElementNS('http://www.w3.org/2000/svg',"g");
    this.$svg.setAttribute("id","groot")
    let reactNode = document.createElement("rect")
    reactNode.classList.add("graph-make")
    reactNode.classList.add("nz-graph-make")
    reactNode.setAttribute("width","10000")
    reactNode.setAttribute("height","10000")
    this.$root.appendChild(reactNode).appendChild(this.$svg)
    let minzoomSvg = document.createElementNS('http://www.w3.org/2000/svg',"svg");
    let minzooRect= document.createElement("rect")
    minzoomSvg.appendChild(minzooRect)
    this.rootEle = document.createElement("div")
    let firstCanvas = document.createElement("canvas")
    firstCanvas.classList.add("first")
    let secondCanvas = document.createElement("canvas")
    secondCanvas.classList.add("second")
    let downloadCanvas = document.createElement("canvas")
    downloadCanvas.classList.add("download")
    this.$minmapDiv = document.createElement("div")
    this.$minmapDiv.appendChild(minzoomSvg)
    this.$minmapDiv.appendChild(minzooRect)

    this.$minmapDiv.appendChild(firstCanvas)
    this.$minmapDiv.appendChild(secondCanvas)
    this.$minmapDiv.appendChild(downloadCanvas)
    this.rootEle.appendChild(this.$root)
    this.rootEle.appendChild(this.$minmapDiv)

    this.portalCacheMap = new Map();
    this._edgeGroupIndex = [];
    this._nodeGroupIndex = {};
    this.minmap = GraphMinmapComponent(this.$minmapDiv,this)
  }

  baseRoot = () => {
    return this.rootEle
  }
  buildGraph =  (graphDef) => {
    var _this = this;
    // 构建 GraphDef
    return buildDef(graphDef)
      .then(function (graph) {
        _this.graph = graph;
        // 构建 Hierarchy
        return buildHierarchy(graph, { rankDirection: 'LR' });
      })
      .then(function (graphHierarchy) {
        _this.graphHierarchy = graphHierarchy;
        return _this.graphHierarchy;
      });
  }
  buildRenderGraphInfo = (graphHierarchy) => {
    var _this = this;
    return buildRender(graphHierarchy)
      .then(function (renderGraph) {
        _this.renderHierarchy = renderGraph;
        return _this.renderHierarchy;
      });
  }
  layoutScene = (renderHierarchy) => {
    layoutScene(renderHierarchy, this);
  };

  buildGroupScene =  (renderHierarchy) =>  {
    this.sceneGroup = buildGroupScene(d3.select(this.$root), renderHierarchy, this);
  };


  nodeToggleExpand = (event) => {

    var nodeName = event.name;

    var renderNode = this.renderHierarchy.getRenderNodeByName(nodeName);
    if (renderNode.node.type === NodeType.OP) {
      return;
    }
    if (typeof this.beforeToggleExpand === 'function' && !this.beforeToggleExpand(renderNode)) {
      return;
    }
    this.renderHierarchy.buildSubhierarchy(nodeName);
    renderNode.expanded = !renderNode.expanded;
    this.event.emit({
      eventName: 'node-toggle-expand',
      event: renderNode
    });
    this.build();
  };
  clean = ()  => {
    this._nodeGroupIndex = {};
    this._edgeGroupIndex = [];
    this.portalCacheMap.forEach(function (v) {
      v.host.dispose();
      v.temp = null;
    });
    this.portalCacheMap.clear();
    if (this.sceneGroup) {
      this.sceneGroup.selectAll('*').remove();
    }
  };


  build = () => {
    var _this = this;
    requestAnimationFrame(function () {
      _this.layoutScene(_this.renderHierarchy.root);
      _this.buildGroupScene(_this.renderHierarchy.root);
      setTimeout(function () {
        if (_this.selectedNode) {
          traceInputs(_this.renderHierarchy);
        }
        if (_this.minmap) {
          _this.minmap.update();
        }
      }, 250);
    });
  };

  fit = (duration, scale) => {
    if (duration === void 0) { duration = 500; }
    if (scale === void 0) { scale = .9; }
    if (this.zoom) {
      this.zoom.fit(duration, scale);
    }
  };

  panToCenterByNodeName =  (nodeName) =>{
    var _this = this;

    var nodeElement = getNodeElementByName(nodeName);
    if (nodeElement && this.zoom) {
      requestAnimationFrame(function () {
        _this.zoom.panToCenter(( (nodeElement)));
      });
    }
  };

  fire = (eventName, event) => {
    this.event.emit({ eventName: eventName, event: event });
    switch (eventName) {
      case 'node-toggle-expand':
        this.nodeToggleExpand(event);
        break;
      case 'edge-select':
        this.handleEdgeSelected(event);
        break;
      case 'node-select':
        this.handleNodeSelected(event);
        break;
      default:
        break;
    }
  };

  handleEdgeSelected = (event) => {
    // console.log(event);
  };


  handleNodeSelected =  (event) => {
    if (!event.name) {
      return;
    }

    var lastSelect = this.selectedNode;
    this.selectedNode = event.name;
    this.updateNodeState(event.name);
    if (lastSelect) {
      this.updateNodeState(lastSelect);
    }
    this.traceInputs();
  };


  traceInputs =  () => {
    traceInputs(this.renderHierarchy);
  };

  isNodeExpanded = (e) =>  {
  };

  addNodeGroup = (node, selection) => {
    this._nodeGroupIndex[node] = selection;
  };

  removeNodeGroup = (node) => {
    delete this._nodeGroupIndex[node];
  };

  getNodeGroup = (node) => {
    return this._nodeGroupIndex[node];
  };

  getNode = (node) => {
    return this.renderHierarchy.getRenderNodeByName(node);
  };

/*
  removeNodeGroupPortal = (renderNodeInfo) => {
    if (this.portalCacheMap.has(renderNodeInfo)) {

      var portal = this.portalCacheMap.get(renderNodeInfo);
      portal.host.detach();
      portal.temp = null;
      portal.host = null;
      this.portalCacheMap.delete(renderNodeInfo);
    }
  };

  createInjector = (renderNodeInfo) => {

    var injectorTokens = new WeakMap();
    injectorTokens.set(RENDER_NODE_INFO, renderNodeInfo);
    injectorTokens.set(RENDER_NODE_INFO_CHANGE, new Subject());
    injectorTokens.set(NzGraphComponent, this);
    return new PortalInjector(this.injector, injectorTokens);
  };


  emitChangeByNodeInfo = (renderNodeInfo) => {

    var portalCache = this.portalCacheMap.get(renderNodeInfo);
    if (portalCache) {
      (( (portalCache.temp.injector.get(RENDER_NODE_INFO_CHANGE)))).next(renderNodeInfo);
    }
  };


  addNodePortal = (element, renderNodeInfo) => {
    if (!this.nodePortal) {
      throw new Error('没有找到 nodePortal');
    }
    // BRIDGE 不需要定义
    if (renderNodeInfo.node.type === NodeType.BRIDGE) {
      return;
    }
    // 嵌入模版的容器

    var nodeForeignObject = ( (element.select('foreignObject').node()));

    var injector = this.createInjector(renderNodeInfo);

    var portalCache = this.portalCacheMap.get(renderNodeInfo);
    // 是否被添加过
    if (this.portalCacheMap.has(renderNodeInfo)) {
      // 如果被添加过但是当前容器中却不存在之前的模版则重新添加（因为被收起或其他原因被移除）
      if (!(( (element.node()))).contains(portalCache.host.outletElement)) {
        portalCache.host.dispose();
        portalCache.host = null;
        portalCache.temp = null;
        this.portalCacheMap.delete(renderNodeInfo);
      }
      else {
        (( (portalCache.temp.injector.get(RENDER_NODE_INFO_CHANGE)))).next(renderNodeInfo);
        return;
      }
    }

    var nodePortalHost = new DomPortalHost(nodeForeignObject, this.componentFactoryResolver, this.appRef, injector);

    var portal = new ComponentPortal(this.nodePortal, this.viewContainerRef, injector);

    var componentInstance = nodePortalHost.attach(portal);
    componentInstance.changeDetectorRef.detectChanges();
    componentInstance = null;
    this.portalCacheMap.set(renderNodeInfo, {
      host: nodePortalHost,
      temp: portal
    });
  };

*/
  isNodeHighlighted = (nodeName) => {
    return nodeName === this.selectedNode;
  };

  isNodeSelected = (nodeName) => {
    return nodeName === this.selectedNode;
  };


  ngOnInit = () => {
    if (this.minmap) {
      this.minmap.ngOnInit()
    }
  }
  ngAfterContentInit = () => {
    var _this = this;
    requestAnimationFrame(function () {
      _this.bindZoom();
    });
  };

  ngOnDestroy = () => {
    if (this.zoom) {
      this.zoom.unbind();
    }
    if (this.minmap) {
      this.minmap.ngOnDestroy()
    }
  };

  bindZoom = () => {
    var _this = this;
    this.zoom = new DagreZoom(this.$root, this.$svg);
    this.zoomInit.emit();
    if (this.minmap) {
      this.zoom.transformChange.subscribe(function (e) { return _this.minmap.zoom(e); });
    }
  };

  updateNodeState = (nodeName) => {
    if (!nodeName) {
      return;
    }

    var nodeGroup = this.getNodeGroup(nodeName);

    var node = this.getNode(nodeName);
    if (nodeGroup) {
      stylize(nodeGroup, node, this);
    }
  };

  expandParents = (nodeName) => {
    var _this = this;

    var node = ( (this.renderHierarchy.hierarchy.node(nodeName)));
    if (!node) {
      return;
    }
    // 存放它的所有父节点

    var nodeParents = [];
    // 找到所有除了 root 之外的的所有父节点
    while (node.parentNode !== null && node.parentNode.name !== ROOT_NAME) {
      node = node.parentNode;
      nodeParents.push(node.name);
    }
    // 用于标记之前未展开的父节点，如果都展开了它则为空，将不会重新进行渲染

    var topParentNodeToBeExpanded;
    // 倒序展开
    _.forEachRight(nodeParents, function (parentName) {
      _this.renderHierarchy.buildSubhierarchy(parentName);

      var renderNode = _this.renderHierarchy.getRenderNodeByName(parentName);
      if (renderNode.node.isGroupNode && !renderNode.expanded) {
        renderNode.expanded = true;
        if (!topParentNodeToBeExpanded) {
          topParentNodeToBeExpanded = renderNode;
        }
      }
    });
    return topParentNodeToBeExpanded;
  };

  selectedNodeChanged = (nodeName) => {
    var _this = this;
    if (!nodeName || nodeName === this.selectedNode) {
      return;
    }

    var topParentNodeToBeExpanded = this.expandParents(nodeName);
    // 确保存在展开状态存在变换的节点
    if (topParentNodeToBeExpanded) {
      this.build();
    }
    // buildDef 是异步的
    setTimeout(function () {
      // 展开后将剧中当前节点，在 node 很多时，250ms 可能不够。
      _this.panToCenterByNodeName(nodeName);
      _this.handleNodeSelected({
        name: nodeName
      });
    }, 250);
  };

  expandOrCollapseAll = (expand) => {
    var _this = this;
    if (expand === void 0) { expand = true; }

    var nodeMap = this.renderHierarchy.hierarchy.getNodeMap();

    var groupNodes = [];

    var isBuild = false;
    Object.keys(nodeMap).forEach(function (key) {
      if (nodeMap[key].isGroupNode && nodeMap[key].name !== ROOT_NAME) {
        groupNodes.push(key);
      }
    });
    groupNodes.forEach(function (name) {
      _this.renderHierarchy.buildSubhierarchy(name);

      var renderNode = _this.renderHierarchy.getRenderNodeByName(name);
      if (renderNode.node.isGroupNode && expand !== renderNode.expanded) {
        renderNode.expanded = expand;
        if (!isBuild) {
          isBuild = true;
        }
      }
    });
    if (isBuild) {
      this.build();
    }
  };
}

