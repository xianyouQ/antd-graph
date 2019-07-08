import React, {  Component } from "react";
import PropTypes from 'prop-types'
import { message } from "antd";
import GraphComponent from "./GraphComponent";
import * as d3 from "d3";
import { EventEmitter } from "events";
import cs from "classnames";
import ReactDOM from "react-dom";

const opNameMaxLength = 512;

const graphTimeoutRange = d3
  .scaleLinear()
  .domain([50, 100, 300, 500])
  .range([250, 500, 800, 1000])
  .clamp(true);
const getLabelForEdge = (metaedge, renderInfo) => {
  if (Object.keys(renderInfo.getSubhierarchy()).length === 1) {
    return metaedge.baseEdgeList[0]["partitioner"] || null;
  }
  return null;
};

const edgesLayoutFunction = (graph, params) => {
  graph.edges().forEach(e => {
    const edge = graph.edge(e);
    if (!edge.structural) {
      const maxLabelLength = Math.max(
        edge.metaedge.baseEdgeList.map(_e => (_e.partitioner || "").length)
      );
      const rankdir = graph.graph().rankdir;
      const rankSep = edge.metaedge.inbound
        ? graph.graph().ranksep
        : Math.max(params.rankSep, maxLabelLength * 5);
      if (["RL", "LR"].indexOf(rankdir) !== -1) {
        edge.width = rankSep;
      } else {
        edge.height = rankSep;
      }
    }
  });
};

const opNodeHeightFunction = renderNodeInfo => {
  const heightRange = d3
    .scaleLinear()
    .domain([1, 2, 3])
    .range([85, 100, 115]);
  const nameLength = Math.min(
    opNameMaxLength,
    renderNodeInfo.node.attr["name"].length
  );
  return heightRange(Math.ceil((nameLength + 3) / 28));
};
const canToggleExpand = renderNodeInfo => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[0].attr["virtual"]);
};
const MetricsGetStrategy = {
  MAX: 0,
  MIN: 1,
  SUM: 2,
  FIRST: 3
};
let emitter = new EventEmitter();

