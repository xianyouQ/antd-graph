import { buildDef } from "./core/graph";
import { buildHierarchy } from "./core/hierarchy";
import { NodeType, ROOT_NAME } from "./core/interface";
import { layoutScene } from "./core/layout";
import { stylize, traceInputs } from "./core/node";
import { buildRender } from "./core/render";
import { buildGroupScene, getNodeElementByName } from "./core/scene";
import { DagreZoom } from "./core/zoom";
import * as d3 from "d3";
import GraphMinmapComponent from "./GraphMinmapComponent";
import * as _ from "lodash";
import { EventEmitter } from "events";
import FlinkGraphNodePortal from "./FlinkGraphNodePortal";
import React from "react";
import ReactDOM from "react-dom";

let emitter = new EventEmitter();
export default class GraphComponent {
  constructor(
    $root,
    $svg,
    $minmapDiv,
    beforeToggleExpand,
    event,
    flinkGraph,
    edgeLabelFunction,
    edgesLayoutFunction,
    opNodeHeightFunction
  ) {
    this.beforeToggleExpand = beforeToggleExpand;
    this.event = event;
    this.zoomInit = emitter;
    this.$root = $root;
    this.$svg = $svg;

    this.$minmapDiv = $minmapDiv;
    this.portalCacheMap = new Map();
    this._edgeGroupIndex = [];
    this._nodeGroupIndex = {};
    this.flinkGraph = flinkGraph;
    this.edgeLabelFunction = edgeLabelFunction;
    this.edgesLayoutFunction = edgesLayoutFunction;
    this.opNodeHeightFunction = opNodeHeightFunction;
  }

  buildGraph = graphDef => {
    var _this = this;
    // 构建 GraphDef
    return buildDef(graphDef)
      .then(function(graph) {
        _this.graph = graph;

        // 构建 Hierarchy
        return buildHierarchy(graph, { rankDirection: "LR" });
      })
      .then(function(graphHierarchy) {
        _this.graphHierarchy = graphHierarchy;
        return _this.graphHierarchy;
      });
  };
  buildRenderGraphInfo = graphHierarchy => {
    var _this = this;
    return buildRender(graphHierarchy).then(function(renderGraph) {
      _this.renderHierarchy = renderGraph;
      return _this.renderHierarchy;
    });
  };
  layoutScene = renderHierarchy => {
    layoutScene(renderHierarchy, this);
  };

  buildGroupScene = renderHierarchy => {
    this.sceneGroup = buildGroupScene(
      d3.select(this.$root),
      renderHierarchy,
      this
    );
  };

  nodeToggleExpand = event => {
    var nodeName = event.name;

    var renderNode = this.renderHierarchy.getRenderNodeByName(nodeName);
    if (renderNode.node.type === NodeType.OP) {
      return;
    }
    if (
      typeof this.beforeToggleExpand === "function" &&
      !this.beforeToggleExpand(renderNode)
    ) {
      return;
    }
    this.renderHierarchy.buildSubhierarchy(nodeName);
    renderNode.expanded = !renderNode.expanded;
    this.event.emit({
      eventName: "node-toggle-expand",
      event: renderNode
    });
    this.build();
  };
  clean = () => {
    this._nodeGroupIndex = {};
    this._edgeGroupIndex = [];

    this.portalCacheMap.forEach(function(v) {
      v.nodePortal.ngOnDestroy();
    });
    this.portalCacheMap.clear();

    if (this.sceneGroup) {
      this.sceneGroup.selectAll("*").remove();
    }
  };

  build = () => {
    var _this = this;
    requestAnimationFrame(function() {
      _this.layoutScene(_this.renderHierarchy.root);
      _this.buildGroupScene(_this.renderHierarchy.root);
      setTimeout(function() {
        if (_this.selectedNode) {
          traceInputs(this.$root, _this.renderHierarchy);
        }
        if (_this.minmap) {
          _this.minmap.update();
        }
      }, 250);
    });
  };

  fit = (duration, scale) => {
    if (duration === void 0) {
      duration = 500;
    }
    if (scale === void 0) {
      scale = 0.9;
    }
    if (this.zoom) {
      this.zoom.fit(duration, scale);
    }
  };

  panToCenterByNodeName = nodeName => {
    var _this = this;

    var nodeElement = getNodeElementByName(nodeName);
    if (nodeElement && this.zoom) {
      requestAnimationFrame(function() {
        _this.zoom.panToCenter(nodeElement);
      });
    }
  };

  fire = (eventName, event) => {
    this.event.emit({ eventName: eventName, event: event });
    switch (eventName) {
      case "node-toggle-expand":
        this.nodeToggleExpand(event);
        break;
      case "edge-select":
        this.handleEdgeSelected(event);
        break;
      case "node-select":
        this.handleNodeSelected(event);
        break;
      default:
        break;
    }
  };

  handleEdgeSelected = event => {
    // console.log(event);
  };

