import React, { PropTypes, Component } from 'react'

import rd3 from 'react-d3-library'
import GraphComponent from './GraphComponent'
import * as d3 from 'd3'
import {EventEmitter} from 'events'
import cs from 'classnames'

const RD3Component = rd3.Component;

const graphTimeoutRange = d3.scaleLinear().domain([ 50, 100, 300, 500 ])
  .range([ 250, 500, 800, 1000 ]).clamp(true);

const canToggleExpand = (renderNodeInfo) => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[ 0 ].attr[ 'virtual' ]);
};
let emitter = new EventEmitter();

export  default  class finkGraph extends Component {
  constructor(props) {
    super(props)
    this.state = {
      d3:''
    }
    this.graphComponent = GraphComponent(canToggleExpand,emitter,null)
    this.transformCache = null
    this.verticesDetailsCache = new Map();
    this.operatorsDetailsCache = new Map();
  }
  componentDidMount() {
    this.itemChange = emitter.addListener('node-toggle-expand',(msg,data)=>console.log(msg));//注册事件

    const {
      jobDetailCorrect
    } = this.props
    this.initGraph(jobDetailCorrect)
  }
  componentWillUnmount(){
    emitter.removeListener(this.itemChange);//取消事件
  }

  componentWillReceiveProps(newProps) {
    const {
      jobDetailCorrect
    } = newProps
    this.initGraph(jobDetailCorrect)
  }

  initGraph = ( data) => {
    const graphDef = this.parseGraphData(data);
    this.cleanDetailCache();
    this.graphComponent.buildGraph(graphDef)
      .then(graph => this.graphComponent.buildRenderGraphInfo(graph))
      .then(() => {
        this.graphComponent.clean();
        this.graphComponent.build();
        setTimeout(() => {
          this.graphComponent.fit(0, .8);
        }, (data.plan && data.plan.nodes) ? graphTimeoutRange(data.plan.nodes.length) : 200);
      });
    this.setState({...this.state,d3: this.graphComponent.baseRoot})

  }

  cleanDetailCache = ()  => {
    this.verticesDetailsCache.clear();
    this.operatorsDetailsCache.clear();
  }
  /*
  updateData = (data) => {
    this.sourceData = data;
    this.operatorsDetailsCache.forEach((v, k) => {
      Object.assign(v, this.getOperatorsDetail(k, true));
      this.graphComponent.emitChangeByNodeInfo(k);
    });
    this.verticesDetailsCache.forEach((v, k) => {
      Object.assign(v, this.getVerticesDetail(k, true));
      this.graphComponent.emitChangeByNodeInfo(k);
    });
  }
  */
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
  parseGraphData = (data) => {
    this.sourceData = data;
    const nodes = [];
    const getNamespaces = operatorId => {
      const op = data.verticesDetail.operators.find(e => e.operator_id === operatorId);
      return op.vertex_id ? `${op.vertex_id}/${op.operator_id}` : op.operator_id;
    };
    data.verticesDetail.operators.forEach(op => {
      nodes.push({
        name  : getNamespaces(op.operator_id),
        inputs: op.inputs.map(e => {
          return {
            name: getNamespaces(e.operator_id),
            attr: { ...e }
          };
        }),
        attr  : { ...op }
      });
    });

    this.graphDef = {
      nodes
    };
    return this.graphDef;
  }
  resetTransform = () => {
      if (!this.transformCache) {
        if (this.graphComponent && this.graphComponent.fit) {
          this.graphComponent.fit();
        }
        return;
      }
      const transform = d3.zoomIdentity
        .scale(this.transformCache.k)
        .translate(this.transformCache.x / this.transformCache.k, this.transformCache.y / this.transformCache.k);

      d3.select(this.graphComponent.zoom.containerEle)
        .transition().duration(500)
        .call(this.graphComponent.zoom.zoom.transform, transform);
      this.transformCache = null;
  }



