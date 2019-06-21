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
import { scaleLinear } from 'd3-scale';
import { runAsyncTask } from './util';
import { MAX_EDGE_WIDTH, MIN_EDGE_WIDTH } from './edge';
import { createGraph } from './graph';
import { GraphType, InclusionType, NAMESPACE_DELIM, NodeType } from './interface';
/** @type {?} */
var PARAMS = {
    maxBridgePathDegree: 4
};
/**
 * @record
 */
export function Point() { }
if (false) {
    /** @type {?} */
    Point.prototype.x;
    /** @type {?} */
    Point.prototype.y;
}
class RenderGraphInfo {
  constructor(hierarchy, displayingStats) {
        this.hierarchy = hierarchy;
        this.displayingStats = displayingStats;
        this.index = {};
        this.renderedOpNames = [];
        this.computeScales();
        this.hasSubhierarchy = {};
        this.root = new RenderGroupNodeInfo(hierarchy.root, hierarchy.graphOptions);
        this.index[hierarchy.root.name] = this.root;
        this.renderedOpNames.push(hierarchy.root.name);
        this.buildSubhierarchy(hierarchy.root.name);
        this.root.expanded = true;
        this.traceInputs = true;
    }
    /**
     * @return {?}
     */
    computeScales = () => {
        this.edgeWidthSizedBasedScale = scaleLinear()
            .domain([1, this.hierarchy.maxMetaEdgeSize])
            .range((/** @type {?} */ ([MIN_EDGE_WIDTH, MAX_EDGE_WIDTH])));
    };
    /**
     * @return {?}
     */
    getSubhierarchy = () => {
        return this.hasSubhierarchy;
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    buildSubhierarchy = (nodeName) => {
        var _this = this;
        if (nodeName in this.hasSubhierarchy) {
            return;
        }
        this.hasSubhierarchy[nodeName] = true;
        /** @type {?} */
        var renderNodeInfo = this.index[nodeName];
        if (renderNodeInfo.node.type !== NodeType.META &&
            renderNodeInfo.node.type !== NodeType.SERIES) {
            return;
        }
        /** @type {?} */
        var renderGroupNodeInfo = (/** @type {?} */ (renderNodeInfo));
        /** @type {?} */
        var metagraph = renderGroupNodeInfo.node.metagraph;
        /** @type {?} */
        var coreGraph = renderGroupNodeInfo.coreGraph;
        metagraph.nodes().forEach(function (childName) {
            /** @type {?} */
            var childRenderInfo = _this.getOrCreateRenderNodeByName(childName);
            coreGraph.setNode(childName, childRenderInfo);
        });
        metagraph.edges().forEach(function (edgeObj) {
            /** @type {?} */
            var metaedge = metagraph.edge(edgeObj);
            /** @type {?} */
            var renderMetaedgeInfo = new RenderMetaedgeInfo(metaedge);
            coreGraph.setEdge(edgeObj.v, edgeObj.w, renderMetaedgeInfo);
        });
        /** @type {?} */
        var parentNode = renderGroupNodeInfo.node.parentNode;
        if (!parentNode) {
            return;
        }
        /** @type {?} */
        var parentNodeInfo = (/** @type {?} */ (this.index[parentNode.name]));
        /** @type {?} */
        var getBridgeNodeName = function (inbound) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            return rest.concat([inbound ? 'IN' : 'OUT']).join('~~');
        };
        /** @type {?} */
        var bridgegraph = this.hierarchy.getBridgegraph(nodeName);
        // Look for popular nodes so we can make annotations instead of paths.
        /** @type {?} */
        var otherCounts = {
            // Counts of edges coming INTO other nodes by name (outgoing from self).
            in: (/** @type {?} */ ({})),
            // Counts of edges going OUT from other nodes by name (coming into self).
            out: (/** @type {?} */ ({})),
            // Counts of all control edges involving other nodes by name.
            control: (/** @type {?} */ ({}))
        };
        bridgegraph.edges().forEach(function (e) {
            // An edge is inbound if its destination node is in the metagraph.
            /** @type {?} */
            var inbound = !!metagraph.node(e.w);
            /** @type {?} */
            var otherName = inbound ? e.v : e.w;
            /** @type {?} */
            var metaedge = bridgegraph.edge(e);
            if (!metaedge.numRegularEdges) {
                otherCounts.control[otherName] =
                    (otherCounts.control[otherName] || 0) + 1;
            }
            else if (inbound) {
                otherCounts.out[otherName] = (otherCounts.out[otherName] || 0) + 1;
            }
            else {
                otherCounts.in[otherName] = (otherCounts.in[otherName] || 0) + 1;
            }
        });
        /** @type {?} */
        var hierarchyNodeMap = this.hierarchy.getNodeMap();
        bridgegraph.edges().forEach(function (bridgeEdgeObj) {
            /** @type {?} */
            var bridgeMetaedge = bridgegraph.edge(bridgeEdgeObj);
            // Determine whether this bridge edge is incoming by checking the
            // metagraph for a node that matches the destination end.
            /** @type {?} */
            var inbound = !!metagraph.node(bridgeEdgeObj.w);
            // Based on the direction of the edge, one endpoint will be an immediate
            // child of this renderNodeInfo, and the other endpoint will be a sibling
            // of the parent (or an ancestor further up).
            var _a = inbound ?
                [bridgeEdgeObj.w, bridgeEdgeObj.v] :
                [bridgeEdgeObj.v, bridgeEdgeObj.w], childName = _a[0], otherName = _a[1];
            /** @type {?} */
            var childRenderInfo = _this.index[childName];
            /** @type {?} */
            var otherRenderInfo = _this.index[otherName];
            // Don't render a bridge path if the other node has in or out degree above
            // a threshold, lest bridge paths emanating out of a metagraph crowd up,
            // as was the case for the Fatcat LSTM lstm_1 > lstm_1 metagraph.
            /** @type {?} */
            var otherDegreeCount = (inbound ? otherCounts.out : otherCounts.in)[otherName];
            /** @type {?} */
            var isOtherHighDegree = otherDegreeCount > PARAMS.maxBridgePathDegree;
            // The adjoining render metaedge info from the parent's coreGraph, if any.
            // It will either be a Metaedge involving this node directly, if it
            // previously came from a metagraph, or it'll be a Metaedge involving
            // a previously created bridge node standing in for the other node.
            /** @type {?} */
            var adjoiningMetaedge = null;
            // We can only hope to render a bridge path if:
            //  - bridgegraph paths are enabled,
            //  - the other node is not too high-degree,
            //  - the child is in the core (not extracted for being high-degree), and
            //  - there's a path (in the traversal sense) between child and other.
            /** @type {?} */
            var canDrawBridgePath = false;
            if (!isOtherHighDegree &&
                childRenderInfo.isInCore()) {
                // Utility function for finding an adjoining metaedge.
                /** @type {?} */
                var findAdjoiningMetaedge = function (targetName) {
                    /** @type {?} */
                    var adjoiningEdgeObj = inbound ?
                        { v: targetName, w: nodeName } :
                        { v: nodeName, w: targetName };
                    return (/** @type {?} */ (parentNodeInfo.coreGraph.edge(adjoiningEdgeObj)));
                };
                adjoiningMetaedge = findAdjoiningMetaedge(otherName);
                if (!adjoiningMetaedge) {
                    adjoiningMetaedge = findAdjoiningMetaedge(getBridgeNodeName(inbound, otherName, parentNode.name));
                }
                canDrawBridgePath = !!adjoiningMetaedge;
            }
            /** @type {?} */
            var backwards = false;
            if (adjoiningMetaedge && !bridgeMetaedge.numRegularEdges) {
                // Find the top-most adjoining render metaedge information, and the
                // GroupNode whose metagraph must contain the associated metaedge.
                /** @type {?} */
                var topAdjoiningMetaedge = adjoiningMetaedge;
                /** @type {?} */
                var topGroupNode = parentNodeInfo.node;
                while (topAdjoiningMetaedge.adjoiningMetaedge) {
                    topAdjoiningMetaedge = topAdjoiningMetaedge.adjoiningMetaedge;
                    topGroupNode = (/** @type {?} */ (topGroupNode.parentNode));
                }
                // TODO is backwards
            }
            /** @type {?} */
            var bridgeContainerName = getBridgeNodeName(inbound, nodeName);
            /** @type {?} */
            var bridgeNodeName = getBridgeNodeName(inbound, otherName, nodeName);
            /** @type {?} */
            var bridgeNodeRenderInfo = coreGraph.node(bridgeNodeName);
            if (!bridgeNodeRenderInfo) {
                /** @type {?} */
                var bridgeContainerInfo = coreGraph.node(bridgeContainerName);
                if (!bridgeContainerInfo) {
                    /** @type {?} */
                    var bridgeContainerNode = {
                        // Important node properties.
                        name: bridgeContainerName,
                        type: NodeType.BRIDGE,
                        // Unused node properties.
                        isGroupNode: false,
                        cardinality: 0,
                        parentNode: null,
                        include: InclusionType.UNSPECIFIED,
                        // BridgeNode properties.
                        inbound: inbound,
                        attr: {}
                    };
                    bridgeContainerInfo =
                        new RenderNodeInfo(bridgeContainerNode);
                    _this.index[bridgeContainerName] = bridgeContainerInfo;
                    coreGraph.setNode(bridgeContainerName, bridgeContainerInfo);
                }
                /** @type {?} */
                var bridgeNode = {
                    // Important node properties.
                    name: bridgeNodeName,
                    type: NodeType.BRIDGE,
                    // Unimportant node properties.
                    isGroupNode: false,
                    cardinality: 1,
                    parentNode: null,
                    include: InclusionType.UNSPECIFIED,
                    // BridgeNode properties.
                    inbound: inbound,
                    attr: {}
                };
                bridgeNodeRenderInfo = new RenderNodeInfo(bridgeNode);
                _this.index[bridgeNodeName] = bridgeNodeRenderInfo;
                coreGraph.setNode(bridgeNodeName, bridgeNodeRenderInfo);
                // Set bridgeNode to be a graphlib child of the container node.
                coreGraph.setParent(bridgeNodeName, bridgeContainerName);
                bridgeContainerInfo.node.cardinality++;
            }
            // Create and add a bridge render metaedge.
            /** @type {?} */
            var bridgeRenderMetaedge = new RenderMetaedgeInfo(bridgeMetaedge);
            bridgeRenderMetaedge.adjoiningMetaedge = adjoiningMetaedge;
            inbound ?
                coreGraph.setEdge(bridgeNodeName, childName, bridgeRenderMetaedge) :
                coreGraph.setEdge(childName, bridgeNodeName, bridgeRenderMetaedge);
        });
        [true, false].forEach(function (inbound) {
            /** @type {?} */
            var bridgeContainerName = getBridgeNodeName(inbound, nodeName);
            /** @type {?} */
            var bridgeContainerInfo = coreGraph.node(bridgeContainerName);
            if (!bridgeContainerInfo) {
                return;
            }
            coreGraph.nodes().forEach(function (childName) {
                // Short-circuit if this child is a bridge node or it's not a terminal
                // node in the direction we're interested in.
                /** @type {?} */
                var childNodeInfo = coreGraph.node(childName);
                if (childNodeInfo.node.type === NodeType.BRIDGE) {
                    return;
                }
                /** @type {?} */
                var isTerminal = inbound ?
                    !coreGraph.predecessors(childName).length :
                    !coreGraph.successors(childName).length;
                if (!isTerminal) {
                    return;
                }
                // Find or create a bridge node in the container for all structural
                // metaedges. It would have been nice to skip this step and simply
                // set a metaedge between the terminal node and the container node, but
                // in that case, something about the graph upsets dagre.layout()'s
                // longestPath algorithm (was getting errors due to an undefined).
                /** @type {?} */
                var structuralNodeName = getBridgeNodeName(inbound, nodeName, 'STRUCTURAL_TARGET');
                /** @type {?} */
                var structuralRenderInfo = coreGraph.node(structuralNodeName);
                if (!structuralRenderInfo) {
                    /** @type {?} */
                    var bridgeNode = {
                        // Important Node properties.
                        name: structuralNodeName,
                        type: NodeType.BRIDGE,
                        // Unimportant Node properties.
                        isGroupNode: false,
                        cardinality: 1,
                        parentNode: null,
                        include: InclusionType.UNSPECIFIED,
                        // BridgeNode properties.
                        inbound: inbound,
                        attr: {}
                    };
                    structuralRenderInfo = new RenderNodeInfo(bridgeNode);
                    structuralRenderInfo.structural = true;
                    _this.index[structuralNodeName] = structuralRenderInfo;
                    coreGraph.setNode(structuralNodeName, structuralRenderInfo);
                    bridgeContainerInfo.node.cardinality++;
                    coreGraph.setParent(structuralNodeName, bridgeContainerName);
                }
                // Create the structural Metaedge and insert it.
                /** @type {?} */
                var structuralMetaedgeInfo = new RenderMetaedgeInfo(null);
                structuralMetaedgeInfo.structural = true;
                structuralMetaedgeInfo.weight--; // Reduce weight for dagre layout.
                inbound ?
                    coreGraph.setEdge(structuralNodeName, childName, structuralMetaedgeInfo) :
                    coreGraph.setEdge(childName, structuralNodeName, structuralMetaedgeInfo);
            });
        });
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getOrCreateRenderNodeByName = (nodeName) => {
        if (!nodeName) {
            return null;
        }
        if (nodeName in this.index) {
            return this.index[nodeName];
        }
        /** @type {?} */
        var node = this.hierarchy.node(nodeName);
        if (!node) {
            return null;
        }
        this.index[nodeName] = node.isGroupNode ?
            new RenderGroupNodeInfo((/** @type {?} */ (node)), this.hierarchy.graphOptions) :
            new RenderNodeInfo(node);
        this.renderedOpNames.push(nodeName);
        return this.index[nodeName];
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getRenderNodeByName = (nodeName) => {
        return this.index[nodeName];
    };
    /**
     * @param {?} nodeName
     * @return {?}
     */
    getNodeByName = (nodeName) => {
        return this.hierarchy.node(nodeName);
    };
}
export { RenderGraphInfo };

class RenderNodeInfo {
  constructor(node) {
        this.node = node;
        this.expanded = false;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.inboxWidth = 0;
        this.outboxWidth = 0;
        this.excluded = false;
        // Params for bridge paths.
        this.structural = false;
        // Params for node box.
        this.labelOffset = 0;
        this.radius = 0;
        // Params for expanded node
        this.labelHeight = 0;
        this.paddingTop = 0;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.paddingBottom = 0;
        this.isInExtract = false;
        this.isOutExtract = false;
        this.coreBox = { width: 0, height: 0 };
        // By default, we don't fade nodes out. Default to false for safety.
        this.isFadedOut = false;
        this.displayName = node.name.substring(node.name.lastIndexOf(NAMESPACE_DELIM) + 1);
    }
    /**
     * @return {?}
     */
    isInCore = () => {
        return !this.isInExtract && !this.isOutExtract;
    };
}
export { RenderNodeInfo };

class RenderMetaedgeInfo {
  constructor(metaedge) {
        this.metaedge = metaedge;
        this.adjoiningMetaedge = null;
        this.structural = false;
        this.weight = 1;
        this.isFadedOut = false;
    }
}
export { RenderMetaedgeInfo };

class RenderGroupNodeInfo extends RenderNodeInfo{
  constructor(groupNode, graphOptions) {
        super(groupNode)
        /** @type {?} */
        var metagraph = groupNode.metagraph;
        /** @type {?} */
        var gl = metagraph.graph();
        graphOptions.compound = true;
        this.coreGraph =
            createGraph(gl.name, GraphType.CORE, graphOptions);
        this.inExtractBox = { width: 0, height: 0 };
        this.outExtractBox = { width: 0, height: 0 };
        this.isolatedInExtract = [];
        this.isolatedOutExtract = [];
    }
}
export { RenderGroupNodeInfo };

/**
 * @param {?} graphHierarchy
 * @return {?}
 */
export function buildRender(graphHierarchy) {
    return runAsyncTask(function () {
        return new RenderGraphInfo(graphHierarchy, false);
    });
}
