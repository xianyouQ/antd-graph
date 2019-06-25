import $ from 'jquery'
export default class FlinkGraphNodePortal {
  constructor(nodeInfo,flinkGraph,graphComponent) {

    this.finkGraph = flinkGraph
    this.graphComponent = graphComponent
    this.nodeInfo = nodeInfo
    this.template = null

    this.nodeselect$ = this.graphComponent.addListener((msg,data) => {
      if (data.eventName === 'node-select' && data.event.name === this.nodeInfo.node.name) {
        this.nodeClick();
      }
    });
    this.groupnodeTemplate = "" +
      "<div class=\"group-wrapper\"\n" +
      "    <div class=\"group-header\">\n" +
      "      <h4 class=\"node-title\">\n" +
      "      <span class=\"action-title\">\n" +
      "        <span class=\"vertex\">\n" +
      "          Vertex\n" +
      "        </span>\n" +
      "        <span class=\"parallel\">\n" +
      "          Parallel: \n" +
      "        </span>\n" +
      "      </span>\n" +
      "        <a class=\"toggle-expand\">\n" +
      "          <i nz-icon type=\"minus\" theme=\"outline\"></i>\n" +
      "        </a>\n" +
      "      </h4>\n" +
      "    </div>\n" +
      "    <div class=\"group-body\">\n" +
      "       <h5 class=\"sub-title\"></h5>\n" +
      "      <div class=\"attr-wrap\">\n" +
      "        <p class=\"attr\"><span class=\"attr-name\">Parallelism</span></p>\n" +
      "        <p class=\"attr\">\n" +
      "          <span class=\"attr-name\">In Queue</span>: '-'\n" +
      "        </p>\n" +
      "        <p class=\"attr\">\n" +
      "          <span class=\"attr-name\">Out Queue</span>: '-'\n" +
      "        </p>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "  </div>"
    this.NonGroupnodeTemplate = "" +
      "<div\n" +
      "    class=\"op-wrapper\"\n" +
      "    <div class=\"attr-wrap\">\n" +
      "      <p class=\"attr\"><span class=\"attr-name\">Records Received</span>: </p>\n" +
      "      <p class=\"attr\"><span class=\"attr-name\">Records Sent</span>: </p>\n" +
      "    </div>\n" +
      "    <div class=\"node-name\">\n" +
      "      <p>\n" +
      "      </p>\n" +
      "    </div>\n" +
      "  </div>"
  }

  ngOnInit = () => {
    this.update();
  }

  ngOnDestroy = () => {
    this.graphComponent.event.removeListener(this.nodeselect$);
  }
  nodeClick = () => {
    if (!this.nodeInfo.node.isGroupNode) {
      return;
    }
    this.graphComponent.event.emit({
      eventName: 'vertices-click',
      event: this.finkGraph.getNodesItemCorrect(this.nodeInfo.node.name)
    });
  }

  toggleExpand = ($event /*:MouseEvent*/) => {
    $event.preventDefault();
    $event.stopPropagation();
    this.graphComponent.nodeToggleExpand({
      name: this.nodeInfo.node.name
    });
  }

  update = () => {
    if (this.nodeInfo.node.isGroupNode) {
      this.verticesDetail = this.finkGraph.getVerticesDetail(this.nodeInfo);
      this.canToggleExpand = this.finkGraph.canToggleExpand(this.nodeInfo);
    } else {
      this.operatorsDetail = this.finkGraph.getOperatorsDetail(this.nodeInfo);
    }
    this.renderResult()
  }
  renderResult = () => {
    if (this.nodeInfo.node.isGroupNode) {
      let template = $(this.NonGroupnodeTemplate)
      if (this.operatorsDetail) {
        if (this.operatorsDetail.abnormal) {
          this.template.find("div.op-wrapper").addClass("danger-node")
        }
        template.find("span.attr-name:eq(0)").after(`: ${this.operatorsDetail.numRecordsIn}`)
        template.find("span.attr-name:eq(1)").after(`: ${this.operatorsDetail.numRecordsOut}`)
        template.find("div.node-name p").html(this.operatorsDetail.displayName)
      }
      this.template = template
    }
    else {
      let template = $(this.groupnodeTemplate)
      if (this.verticesDetail) {
        if (this.verticesDetail.inQueue >= 1 || this.verticesDetail.outQueue >= 1) {
          template.find("div.group-wrapper").addClass("danger-node")
        }
        if (this.nodeInfo.expanded) {
          template.find("div.group-wrapper").addClass("expanded")
          template.find("span.vertex").hide()
          template.find("span.parallel").html(`Parallel: ${this.verticesDetail.parallelism}<span className="ant-divider" />InQ: ${this.verticesDetail.inQueue}%<span className="ant-divider" /> OutQ: ${this.verticesDetail.outQueue}%}`)
          template.find("a.toggle-expand").html(`<i nz-icon type="minus" theme="outline"></i>`)
          template.find("a.toggle-expand").click((event) => this.toggleExpand(event))
        }
        else {
          template.find("span.parallel").hide()
          template.find("a.toggle-expand").html(`<i nz-icon type="plus" theme="outline"></i>`)
        }
        if (this.canToggleExpand) {
          template.find("span.vertex").text(`Vertex(${this.nodeInfo.node.cardinality} Operators)`)
          template.find("h5.sub-title").hide()
        } else {
          template.find("span.vertex").text(`Vertex`)
          template.find("h5.sub-title").text(this.verticesDetail.displayName)
          template.find("a.toggle-expand").hide()
        }
        template.find("div.attr-wrap p.attr:eq(0)").html(`<span class="attr-name">Parallelism</span>: ${this.verticesDetail.parallelism}`)
        template.find("div.attr-wrap p.attr:eq(1)").html(`<span class="attr-name">In Queue</span>: ${this.verticesDetail.inQueue}`)
        if (this.verticesDetail.inQueue  >= 1) {
          template.find("div.attr-wrap p.attr:eq(1)").addClass("danger-attr")
        }
        template.find("div.attr-wrap p.attr:eq(2)").html(`<span class="attr-name">Out Queue</span>: ${this.verticesDetail.outQueue}`)
        if (this.verticesDetail.outQueue  >= 1) {
          template.find("div.attr-wrap p.attr:eq(2)").addClass("danger-attr")
        }
      }
      this.template = template
    }

  }
}