  getVerticesDetail = (nodeRenderInfo, force) =>   {
    if (this.verticesDetailsCache.has(nodeRenderInfo) && !force) {
      return this.verticesDetailsCache.get(nodeRenderInfo);
    }
    const vertices = this.sourceData.verticesDetail.vertices.find(v => v.id === nodeRenderInfo.node.name);
    if (!vertices) {
      return null;
    }

    let displayName = '';
    let inQueue = null;
    let outQueue = null;
    if (vertices.name) {
      displayName = vertices.name.length > 125 ? `${vertices.name.substring(0, 125)}...` : vertices.name;
    } else {
      displayName = vertices.name;
    }

    if (vertices.metrics && Number.isFinite(vertices.metrics[ 'buffers-in-pool-usage-max' ])) {
      inQueue = vertices.metrics[ 'buffers-in-pool-usage-max' ] === -1
        ? null
        : vertices.metrics[ 'buffers-in-pool-usage-max' ];
    } else {
      inQueue = Math.max(
        ...vertices.subtask_metrics
          .map(m => this.parseFloat(m[ 'buffers.inPoolUsage' ]))
      );
    }

    if (vertices.metrics && Number.isFinite(vertices.metrics[ 'buffers-out-pool-usage-max' ])) {
      outQueue = vertices.metrics[ 'buffers-out-pool-usage-max'] === -1
        ? null
        : vertices.metrics[ 'buffers-out-pool-usage-max' ];
    } else {
      outQueue = Math.max(
        ...vertices.subtask_metrics
          .map(m => this.parseFloat(m[ 'buffers.outPoolUsage' ]))
      );
    }

    this.verticesDetailsCache.set(nodeRenderInfo, {
      displayName,
      name       : vertices.name,
      inQueue    : Number.isFinite(inQueue) ? inQueue : null,
      outQueue   : Number.isFinite(outQueue) ? outQueue : null,
      parallelism: this.parseFloat(vertices.parallelism) || vertices.subtask_metrics.length
    });

    return this.verticesDetailsCache.get(nodeRenderInfo);
  }

  getOperatorsDetail = (nodeRenderInfo,force ) => {
    if (this.operatorsDetailsCache.has(nodeRenderInfo) && !force) {
      return this.operatorsDetailsCache.get(nodeRenderInfo);
    }
    const operator = this.sourceData.verticesDetail.operators
      .find(o => o.operator_id === nodeRenderInfo.node.attr[ 'operator_id' ]);

    if (!operator) {
      return null;
    }

    let displayName = '';
    if (operator.name.length > opNameMaxLength) {
      displayName = `${operator.name.substring(0, opNameMaxLength)}...`;
    } else {
      displayName = operator.name;
    }

    const vertices = this.sourceData.verticesDetail.vertices.find(v => v.id === operator.vertex_id);

    const numRecordsIn = this.getMetric(vertices.subtask_metrics, operator, 'numRecordsInOperator', MetricsGetStrategy.SUM);
    const numRecordsOut = this.getMetric(vertices.subtask_metrics, operator, 'numRecordsOutOperator', MetricsGetStrategy.SUM);

    const abnormal = !/^Sink:\s.+$/.test(operator.name)
      && Number.isFinite(numRecordsIn)
      && Number.isFinite(numRecordsOut)
      && numRecordsIn > 0
      && numRecordsOut <= 0;

    this.operatorsDetailsCache.set(nodeRenderInfo, {
        abnormal,
        displayName,
        name         : operator.name,
        numRecordsIn : Number.isFinite(numRecordsIn) ? `${numRecordsIn}` : ' - ',
        numRecordsOut: Number.isFinite(numRecordsOut) ? `${numRecordsOut}` : ' - '
      }
    );

    return this.operatorsDetailsCache.get(nodeRenderInfo);
  }

  parseFloat(value) {
    if (typeof value === 'number') {
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
  }
  collapseAll = () => {
    this.graphComponent.expandOrCollapseAll(false);
    setTimeout(() => {
      this.graphComponent.fit();
    }, 300);
  }
  render() {
    return (
      <div>
        <div className={cs({graphAction: true,hied:this.selectedNode})}>
          <a onClick={() => this.graphComponent.fit()}><i nz-icon type="pic-center" theme="outline"></i> Fit Window</a>
          <span className="ant-divider"/>
          <a onClick={() => this.expandAll()}><i nz-icon type="arrows-alt" theme="outline"></i> Expand All</a>
          <span className="ant-divider"/>
          <a onClick={() => this.collapseAll()}><i nz-icon type="shrink" theme="outline"></i> Collapse All</a>
        </div>
        <RD3Component data={this.state.d3} />
      </div>
    )
  }
}

finkGraph.propTypes = {
  jobDetailCorrect: PropTypes.object
}
