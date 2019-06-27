import $ from "jquery";

const canToggleExpand = renderNodeInfo => {
  const children = renderNodeInfo.node.getChildren();
  return !(children.length === 1 && children[0].attr["virtual"]);
};
export default class FlinkGraphNodePortal {
  constructor(nodeInfo, flinkGraph, graphComponent) {
    console.log(nodeInfo);
    this.flinkGraph = flinkGraph;
    this.graphComponent = graphComponent;
    this.nodeInfo = nodeInfo;
    this.template = null;
    this.nodeselect$  =  (msg, data) => {
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
      "          <span class=\"attr-name\">In Queue</span>: '-'\n" +
      "        </p>\n" +
      '        <p class="attr">\n' +
      "          <span class=\"attr-name\">Out Queue</span>: '-'\n" +
      "        </p>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "  </div>";
    this.NonGroupnodeTemplate =
      "" +
      "<div\n" +
      '    class="op-wrapper">\n' +
      '    <div class="attr-wrap">\n' +
      '      <p class="attr"><span class="attr-name">Records Received</span>: </p>\n' +
      '      <p class="attr"><span class="attr-name">Records Sent</span>: </p>\n' +
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
    if (!this.nodeInfo.node.isGroupNode) {
      return;
    }
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
  renderResult = () => {
    if (!this.nodeInfo.node.isGroupNode) {
      if (!this.template) {
        this.template = $(this.NonGroupnodeTemplate);
      }
      if (this.operatorsDetail) {
        if (this.operatorsDetail.abnormal) {
          this.template.find("div.op-wrapper").addClass("danger-node");
        }
        this.template
          .find("span.attr-name:eq(0)")
          .after(`: ${this.operatorsDetail.numRecordsIn}`);
        this.template
          .find("span.attr-name:eq(1)")
          .after(`: ${this.operatorsDetail.numRecordsOut}`);
        this.template.find("div.node-name p").html(this.operatorsDetail.displayName);
      }
    } else {
      if (!this.template) {
        this.template = $(this.groupnodeTemplate);
      }
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

          this.template
            .find("a.toggle-expand")
            .html(`<i class="anticon anticon-minus"></i>`);
        } else {
          this.template.find("span.parallel").hide();
          this.template
            .find("a.toggle-expand")
            .html(`<i class="anticon anticon-plus"></i>`);
        }
        if (this.canToggleExpand) {
          this.template
            .find("span.vertex")
            .text(`Vertex(${this.nodeInfo.node.cardinality} Operators)`);
        } else {
          this.template.find("span.vertex").text(`Vertex`);
          this.template.find("a.toggle-expand").hide();
        }
        this.template.find("h5.sub-title").text(this.verticesDetail.displayName);

        this.template
          .find("a.toggle-expand")
          .click(event => this.toggleExpand(event));
        this.template
          .find("span.parallel")
          .html(
            `Parallel: ${
              this.verticesDetail.parallelism
              }<span className="ant-divider" />InQ: ${
              this.verticesDetail.inQueue
              }%<span className="ant-divider" /> OutQ: ${
              this.verticesDetail.outQueue
              }%}`
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
