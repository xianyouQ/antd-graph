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
// tslint:disable
import { runAsyncTask } from './util';
import { createGraph, createMetaedge, createMetanode, getHierarchicalPath } from './graph';
import { BRIDGE_GRAPH_NAME, GraphType, ROOT_NAME } from './interface';
export class Hierarchy {
  constructor(graphOptions) {
        this.maxMetaEdgeSize = 1;
        this.hasShapeInfo = false;
        this.graphOptions = graphOptions || {};
        this.graphOptions.compound = true;
        this.root = createMetanode(ROOT_NAME, this.graphOptions);
        this.templates = null;
        this.devices = null;
        this.xlaClusters = null;
        this.index = {};
        this.index[ROOT_NAME] = this.root;
        this.orderings = {};
    }
    /**
     * @return {?}
     */
    getNodeMap = () => {
        return this.index;
    };
    /**
     * @param {?} name
     * @return {?}
     */
    node = (name) => {
        return this.index[name];
    };
    /**
     * @param {?} name
     * @param {?} node
     * @return {?}
     */
    setNode = (name, node) => {
        this.index[name] = node;
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getBridgegraph = (nodeName) => {
        var _this = this;
        /** @type {?} */
        var node = this.index[nodeName];
        if (!node) {
            throw Error('Could not find node in hierarchy: ' + nodeName);
        }
        if (!('metagraph' in node)) {
            return null;
        }
        /** @type {?} */
        var groupNode = (/** @type {?} */ (node));
        if (groupNode.bridgegraph) {
            return groupNode.bridgegraph;
        }
        /** @type {?} */
        var bridgegraph = createGraph(BRIDGE_GRAPH_NAME, GraphType.BRIDGE, this.graphOptions);
        groupNode.bridgegraph = bridgegraph;
        if (!node.parentNode || !('metagraph' in node.parentNode)) {
            return bridgegraph;
        }
        /** @type {?} */
        var parentNode = (/** @type {?} */ (node.parentNode));
        /** @type {?} */
        var parentMetagraph = parentNode.metagraph;
        /** @type {?} */
        var parentBridgegraph = this.getBridgegraph(parentNode.name);
        [parentMetagraph, parentBridgegraph].forEach(function (parentGraph) {
            parentGraph
                .edges()
                .filter(function (e) { return e.v === nodeName || e.w === nodeName; })
                .forEach(function (parentEdgeObj) {
                /** @type {?} */
                var inbound = parentEdgeObj.w === nodeName;
                /** @type {?} */
                var parentMetaedge = parentGraph.edge(parentEdgeObj);
                parentMetaedge.baseEdgeList.forEach(function (baseEdge) {
                    var _a = inbound ?
                        [baseEdge.w, parentEdgeObj.v] :
                        [baseEdge.v, parentEdgeObj.w], descendantName = _a[0], otherName = _a[1];
                    /** @type {?} */
                    var childName = _this.getChildName(nodeName, descendantName);
                    /** @type {?} */
                    var bridgeEdgeObj = (/** @type {?} */ ({
                        v: inbound ? otherName : childName,
                        w: inbound ? childName : otherName,
                    }));
                    /** @type {?} */
                    var bridgeMetaedge = bridgegraph.edge(bridgeEdgeObj);
                    if (!bridgeMetaedge) {
                        bridgeMetaedge = createMetaedge(bridgeEdgeObj.v, bridgeEdgeObj.w);
                        bridgeMetaedge.inbound = inbound;
                        bridgegraph.setEdge(bridgeEdgeObj.v, bridgeEdgeObj.w, bridgeMetaedge);
                    }
                    bridgeMetaedge.addBaseEdge(baseEdge, _this);
                });
            });
        });
        return bridgegraph;
    };
    /**
     * @param {?} nodeName
     * @param {?} descendantName
     * @return {?}
     */
    getChildName = (nodeName, descendantName) => {
        // Walk up the hierarchy from the descendant to find the child.
        /** @type {?} */
        var currentNode = this.index[descendantName];
        while (currentNode) {
            if (currentNode.parentNode && currentNode.parentNode.name === nodeName) {
                return currentNode.name;
            }
            currentNode = currentNode.parentNode;
        }
        throw Error('Could not find immediate child for descendant: ' + descendantName);
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getPredecessors = (nodeName) => {
        /** @type {?} */
        var node = this.index[nodeName];
        if (!node) {
            throw Error('Could not find node with name: ' + nodeName);
        }
        return this.getOneWayEdges(node, true);
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getSuccessors = (nodeName) => {
        /** @type {?} */
        var node = this.index[nodeName];
        if (!node) {
            throw Error('Could not find node with name: ' + nodeName);
        }
        return this.getOneWayEdges(node, false);
    };
    /**
     * @param {?} node
     * @param {?} inEdges
     * @return {?}
     */
    getOneWayEdges = (node, inEdges) => {
        /** @type {?} */
        var edges = { control: [], regular: [] };
        // A node with no parent cannot have any edges.
        if (!node.parentNode || !node.parentNode.isGroupNode) {
            return edges;
        }
        /** @type {?} */
        var parentNode = (/** @type {?} */ (node.parentNode));
        /** @type {?} */
        var metagraph = parentNode.metagraph;
        /** @type {?} */
        var bridgegraph = this.getBridgegraph(parentNode.name);
        findEdgeTargetsInGraph(metagraph, node, inEdges, edges);
        findEdgeTargetsInGraph(bridgegraph, node, inEdges, edges);
        return edges;
    };
}

/**
 * @param {?} graph
 * @param {?} params
 * @return {?}
 */
export function buildHierarchy(graph, params) {
    /** @type {?} */
    var h = new Hierarchy({ 'rankdir': params.rankDirection });
    return runAsyncTask(function () { return addNodes(h, graph); })
        // groupSeries
        .then(function () { return addEdges(h, graph); })
        .then(function () { return h; });
}
/**
 * @param {?} h
 * @param {?} graph
 * @return {?}
 */
function addNodes(h, graph) {
    Object.keys(graph.nodes).forEach(function (key) {
        /** @type {?} */
        var node = graph.nodes[key];
        /** @type {?} */
        var path = getHierarchicalPath(node.name);
        /** @type {?} */
        var parent = h.root;
        parent.depth = Math.max(path.length, parent.depth);
        for (var i = 0; i < path.length; i++) {
            parent.depth = Math.max(parent.depth, path.length - i);
            parent.cardinality += node.cardinality;
            if (i === path.length - 1) {
                break;
            }
            /** @type {?} */
            var name_1 = path[i];
            /** @type {?} */
            var child = (/** @type {?} */ (h.node(name_1)));
            if (!child) {
                child = createMetanode(name_1, h.graphOptions);
                child.parentNode = parent;
                h.setNode(name_1, child);
                parent.metagraph.setNode(name_1, child);
            }
            parent = child;
        }
        h.setNode(node.name, node);
        node.parentNode = parent;
        parent.metagraph.setNode(node.name, node);
    });
}
/**
 * @param {?} h
 * @param {?} graph
 * @return {?}
 */
function addEdges(h, graph) {
    /** @type {?} */
    var nodeIndex = h.getNodeMap();
    /** @type {?} */
    var sourcePath = [];
    /** @type {?} */
    var destPath = [];
    /** @type {?} */
    var getPath = function (node, path) {
        /** @type {?} */
        var i = 0;
        while (node) {
            path[i++] = node.name;
            node = node.parentNode;
        }
        return i - 1;
    };
    graph.edges.forEach(function (baseEdge) {
        /** @type {?} */
        var sourceAncestorIndex = getPath(graph.nodes[baseEdge.v], sourcePath);
        /** @type {?} */
        var destAncestorIndex = getPath(graph.nodes[baseEdge.w], destPath);
        if (sourceAncestorIndex === -1 || destAncestorIndex === -1) {
            return;
        }
        // Find the lowest shared ancestor between source and dest by looking for
        // the highest nodes that differ between their ancestor paths.
        while (sourcePath[sourceAncestorIndex] === destPath[destAncestorIndex]) {
            sourceAncestorIndex--;
            destAncestorIndex--;
            if (sourceAncestorIndex < 0 || destAncestorIndex < 0) {
                // This would only occur if the two nodes were the same (a cycle in the
                // graph), or if one endpoint was a strict ancestor of the other. The
                // latter shouldn't happen because we rename nodes which are both
                // metanodes and op nodes. E.g. 'A/B' becomes 'A/B/(B)'.
                throw Error('No difference found between ancestor paths.');
            }
        }
        /** @type {?} */
        var sharedAncestorNode = (/** @type {?} */ (nodeIndex[sourcePath[sourceAncestorIndex + 1]]));
        /** @type {?} */
        var sourceAncestorName = sourcePath[sourceAncestorIndex];
        /** @type {?} */
        var destAncestorName = destPath[destAncestorIndex];
        // Find or create the Metaedge which should contain this BaseEdge inside
        // the shared ancestor.
        /** @type {?} */
        var metaedge = sharedAncestorNode.metagraph.edge(sourceAncestorName, destAncestorName);
        if (!metaedge) {
            metaedge = createMetaedge(sourceAncestorName, destAncestorName);
            sharedAncestorNode.metagraph
                .setEdge(sourceAncestorName, destAncestorName, metaedge);
        }
        ((/** @type {?} */ (metaedge))).addBaseEdge(baseEdge, h);
    });
}
/**
 * Internal utility function - given a graph (should be either a metagraph or a
 * bridgegraph) and a node which is known to be in that graph, determine
 * the other ends of edges that involve that node in the direction specified
 * by whether it's inbound.
 *
 * For example if you wanted to find the predecessors of a node, you'd call
 * this method for the parent's metagraph and bridgegraph, specifying inbound
 * as true (look at the source of inbound edges to the specified node).
 *
 * Discovered target names are appended to the targets array.
 * @param {?} graph
 * @param {?} node
 * @param {?} inbound
 * @param {?} targets
 * @return {?}
 */
function findEdgeTargetsInGraph(graph, node, inbound, targets) {
    /** @type {?} */
    var edges = inbound ? graph.inEdges(node.name) : graph.outEdges(node.name);
    edges.forEach(function (e) {
        /** @type {?} */
        var metaedge = graph.edge(e);
        /** @type {?} */
        var targetList = metaedge.numRegularEdges ? targets.regular : targets.control;
        targetList.push(metaedge);
    });
}
