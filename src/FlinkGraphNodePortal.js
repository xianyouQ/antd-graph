import React, { Component } from "react";
import PropTypes from "prop-types";
import cs from "classnames";

const canToggleExpand1 = renderNodeInfo => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[0].attr["virtual"]);
};
const COLOR_MAP = {
  TOTAL: "#112641",
  RUNNING: "#52c41a",
  FAILED: "#f5222d",
  FINISHED: "#1890ff",
  CANCELED: "#fa8c16",
  CANCELING: "#faad14",
  CREATED: "#2f54eb",
  DEPLOYING: "#13c2c2",
  RECONCILING: "#eb2f96",
  SCHEDULED: "#722ed1",
  IN_PROGRESS: "#faad14",
  COMPLETED: "#1890ff"
};
export default class FlinkGraphNodePortal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeInfo: null,
      operatorsDetail: null,
      verticesDetail: null,
      canToggleExpand: null
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.graphComponent.event.removeListener("node-select", this.nodeselect$);
  }

  componentWillMount() {
    const {
      graphComponent,
      nodeInfo,
      verticesDetail,
      operatorsDetail
    } = this.props;
    this.graphComponent = graphComponent;
    this.state.nodeInfo = nodeInfo;
    if (nodeInfo.node.isGroupNode) {
      this.state.canToggleExpand = canToggleExpand1(nodeInfo);
    }
    this.state.verticesDetail = verticesDetail;
    this.state.operatorsDetail = operatorsDetail;

    this.nodeselect$ = (msg, data) => {
      if (
        data.eventName === "node-select" &&
        data.event.name === this.nodeInfo.node.name
      ) {
        this.nodeClick();
      }
    };
    this.graphComponent.event.addListener("node-select", this.nodeselect$);
  }

  nodeClick = () => {
    this.graphComponent.event.emit({
      eventName: "vertices-click",
      event: this.state.nodeInfo.node.name
    });
  };

  toggleExpand = ($event /*:MouseEvent*/) => {
    $event.preventDefault();
    $event.stopPropagation();
    this.graphComponent.nodeToggleExpand({
      name: this.nodeInfo.node.name
    });
  };

  onNonGroupNodeClick = () => {
    if (this.state.nodeInfo && this.state.nodeInfo.node.isGroupNode) {
      return;
    } else {
      this.nodeClick();
    }
  };
  onGroupNodeClick = () => {
    if (this.state.nodeInfo && this.state.nodeInfo.expanded) {
      return;
    } else {
      this.nodeClick();
    }
  };

  render() {
    const {
      nodeInfo,
      operatorsDetail,
      verticesDetail,
      canToggleExpand
    } = this.state;

    if (nodeInfo == null) {
      return null;
    } else if (nodeInfo.node.isGroupNode == true && verticesDetail) {
      return (
        <div
          className={cs({
            "group-wrapper": true,
            "danger-node":
            verticesDetail.inQueue >= 1 || verticesDetail.outQueue >= 1,
            expanded: nodeInfo.expanded
          })}
        >
          <div
            className="group-header"
            style={{ backgroundColor: COLOR_MAP[verticesDetail.status] }}
          >
            <h4 className="node-title">
              <span className="action-title">
                {!nodeInfo.expanded &&
                (canToggleExpand ? (
                  <span className="vertex">{`Vertex(${
                    nodeInfo.node.cardinality
                    } ops) ${verticesDetail.status}`}</span>
                ) : (
                  <span className="vertex">Vertex</span>
                ))}
              </span>
              {canToggleExpand && (
                <a className="toggle-expand" onClick={e=>this.toggleExpand(e)}>
                  {nodeInfo.expanded ? (
                    <i>
                      <svg
                        viewBox="64 64 896 896"
                        data-icon="minus"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
                      </svg>
                    </i>
                  ) : (
                    <i>
                      <svg
                        viewBox="64 64 896 896"
                        data-icon="plus"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                        <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
                      </svg>
                    </i>
                  )}
                </a>
              )}
            </h4>
          </div>
          <div className="group-body" onClick={this.onGroupNodeClick}>
            {!nodeInfo.expanded && (
              <h5 className="sub-title">{verticesDetail.displayName}</h5>
            )}
            {!nodeInfo.expanded && (
              <div className="attr-wrap">
                <p className="attr">
                  <span className="attr-name">Parallelism</span>
                  {`: ${verticesDetail.parallelism}`}
                </p>
                <p
                  className={cs({
                    attr: true,
                    "danger-attr": verticesDetail.inQueue >= 1
                  })}
                >
                  <span className="attr-name">In Queue</span>
                  {`: ${verticesDetail.inQueue}`}
                </p>
                <p
                  className={cs({
                    attr: true,
                    "danger-attr": verticesDetail.outQueue >= 1
                  })}
                >
                  <span className="attr-name">Out Queue</span>
                  {`: ${verticesDetail.outQueue}`}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (nodeInfo.node.isGroupNode != true && operatorsDetail != null) {
      return (
        <div
          className={cs({
            "op-wrapper": true,
            "danger-node": operatorsDetail.abnormal
          })}
          onClick={this.onNonGroupNodeClick}
        >
          <div className="attr-wrap">
            <p className="attr">
              <span className="attr-name">{`Records Received: ${
                operatorsDetail.numRecordsIn
                }`}</span>
            </p>
            <p className="attr">
              <span className="attr-name">{`Records Sent: ${
                operatorsDetail.numRecordsOut
                }`}</span>
            </p>
          </div>
          <div className="node-name">
            <p>{operatorsDetail.displayName}</p>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}