  handleNodeSelected = event => {
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

  traceInputs = () => {
    traceInputs(this.$root, this.renderHierarchy);
  };

  isNodeExpanded = e => {};

  addNodeGroup = (node, selection) => {
    this._nodeGroupIndex[node] = selection;
  };

  removeNodeGroup = node => {
    delete this._nodeGroupIndex[node];
  };

  getNodeGroup = node => {
    return this._nodeGroupIndex[node];
  };

  getNode = node => {
    return this.renderHierarchy.getRenderNodeByName(node);
  };

  removeNodeGroupPortal = renderNodeInfo => {
    if (this.portalCacheMap.has(renderNodeInfo)) {
      var portal = this.portalCacheMap.get(renderNodeInfo);
      ReactDOM.unmountComponentAtNode(portal.hostObject);
      this.portalCacheMap.delete(renderNodeInfo);
    }
  };

  //更新节点数据
  emitChangeByNodeInfo = renderNodeInfo => {
    var portalCache = this.portalCacheMap.get(renderNodeInfo);
    if (portalCache) {
      let verticesDetail = null;
      let operatorsDetail = null;
      if (renderNodeInfo && renderNodeInfo.node.isGroupNode) {
        verticesDetail = this.flinkGraph.getVerticesDetail(renderNodeInfo);
      } else {
        operatorsDetail = this.flinkGraph.getOperatorsDetail(renderNodeInfo);
      }
      let newNodePortal = React.cloneElement(portalCache.nodePortal, {
        graphComponent: this,
        nodeInfo: renderNodeInfo,
        verticesDetail: verticesDetail,
        operatorsDetail: operatorsDetail
      });
      ReactDOM.render(newNodePortal, portalCache.hostObject);
    }
  };

  addNodePortal = (element, renderNodeInfo) => {
    // BRIDGE 不需要定义
    if (renderNodeInfo.node.type === NodeType.BRIDGE) {
      return;
    }
    // 嵌入模版的容器

    var nodeForeignObject = element.select("foreignObject").node();

    var portalCache = this.portalCacheMap.get(renderNodeInfo);
    // 是否被添加过
    if (this.portalCacheMap.has(renderNodeInfo)) {
      // 如果被添加过但是当前容器中却不存在之前的模版则重新添加（因为被收起或其他原因被移除）
      let verticesDetail = null;
      let operatorsDetail = null;
      if (renderNodeInfo && renderNodeInfo.node.isGroupNode) {
        verticesDetail = this.flinkGraph.getVerticesDetail(renderNodeInfo);
      } else {
        operatorsDetail = this.flinkGraph.getOperatorsDetail(renderNodeInfo);
      }
      let newNodePortal = React.cloneElement(portalCache.nodePortal, {
        graphComponent: this,
        nodeInfo: renderNodeInfo,
        verticesDetail: verticesDetail,
        operatorsDetail: operatorsDetail
      });
      ReactDOM.render(newNodePortal, nodeForeignObject);
      return;
    }
    let verticesDetail = null;
    let operatorsDetail = null;
    if (renderNodeInfo && renderNodeInfo.node.isGroupNode) {
      verticesDetail = this.flinkGraph.getVerticesDetail(renderNodeInfo);
    } else {
      operatorsDetail = this.flinkGraph.getOperatorsDetail(renderNodeInfo);
    }
    let nodePortal = React.createElement(
      FlinkGraphNodePortal,
      {
        graphComponent: this,
        nodeInfo: renderNodeInfo,
        verticesDetail: verticesDetail,
        operatorsDetail: operatorsDetail
      },
      null
    );
    ReactDOM.render(nodePortal, nodeForeignObject);

    let portal = { nodePortal: nodePortal, hostObject: nodeForeignObject };
    this.portalCacheMap.set(renderNodeInfo, portal);
  };

  isNodeHighlighted = nodeName => {
    return nodeName === this.selectedNode;
  };

  isNodeSelected = nodeName => {
    return nodeName === this.selectedNode;
  };

  ngOnInit = () => {
    this.minmap = new GraphMinmapComponent(this.$minmapDiv, this);

    this.minmap.ngOnInit();
  };
  ngAfterContentInit = () => {
    var _this = this;
    requestAnimationFrame(function() {
      _this.bindZoom();
    });
  };

  ngOnDestroy = () => {
    if (this.zoom) {
      this.zoom.unbind();
    }
    if (this.minmap) {
      this.minmap.ngOnDestroy();
    }
  };

  bindZoom = () => {
    var _this = this;
    this.zoom = new DagreZoom(this.$root, this.$svg);
    this.zoomInit.emit("zoomInit");
    if (this.minmap) {
      this.zoom.transformChange.subscribe(function(e) {
        return _this.minmap.zoom(e);
      });
    }
  };

  updateNodeState = nodeName => {
    if (!nodeName) {
      return;
    }

    var nodeGroup = this.getNodeGroup(nodeName);

    var node = this.getNode(nodeName);
    if (nodeGroup) {
      stylize(nodeGroup, node, this);
    }
  };

  expandParents = nodeName => {
    var _this = this;

    var node = this.renderHierarchy.hierarchy.node(nodeName);
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
    _.forEachRight(nodeParents, function(parentName) {
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

  selectedNodeChanged = nodeName => {
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
    setTimeout(function() {
      // 展开后将剧中当前节点，在 node 很多时，250ms 可能不够。
      _this.panToCenterByNodeName(nodeName);
      _this.handleNodeSelected({
        name: nodeName
      });
    }, 250);
  };

  expandOrCollapseAll = expand => {
    var _this = this;
    if (expand === void 0) {
      expand = true;
    }

    var nodeMap = this.renderHierarchy.hierarchy.getNodeMap();

    var groupNodes = [];

    var isBuild = false;
    Object.keys(nodeMap).forEach(function(key) {
      if (nodeMap[key].isGroupNode && nodeMap[key].name !== ROOT_NAME) {
        groupNodes.push(key);
      }
    });
    groupNodes.forEach(function(name) {
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
