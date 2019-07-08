import $ from "jquery";

const canToggleExpand = renderNodeInfo => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[0].attr["virtual"]);
};
const COLOR_MAP = {
  TOTAL      : '#112641',
  RUNNING    : '#52c41a',
  FAILED     : '#f5222d',
  FINISHED   : '#1890ff',
  CANCELED   : '#fa8c16',
  CANCELING  : '#faad14',
  CREATED    : '#2f54eb',
  DEPLOYING  : '#13c2c2',
  RECONCILING: '#eb2f96',
  SCHEDULED  : '#722ed1',
  IN_PROGRESS: '#faad14',
  COMPLETED  : '#1890ff'
};
export default class FlinkGraphNodePortal {
  constructor(nodeInfo, flinkGraph, graphComponent) {
    this.flinkGraph = flinkGraph;
    this.graphComponent = graphComponent;
    this.nodeInfo = nodeInfo;
    this.template = null;
    this.nodeselect$  =  (msg, data) => {
      console.log(msg)
      console.log(data)
      if (
        data.eventName === "node-select" &&
        data.event.name === this.nodeInfo.node.name
      ) {
        this.nodeClick();
      }
    }
    this.graphComponent.event.addListener(
      "node-select",
      this.nodeselect$
    );
    this.groupnodeTemplate =
      "" +
      '<div class="group-wrapper">\n' +
      '    <div class="group-header">\n' +
      '      <h4 class="node-title">\n' +
      '      <span class="action-title">\n' +
      '        <span class="vertex">\n' +
      "          Vertex\n" +
      "        </span>\n" +
      '        <span class="parallel">\n' +
      "          Parallel: \n" +
      "        </span>\n" +
      "      </span>\n" +
      '        <a class="toggle-expand">\n' +
      '          <i nz-icon type="minus" theme="outline"></i>\n' +
      "        </a>\n" +
      "      </h4>\n" +
      "    </div>\n" +
      '    <div class="group-body">\n' +
      '       <h5 class="sub-title"></h5>\n' +
      '      <div class="attr-wrap">\n' +
      '        <p class="attr"><span class="attr-name">Parallelism</span></p>\n' +
      '        <p class="attr">\n' +
      "          <span class=\"attr-name\">In Queue</span>'-'\n" +
      "        </p>\n" +
      '        <p class="attr">\n' +
      "          <span class=\"attr-name\">Out Queue</span>'-'\n" +
      "        </p>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "  </div>";
    this.NonGroupnodeTemplate =
      "" +
      "<div\n" +
      '    class="op-wrapper">\n' +
      '    <div class="attr-wrap">\n' +
      '      <p class="attr"></p>\n' +
      '      <p class="attr"></p>\n' +
      "    </div>\n" +
      '    <div class="node-name">\n' +
      "      <p>\n" +
      "      </p>\n" +
      "    </div>\n" +
      "  </div>";
  }

  ngOnInit = () => {
    this.update();
  };

  ngOnDestroy = () => {
    this.graphComponent.event.removeListener("node-select",this.nodeselect$);
  };
  nodeClick = () => {
    this.graphComponent.event.emit({
      eventName: "vertices-click",
      event: this.flinkGraph.getNodesItemCorrect(this.nodeInfo.node.name)
    });
  };

  toggleExpand = ($event /*:MouseEvent*/) => {
    $event.preventDefault();
    $event.stopPropagation();
    this.graphComponent.nodeToggleExpand({
      name: this.nodeInfo.node.name
    });
  };