export default class FlinkGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      jid: null
    };
    this.transformCache = null;
    this.verticesDetailsCache = new Map();
    this.operatorsDetailsCache = new Map();
  }
  componentDidMount() {
    let $root = ReactDOM.findDOMNode(this.refs.$root);
    let $svg = ReactDOM.findDOMNode(this.refs.$svg);
    let $minmapDiv = ReactDOM.findDOMNode(this.refs.$minmapDiv);
    this.graphComponent = new GraphComponent(
      $root,
      $svg,
      $minmapDiv,
      canToggleExpand,
      emitter,
      this,
      getLabelForEdge,
      edgesLayoutFunction,
      opNodeHeightFunction
    );
    this.graphComponent.ngOnInit();
    this.itemChange = (msg, data) => console.log(msg);
    emitter.addListener("node-toggle-expand", this.itemChange); //注册事件
    emitter.addListener("vertices-click", this.itemChange); //注册事件

    const { jobDetailCorrect } = this.props;
    this.initGraph(jobDetailCorrect);
  }
  shouldComponentUpdate(newProps, newState) {
    return false;
  }
  componentWillUnmount() {
    if (this.itemChange) {
      emitter.removeListener("node-toggle-expand", this.itemChange); //取消事件
      emitter.removeListener("vertices-click", this.itemChange); //取消事件

    }
    this.graphComponent.ngOnDestroy();
  }

  componentWillReceiveProps(newProps) {
    this.setTransformCache();
    const { jobDetailCorrect } = newProps;
    console.log(jobDetailCorrect)
    if (jobDetailCorrect != null && this.graphComponent != null) {
      if (this.state.jid == jobDetailCorrect.plan.jid) {
        this.updateData(jobDetailCorrect);
      } else {
        this.initGraph(jobDetailCorrect);
      }
    }
  }

  initGraph = data => {
    if (data == null) {
      return;
    }
    this.setState({ ...this.state, jid: data.plan.jid });
    const graphDef = this.parseGraphData(data);
    this.cleanDetailCache();
    this.graphComponent
      .buildGraph(graphDef)
      .then(graph => this.graphComponent.buildRenderGraphInfo(graph))
      .then(() => {
        this.graphComponent.clean();
        this.graphComponent.build();
        setTimeout(
          () => {
            this.graphComponent.fit(0, 0.8);
            this.graphComponent.ngAfterContentInit();
          },
          data.plan && data.plan.nodes
            ? graphTimeoutRange(data.plan.nodes.length)
            : 200
        );
      });
  };

  cleanDetailCache = () => {
    this.verticesDetailsCache.clear();
    this.operatorsDetailsCache.clear();
  };
  setTransformCache() {
    if (
      this.transformCache ||
      !this.graphComponent.zoom ||
      !this.graphComponent.zoom.zoomTransform
    ) {
      return;
    }
    const { x, y, k } = this.graphComponent.zoom.zoomTransform;
    this.transformCache = {
      x,
      y,
      k
    };
  }
  parseGraphData = data => {
    this.sourceData = data;
    const nodes = [];
    const getNamespaces = operatorId => {
      const op = data.verticesDetail.operators.find(
        e => e.operator_id === operatorId
      );
      return op.vertex_id
        ? `${op.vertex_id}/${op.operator_id}`
        : op.operator_id;
    };
    data.verticesDetail.operators.forEach(op => {
      nodes.push({
        name: getNamespaces(op.operator_id),
        inputs: op.inputs.map(e => {
          return {
            name: getNamespaces(e.operator_id),
            attr: { ...e }
          };
        }),
        attr: { ...op }
      });
    });

    this.graphDef = {
      nodes
    };
    return this.graphDef;
  };
  resetTransform = () => {
    if (!this.transformCache) {
      if (this.graphComponent && this.graphComponent.fit) {
        this.graphComponent.fit();
      }
      return;
    }
    const transform = d3.zoomIdentity
      .scale(this.transformCache.k)
      .translate(
        this.transformCache.x / this.transformCache.k,
        this.transformCache.y / this.transformCache.k
      );

    d3.select(this.graphComponent.zoom.containerEle)
      .transition()
      .duration(500)
      .call(this.graphComponent.zoom.zoom.transform, transform);
    this.transformCache = null;
  };
  getVerticesDetail = (nodeRenderInfo, force = false) => {
    if (this.verticesDetailsCache.has(nodeRenderInfo) && !force) {
      return this.verticesDetailsCache.get(nodeRenderInfo);
    }
    const vertices = this.sourceData.verticesDetail.vertices.find(
      v => v.id === nodeRenderInfo.node.name
    );
    if (!vertices) {
      return null;
    }

    let displayName = "";
    let inQueue = null;
    let outQueue = null;
    let status = "UNKNOWN";
    if (vertices.name) {
      displayName =
        vertices.name.length > 125
          ? `${vertices.name.substring(0, 125)}...`
          : vertices.name;
    } else {
      displayName = vertices.name;
    }

    this.sourceData.vertices.forEach(vertice => {
      if (vertice.id == vertices.id) {
        status = vertice.status;
        return false;
      }
    })
    if (
      vertices.metrics &&
      Number.isFinite(vertices.metrics["buffers-in-pool-usage-max"])
    ) {
      inQueue =
        vertices.metrics["buffers-in-pool-usage-max"] === -1
          ? null
          : vertices.metrics["buffers-in-pool-usage-max"];
    } else {
      inQueue = Math.max(
        ...vertices.subtask_metrics.map(m =>
          this.parseFloat(m["buffers.inPoolUsage"])
        )
      );
    }

    if (
      vertices.metrics &&
      Number.isFinite(vertices.metrics["buffers-out-pool-usage-max"])
    ) {
      outQueue =
        vertices.metrics["buffers-out-pool-usage-max"] === -1
          ? null
          : vertices.metrics["buffers-out-pool-usage-max"];
    } else {
      outQueue = Math.max(
        ...vertices.subtask_metrics.map(m =>
          this.parseFloat(m["buffers.outPoolUsage"])
        )
      );
    }

    this.verticesDetailsCache.set(nodeRenderInfo, {
      displayName,
      name: vertices.name,
      status: status,
      inQueue: Number.isFinite(inQueue) ? inQueue : null,
      outQueue: Number.isFinite(outQueue) ? outQueue : null,
      parallelism:
      this.parseFloat(vertices.parallelism) || vertices.subtask_metrics.length
    });

    return this.verticesDetailsCache.get(nodeRenderInfo);
  };

  updateData = data => {
    this.sourceData = data;
    this.operatorsDetailsCache.forEach((v, k) => {
      Object.assign(v, this.getOperatorsDetail(k, true));
      this.graphComponent.emitChangeByNodeInfo(k);
    });
    this.verticesDetailsCache.forEach((v, k) => {
      Object.assign(v, this.getVerticesDetail(k, true));
      this.graphComponent.emitChangeByNodeInfo(k);
    });
    console.log(this.operatorsDetailsCache)
    console.log(this.verticesDetailsCache)
  };
  getOperatorsDetail = (nodeRenderInfo, force = false) => {
    if (this.operatorsDetailsCache.has(nodeRenderInfo) && !force) {
      return this.operatorsDetailsCache.get(nodeRenderInfo);
    }
    const operator = this.sourceData.verticesDetail.operators.find(
      o => o.operator_id === nodeRenderInfo.node.attr["operator_id"]
    );

    if (!operator) {
      return null;
    }

    let displayName = "";
    if (operator.name.length > opNameMaxLength) {
      displayName = `${operator.name.substring(0, opNameMaxLength)}...`;
    } else {
      displayName = operator.name;
    }

    const vertices = this.sourceData.verticesDetail.vertices.find(
      v => v.id === operator.vertex_id
    );

    const numRecordsIn = this.getMetric(
      vertices.subtask_metrics,
      operator,
      "numRecordsInOperator",
      MetricsGetStrategy.SUM
    );
    const numRecordsOut = this.getMetric(
      vertices.subtask_metrics,
      operator,
      "numRecordsOutOperator",
      MetricsGetStrategy.SUM
    );

    const abnormal =
      !/^Sink:\s.+$/.test(operator.name) &&
      Number.isFinite(numRecordsIn) &&
      Number.isFinite(numRecordsOut) &&
      numRecordsIn > 0 &&
      numRecordsOut <= 0;

    this.operatorsDetailsCache.set(nodeRenderInfo, {
      abnormal,
      displayName,
      name: operator.name,
      numRecordsIn: Number.isFinite(numRecordsIn) ? `${numRecordsIn}` : " - ",
      numRecordsOut: Number.isFinite(numRecordsOut) ? `${numRecordsOut}` : " - "
    });

    return this.operatorsDetailsCache.get(nodeRenderInfo);
  };

  getNodesItemCorrect = name => {
    return this.sourceData.plan.nodes.find(n => n.id === name);
  };
  parseFloat(value) {
    if (typeof value === "number") {
      return value;
    } else {
      const n = Number.parseFloat(value);
      return Number.isFinite(n) ? n : null;
    }
  }
  expandAll = () => {
    this.graphComponent.expandOrCollapseAll(true);
    setTimeout(() => {
      this.graphComponent.fit();
      this.graphComponent.traceInputs();
    }, 300);
  };
  collapseAll = () => {
    this.graphComponent.expandOrCollapseAll(false);
    setTimeout(() => {
      this.graphComponent.fit();
    }, 300);
  };
  getMetric = (metrics, operator, metricKey, strategy) => {
    const canUseId = metrics.some(
      m => !!m[`${operator.operator_id}.${metricKey}`]
    );
    const spliceKey = `${
      canUseId ? operator.operator_id : operator.metric_name
      }.${metricKey}`;
    switch (strategy) {
      case MetricsGetStrategy.MAX:
        return Math.max(...metrics.map(m => this.parseFloat(m[spliceKey])));
      case MetricsGetStrategy.MIN:
        return Math.min(...metrics.map(m => this.parseFloat(m[spliceKey])));
      case MetricsGetStrategy.SUM:
        return metrics
          .map(m => this.parseFloat(m[spliceKey]))
          .reduce((a, b) => a + b, 0);
      case MetricsGetStrategy.FIRST:
        return this.parseFloat(metrics[0][spliceKey]);
      default:
        return null;
    }
  };
  render() {
    return (
      <div className="nz-graph">
        <div className={cs({ graphAction: true, hied: this.selectedNode })}>
          <a onClick={() => this.graphComponent.fit()}>Fit Window</a>
          <span className="ant-divider" />
          <a onClick={() => this.expandAll()}>Expand All</a>
          <span className="ant-divider" />
          <a onClick={() => this.collapseAll()}>Collapse All</a>
        </div>
        <svg id="svg" ref="$svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" />
            </filter>
            <path
              id="reference-arrowhead-path"
              d="M 0,0 L 10,5 L 0,10 C 3,7 3,3 0,0"
            />
            <marker
              className="reference-arrowhead"
              id="reference-arrowhead-small"
              viewBox="0 0 10 10"
              markerWidth="5"
              markerHeight="5"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#reference-arrowhead-path" />
            </marker>
            <marker
              className="reference-arrowhead"
              id="reference-arrowhead-medium"
              viewBox="0 0 10 10"
              markerWidth="13"
              markerHeight="13"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#reference-arrowhead-path" />
            </marker>
            <marker
              className="reference-arrowhead"
              id="reference-arrowhead-large"
              viewBox="0 0 10 10"
              markerWidth="16"
              markerHeight="16"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#reference-arrowhead-path" />
            </marker>
            <marker
              className="reference-arrowhead"
              id="reference-arrowhead-xlarge"
              viewBox="0 0 10 10"
              markerWidth="20"
              markerHeight="20"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#reference-arrowhead-path" />
            </marker>

            <path
              id="dataflow-arrowhead-path"
              d="M 0,0 L 10,5 L 0,10 C 3,7 3,3 0,0"
            />
            <circle id="dataflow-start-path" r="5" cy="5" cx="5" />
            <marker
              className="dataflow-start-highlight"
              id="dataflow-start-highlight"
              viewBox="0 0 10 10"
              markerWidth="12"
              markerHeight="12"
              refX="12"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-start-path" />
            </marker>
            <marker
              className="dataflow-arrowhead"
              id="dataflow-arrowhead-small"
              viewBox="0 0 10 10"
              markerWidth="10"
              markerHeight="10"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-arrowhead-path" />
            </marker>
            <marker
              className="dataflow-arrowhead-highlight"
              id="dataflow-arrowhead-small-highlight"
              viewBox="0 0 10 10"
              markerWidth="10"
              markerHeight="10"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-arrowhead-path" />
            </marker>
            <marker
              className="dataflow-arrowhead"
              id="dataflow-arrowhead-medium"
              viewBox="0 0 10 10"
              markerWidth="13"
              markerHeight="13"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-arrowhead-path" />
            </marker>
            <marker
              className="dataflow-arrowhead"
              id="dataflow-arrowhead-large"
              viewBox="0 0 10 10"
              markerWidth="16"
              markerHeight="16"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-arrowhead-path" />
            </marker>
            <marker
              className="dataflow-arrowhead"
              id="dataflow-arrowhead-xlarge"
              viewBox="0 0 10 10"
              markerWidth="20"
              markerHeight="20"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <use xlinkHref="#dataflow-arrowhead-path" />
            </marker>

            <marker
              id="annotation-arrowhead"
              markerWidth="5"
              markerHeight="5"
              refX="5"
              refY="2.5"
              orient="auto"
            >
              <path d="M 0,0 L 5,2.5 L 0,5 L 0,0" />
            </marker>
            <marker
              id="annotation-arrowhead-faded"
              markerWidth="5"
              markerHeight="5"
              refX="5"
              refY="2.5"
              orient="auto"
            >
              <path d="M 0,0 L 5,2.5 L 0,5 L 0,0" />
            </marker>
            <marker
              id="ref-annotation-arrowhead"
              markerWidth="5"
              markerHeight="5"
              refX="0"
              refY="2.5"
              orient="auto"
            >
              <path d="M 5,0 L 0,2.5 L 5,5 L 5,0" />
            </marker>
            <marker
              id="ref-annotation-arrowhead-faded"
              markerWidth="5"
              markerHeight="5"
              refX="0"
              refY="2.5"
              orient="auto"
            >
              <path d="M 5,0 L 0,2.5 L 5,5 L 5,0" />
            </marker>
            <ellipse
              id="op-node-stamp"
              rx="7.5"
              ry="3"
              stroke="inherit"
              fill="inherit"
            />
            <ellipse
              id="op-node-annotation-stamp"
              rx="5"
              ry="2"
              stroke="inherit"
              fill="inherit"
            />
            <g id="op-series-vertical-stamp">
              <use xlinkHref="#op-node-stamp" x="8" y="9" />
              <use xlinkHref="#op-node-stamp" x="8" y="6" />
              <use xlinkHref="#op-node-stamp" x="8" y="3" />
            </g>
            <g id="op-series-horizontal-stamp">
              <use xlinkHref="#op-node-stamp" x="16" y="4" />
              <use xlinkHref="#op-node-stamp" x="12" y="4" />
              <use xlinkHref="#op-node-stamp" x="8" y="4" />
            </g>
            <g id="op-series-annotation-stamp">
              <use xlinkHref="#op-node-annotation-stamp" x="9" y="2" />
              <use xlinkHref="#op-node-annotation-stamp" x="7" y="2" />
              <use xlinkHref="#op-node-annotation-stamp" x="5" y="2" />
            </g>
            <svg
              id="summary-icon"
              fill="#848484"
              height="12"
              viewBox="0 0 24 24"
              width="12"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>

            <g id="linearGradients" />

            <pattern
              id="rectHatch"
              patternTransform="rotate(45 0 0)"
              width="5"
              height="5"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="5" style={{ strokeWidth: 1 }} />
            </pattern>
            <pattern
              id="ellipseHatch"
              patternTransform="rotate(45 0 0)"
              width="2"
              height="2"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="2" style={{ strokeWidth: 1 }} />
            </pattern>

            <filter
              id="health-pill-shadow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
              <feOffset dx="0" dy="0" result="offsetblur" />
              <feFlood floodColor="#000000" />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            className={cs("graph-make", "nz-graph-make")}
            width="10000"
            height="10000"
          />
          <g ref="$root" />
        </svg>
        <div ref="$minmapDiv" className="nz-graph-minmap">
          <svg>
            <defs>
              <filter
                id="minimapDropShadow"
                x="-20%"
                y="-20%"
                width="150%"
                height="150%"
              >
                <feOffset result="offOut" in="SourceGraphic" dx="1" dy="1" />
                <feColorMatrix
                  result="matrixOut"
                  in="offOut"
                  type="matrix"
                  values="0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.5 0"
                />
                <feGaussianBlur
                  result="blurOut"
                  in="matrixOut"
                  stdDeviation="2"
                />
                <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
              </filter>
            </defs>
            <rect />
          </svg>
          <canvas className="first" />
          <canvas className="second" />
          <canvas className="download" />
        </div>
      </div>
    );
  }
}


FlinkGraph.propTypes = {
  jobDetailCorrect: PropTypes.any
};

