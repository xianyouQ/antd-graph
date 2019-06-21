/**
 * ==============================================================================
 * This product contains a modified version of 'TensorBoard plugin for graphs',
 * a Angular implementation of nest-graph visualization
 *
 * Copyright 2018 The ng-zorro-plus Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==============================================================================
 */
import * as dagre from 'dagre';
import { runAsyncTask } from './util';
import { InclusionType, NodeType, GraphType, NAMESPACE_DELIM } from './interface';
var Graph = dagre.graphlib.Graph;
/** @type {?} */
export var EDGE_KEY_DELIM = '--';
export class BaseNode{
  constructor(rawNode) {
        this.name = rawNode.name;
        this.attr = rawNode.attr;
        this.inputs = rawNode.inputs;
        this.cardinality = 1;
        this.include = InclusionType.UNSPECIFIED;
        this.isGroupNode = false;
        this.parentNode = null;
        this.type = NodeType.OP;
    }
};

export class SlimGraph{
  constructor() {
        this.nodes = {};
        this.edges = [];
    }
}


export function addEdgeToGraph(graph, outputNode, input) {
    if (input.name === outputNode.name) {
        return;
    }
    graph.edges.push({ ...input.attr,  v: input.name, w: outputNode.name });
}

export function buildDef(graphDef) {
    return runAsyncTask(function () {
        /** @type {?} */
        var graph = new SlimGraph();
        /** @type {?} */
        var graphNodes = graphDef.nodes.map(function (node) { return new BaseNode(node); });
        graphNodes.forEach(function (node) {
            graph.nodes[node.name] = node;
            node.inputs.forEach(function (input) {
                addEdgeToGraph(graph, node, input);
            });
        });
        return graph;
    });
}
export  class MetanodeImpl{
  constructor(name, opt) {
        if (opt === void 0) { opt = {}; }
        this.name = name;
        this.type = NodeType.META;
        this.depth = 1;
        this.isGroupNode = true;
        this.cardinality = 0;
        this.metagraph = createGraph(name, GraphType.META, opt);
        this.bridgegraph = null;
        this.opHistogram = {};
        this.deviceHistogram = {};
        this.xlaClusterHistogram = {};
        this.compatibilityHistogram = { compatible: 0, incompatible: 0 };
        /** unique id for a metanode of similar subgraph */
        this.templateId = null;
        /** Metanode which contains this node, if any */
        this.parentNode = null;
        this.hasNonControlEdges = false;
        this.include = InclusionType.UNSPECIFIED;
        this.associatedFunction = '';
    }
    /**
     * @return {?}
     */
    getFirstChild = () => {
        return this.metagraph.node(this.metagraph.nodes()[0]);
    };
    /**
     * @return {?}
     */
    getChildren = () => {
        var _this = this;
        return this.metagraph.nodes().map(function (node) { return _this.metagraph.node(node); });
    };
    /**
     * @return {?}
     */
    getRootOp = () => {
        return undefined;
    };
    /**
     * @return {?}
     */
    leaves = () => {
        return [];
    };
}

export class MetaedgeImpl{
  constructor(v, w) {
        this.v = v;
        this.w = w;
        this.baseEdgeList = [];
        this.inbound = null;
        this.numRegularEdges = 0;
        this.numControlEdges = 0;
        this.numRefEdges = 0;
        this.totalSize = 0;
    }
    /**
     * @param {?} edge
     * @param {?} h
     * @return {?}
     */
    addBaseEdge = (edge, h) => {
        this.baseEdgeList.push(edge);
    };
}

/**
 * @param {?} name
 * @param {?=} opt
 * @return {?}
 */
export function createMetanode(name, opt) {
    if (opt === void 0) { opt = {}; }
    return new MetanodeImpl(name, opt);
}
/**
 * @param {?} v
 * @param {?} w
 * @return {?}
 */
export function createMetaedge(v, w) {
    return new MetaedgeImpl(v, w);
}
/**
 * @param {?} name
 * @return {?}
 */
export function getHierarchicalPath(name) {
    /** @type {?} */
    var path = [];
    /** @type {?} */
    var i = name.indexOf(NAMESPACE_DELIM);
    while (i >= 0) {
        path.push(name.substring(0, i));
        i = name.indexOf(NAMESPACE_DELIM, i + 1);
    }
    path.push(name);
    return path;
}
/**
 * @template N, E
 * @param {?} name
 * @param {?} type
 * @param {?=} opt
 * @return {?}
 */
export function createGraph(name, type, opt) {
    /** @type {?} */
    var graphOptions = opt || {};
    /** @type {?} */
    var graph = new Graph(graphOptions);
    graph.setGraph((/** @type {?} */ ({
        name: name,
        rankdir: graphOptions.rankdir || 'BT',
        // BT,TB,LR,RL
        type: type
    })));
    return ((/** @type {?} */ (graph)));
}