  update = () => {
    if (this.nodeInfo.node.isGroupNode) {
      this.verticesDetail = this.flinkGraph.getVerticesDetail(this.nodeInfo);
      this.canToggleExpand = canToggleExpand(this.nodeInfo);
    } else {
      this.operatorsDetail = this.flinkGraph.getOperatorsDetail(this.nodeInfo);
    }
    this.renderResult();
  };
  onNonGroupNodeClick=(e) => {
    console.log(e)

    if (this.nodeInfo.node.isGroupNode) {
      return
    } else {
      this.nodeClick()
    }
  }
  onGroupNodeClick = (e) => {
    console.log(e)
    if (this.nodeInfo.expanded) {
      return
    } else {
      this.nodeClick()
    }
  }
  renderResult = () => {
    if (!this.nodeInfo.node.isGroupNode) {
      this.template = $(this.NonGroupnodeTemplate);
      if (this.operatorsDetail) {
        if (this.operatorsDetail.abnormal) {
          this.template.find("div.op-wrapper").addClass("danger-node");
        }
        this.template.find("div.op-wrapper").on("click",e=>this.onNonGroupNodeClick(e));
        this.template
          .find("p.attr:eq(0)")
          .html(`<span class="attr-name">Records Received: ${this.operatorsDetail.numRecordsIn}</span>`);
        this.template
          .find("p.attr:eq(1)")
          .html(`<span class="attr-name">Records Sent: ${this.operatorsDetail.numRecordsOut}</span>`);
        this.template.find("div.node-name p").html(this.operatorsDetail.displayName);
      }
    } else {
      this.template = $(this.groupnodeTemplate);
      if (this.verticesDetail) {
        if (
          this.verticesDetail.inQueue >= 1 ||
          this.verticesDetail.outQueue >= 1
        ) {
          this.template.find("div.group-wrapper").addClass("danger-node");
        }
        if (this.nodeInfo.expanded) {
          this.template.find("div.group-wrapper").addClass("expanded");
          this.template.find("span.vertex").hide();
          this.template.find("h5.sub-title").hide();
          this.template.find("div.attr-wrap").hide();

          this.template
            .find("a.toggle-expand")
            .html(`<i>
                    <svg viewBox="64 64 896 896" class="" data-icon="minus" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
                    </svg>
                </i>`);
        } else {
          this.template.find("span.parallel").hide();
          this.template
            .find("a.toggle-expand")
            .html(`<i>
                    <svg viewBox="64 64 896 896" class="" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                    </svg>
                    </i>`);
          this.template.find("h5.sub-title").show();
          this.template.find("div.attr-wrap").show();

        }
        if (this.canToggleExpand) {
          this.template
            .find("span.vertex")
            .text(`Vertex(${this.nodeInfo.node.cardinality} ops)  ${this.verticesDetail.status}`);
        } else {
          this.template.find("span.vertex").text(`Vertex`);
          this.template.find("a.toggle-expand").hide();
        }
        if (this.verticesDetail.status) {
          this.template.find("div.group-header").css('background',COLOR_MAP[this.verticesDetail.status])
        }
        this.template.find("div.group-body").click(e=>this.onGroupNodeClick(e))

        this.template.find("h5.sub-title").text(this.verticesDetail.displayName);
        this.template
        this.template
          .find("a.toggle-expand")
          .click(event => this.toggleExpand(event));
        this.template
          .find("span.parallel")
          .html(
            `Parallel: ${
              this.verticesDetail.parallelism
              }<span class="ant-divider" />InQ: ${
              this.verticesDetail.inQueue
              }%<span class="ant-divider" /> OutQ: ${
              this.verticesDetail.outQueue
              }%`
          );
        this.template
          .find("div.attr-wrap p.attr:eq(0)")
          .html(
            `<span class="attr-name">Parallelism</span>: ${
              this.verticesDetail.parallelism
              }`
          );
        this.template
          .find("div.attr-wrap p.attr:eq(1)")
          .html(
            `<span class="attr-name">In Queue</span>: ${
              this.verticesDetail.inQueue
              }`
          );
        if (this.verticesDetail.inQueue >= 1) {
          this.template.find("div.attr-wrap p.attr:eq(1)").addClass("danger-attr");
        }
        this.template
          .find("div.attr-wrap p.attr:eq(2)")
          .html(
            `<span class="attr-name">Out Queue</span>: ${
              this.verticesDetail.outQueue
              }`
          );
        if (this.verticesDetail.outQueue >= 1) {
          this.template.find("div.attr-wrap p.attr:eq(2)").addClass("danger-attr");
        }
      }
    }
  };
}
