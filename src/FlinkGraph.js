import React, { PropTypes, Component } from "react";
import { message } from "antd";
import rd3 from "react-d3-library";
import GraphComponent from "./GraphComponent";
import * as d3 from "d3";
import { EventEmitter } from "events";
import cs from "classnames";

const RD3Component = rd3.Component;
const opNameMaxLength = 512;

const graphTimeoutRange = d3
  .scaleLinear()
  .domain([50, 100, 300, 500])
  .range([250, 500, 800, 1000])
  .clamp(true);

const canToggleExpand = renderNodeInfo => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[0].attr["virtual"]);
};
let emitter = new EventEmitter();

export default class FlinkGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      d3: ""
    };
    this.graphComponent = new GraphComponent(canToggleExpand, emitter);
    this.graphComponent.ngOnInit();
    this.transformCache = null;
    this.verticesDetailsCache = new Map();
    this.operatorsDetailsCache = new Map();
  }
  componentDidMount() {
    this.itemChange = emitter.addListener("node-toggle-expand", (msg, data) =>
      console.log(msg)
    ); //注册事件
    const { jobDetailCorrect } = this.props;
    this.initGraph(jobDetailCorrect);
  }
  componentWillUnmount() {
    emitter.removeListener(this.itemChange); //取消事件
    this.graphComponent.ngOnDestroy();
  }

  componentWillReceiveProps(newProps) {
    const { jobDetailCorrect } = newProps;
    this.initGraph(jobDetailCorrect);
  }

  initGraph = data => {
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

            this.setState({
              ...this.state,
              d3: this.graphComponent.baseRoot()
            });
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
    if (this.transformCache || !this.graphComponent.zoom.zoomTransform) {
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
    console.log(data);
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
  render() {
    console.log("d3");
    console.log(this.state.d3);
    return (
      <div>
        <div className={cs({ graphAction: true, hied: this.selectedNode })}>
          <a onClick={() => this.graphComponent.fit()}>Fit Window</a>
          <span className="ant-divider" />
          <a onClick={() => this.expandAll()}>Expand All</a>
          <span className="ant-divider" />
          <a onClick={() => this.collapseAll()}>Collapse All</a>
        </div>
        <RD3Component data={this.state.d3} />
      </div>
    );
  }
}

FlinkGraph.propTypes = {
  jobDetailCorrect: PropTypes.object
};
