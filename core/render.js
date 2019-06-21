/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXpvcnJvL25nLXBsdXMvZ3JhcGgvIiwic291cmNlcyI6WyJjb3JlL3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBLE9BQU8sRUFBRSxXQUFXLEVBQTJCLE1BQU0sVUFBVSxDQUFDO0FBRWhFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDdEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUV0QyxPQUFPLEVBQWMsU0FBUyxFQUFhLGFBQWEsRUFBWSxlQUFlLEVBQVEsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDOztJQUluSCxNQUFNLEdBQUc7SUFDYixtQkFBbUIsRUFBRSxDQUFDO0NBQ3ZCOzs7O0FBRUQsMkJBR0M7OztJQUZDLGtCQUFVOztJQUNWLGtCQUFVOztBQWtCWjtJQXFCRSx5QkFBWSxTQUFvQixFQUFFLGVBQXdCO1FBQ3hELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLEtBQUssQ0FBRSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7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S0FBSyxFQUFFO1FBQzVCLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQzdCLEtBQUksQ0FBQyxTQUFTO1lBQ1osV0FBVyxDQUNULEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMzQyxLQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDNUMsS0FBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzdDLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDNUIsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQzs7SUFFL0IsQ0FBQztJQUVILDBCQUFDO0FBQUQsQ0FBQyxBQXpCRCxDQUF5QyxjQUFjLEdBeUJ0RDs7OztJQXhCQyxtQ0FBZ0I7O0lBQ2hCLHdDQUE4RDs7SUFDOUQsMkNBQWdEOztJQUNoRCw0Q0FBaUQ7Ozs7O0lBRWpELGdEQUFvQzs7Ozs7SUFFcEMsaURBQXFDOzs7Ozs7QUFtQnZDLE1BQU0sVUFBVSxXQUFXLENBQUMsY0FBeUI7SUFDbkQsT0FBTyxZQUFZLENBQUM7UUFDbEIsT0FBTyxJQUFJLGVBQWUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFRoaXMgcHJvZHVjdCBjb250YWlucyBhIG1vZGlmaWVkIHZlcnNpb24gb2YgJ1RlbnNvckJvYXJkIHBsdWdpbiBmb3IgZ3JhcGhzJyxcbiAqIGEgQW5ndWxhciBpbXBsZW1lbnRhdGlvbiBvZiBuZXN0LWdyYXBoIHZpc3VhbGl6YXRpb25cbiAqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgbmctem9ycm8tcGx1cyBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiAnQVMgSVMnIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuXG5pbXBvcnQgeyBzY2FsZUxpbmVhciwgU2NhbGVMaW5lYXIsIFNjYWxlUG93ZXIgfSBmcm9tICdkMy1zY2FsZSc7XG5pbXBvcnQgeyBTZWxlY3Rpb24gfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IHsgcnVuQXN5bmNUYXNrIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IE1BWF9FREdFX1dJRFRILCBNSU5fRURHRV9XSURUSCB9IGZyb20gJy4vZWRnZSc7XG5pbXBvcnQgeyBjcmVhdGVHcmFwaCB9IGZyb20gJy4vZ3JhcGgnO1xuaW1wb3J0IHsgSGllcmFyY2h5IH0gZnJvbSAnLi9oaWVyYXJjaHknO1xuaW1wb3J0IHsgQnJpZGdlTm9kZSwgR3JhcGhUeXBlLCBHcm91cE5vZGUsIEluY2x1c2lvblR5cGUsIE1ldGFlZGdlLCBOQU1FU1BBQ0VfREVMSU0sIE5vZGUsIE5vZGVUeXBlIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IEdyYXBoT3B0aW9ucyA9IGdyYXBobGliLkdyYXBoT3B0aW9ucztcblxuXG5jb25zdCBQQVJBTVMgPSB7XG4gIG1heEJyaWRnZVBhdGhEZWdyZWU6IDRcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0aGF0IGNvbXB1dGVzIGVkZ2UgdGhpY2tuZXNzIGluIHBpeGVscy5cbiAqL1xuZXhwb3J0IHR5cGUgRWRnZVRoaWNrbmVzc0Z1bmN0aW9uID0gKGVkZ2VEYXRhOiBhbnksIGVkZ2VDbGFzczogc3RyaW5nKSA9PiBudW1iZXI7XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBjb21wdXRlcyBlZGdlIGxhYmVsIHN0cmluZ3MuIFRoaXMgZnVuY3Rpb24gYWNjZXB0cyBhIE1ldGFlZGdlLFxuICogd2hpY2ggY291bGQgYWN0dWFsbHkgZW5jYXBzdWxhdGUgc2V2ZXJhbCBiYXNlIGVkZ2VzLiBGb3IgaW5zdGFuY2UsIHNldmVyYWxcbiAqIGJhc2UgZWRnZXMgbWF5IG1lcmdlIGludG8gYSBzaW5nbGUgbWV0YWVkZ2UuXG4gKlxuICogVG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBtZXRhZWRnZSByZXByZXNlbnRzIHNldmVyYWwgZWRnZXMsIGNoZWNrIHRoZSBsZW5ndGggb2ZcbiAqIGl0cyBiYXNlRWRnZUxpc3QgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VMYWJlbEZ1bmN0aW9uID0gKG1ldGFlZGdlOiBNZXRhZWRnZSwgcmVuZGVySW5mbzogUmVuZGVyR3JhcGhJbmZvKSA9PiBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJHcmFwaEluZm8ge1xuICBoaWVyYXJjaHk6IEhpZXJhcmNoeTtcbiAgcHJpdmF0ZSBkaXNwbGF5aW5nU3RhdHM6IGJvb2xlYW47XG4gIHByaXZhdGUgaW5kZXg6IHsgWyBub2RlTmFtZTogc3RyaW5nIF06IFJlbmRlck5vZGVJbmZvIH07XG4gIHByaXZhdGUgcmVuZGVyZWRPcE5hbWVzOiBzdHJpbmdbXTtcblxuICAvKiogU2NhbGUgZm9yIHRoZSB0aGlja25lc3Mgb2YgZWRnZXMgd2hlbiB0aGVyZSBpcyBubyBzaGFwZSBpbmZvcm1hdGlvbi4gKi9cbiAgZWRnZVdpZHRoU2l6ZWRCYXNlZFNjYWxlOlxuICAgIFNjYWxlTGluZWFyPG51bWJlciwgbnVtYmVyPiB8IFNjYWxlUG93ZXI8bnVtYmVyLCBudW1iZXI+O1xuICAvLyBTaW5jZSB0aGUgcmVuZGVyaW5nIGluZm9ybWF0aW9uIGZvciBlYWNoIG5vZGUgaXMgY29uc3RydWN0ZWQgbGF6aWx5LFxuICAvLyB1cG9uIG5vZGUncyBleHBhbnNpb24gYnkgdGhlIHVzZXIsIHdlIGtlZXAgYSBtYXAgYmV0d2VlbiB0aGUgbm9kZSdzIG5hbWVcbiAgLy8gYW5kIHdoZXRoZXIgdGhlIHJlbmRlcmluZyBpbmZvcm1hdGlvbiB3YXMgYWxyZWFkeSBjb25zdHJ1Y3RlZCBmb3IgdGhhdFxuICAvLyBub2RlLlxuICBwcml2YXRlIGhhc1N1YmhpZXJhcmNoeTogeyBbIG5vZGVOYW1lOiBzdHJpbmcgXTogYm9vbGVhbiB9O1xuICByb290OiBSZW5kZXJHcm91cE5vZGVJbmZvO1xuICB0cmFjZUlucHV0czogQm9vbGVhbjtcbiAgZWRnZUxhYmVsRnVuY3Rpb246IEVkZ2VMYWJlbEZ1bmN0aW9uO1xuICAvLyBBbiBvcHRpb25hbCBmdW5jdGlvbiB0aGF0IGNvbXB1dGVzIHRoZSB0aGlja25lc3Mgb2YgYW4gZWRnZSBnaXZlbiBlZGdlXG4gIC8vIGRhdGEuIElmIG5vdCBwcm92aWRlZCwgZGVmYXVsdHMgdG8gZW5jb2RpbmcgdGVuc29yIHNpemUgaW4gdGhpY2tuZXNzLlxuICBlZGdlV2lkdGhGdW5jdGlvbjogRWRnZVRoaWNrbmVzc0Z1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKGhpZXJhcmNoeTogSGllcmFyY2h5LCBkaXNwbGF5aW5nU3RhdHM6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmhpZXJhcmNoeSA9IGhpZXJhcmNoeTtcbiAgICB0aGlzLmRpc3BsYXlpbmdTdGF0cyA9IGRpc3BsYXlpbmdTdGF0cztcbiAgICB0aGlzLmluZGV4ID0ge307XG4gICAgdGhpcy5yZW5kZXJlZE9wTmFtZXMgPSBbXTtcblxuICAgIHRoaXMuY29tcHV0ZVNjYWxlcygpO1xuXG4gICAgdGhpcy5oYXNTdWJoaWVyYXJjaHkgPSB7fTtcbiAgICB0aGlzLnJvb3QgPSBuZXcgUmVuZGVyR3JvdXBOb2RlSW5mbyhoaWVyYXJjaHkucm9vdCwgaGllcmFyY2h5LmdyYXBoT3B0aW9ucyk7XG4gICAgdGhpcy5pbmRleFsgaGllcmFyY2h5LnJvb3QubmFtZSBdID0gdGhpcy5yb290O1xuICAgIHRoaXMucmVuZGVyZWRPcE5hbWVzLnB1c2goaGllcmFyY2h5LnJvb3QubmFtZSk7XG4gICAgdGhpcy5idWlsZFN1YmhpZXJhcmNoeShoaWVyYXJjaHkucm9vdC5uYW1lKTtcbiAgICB0aGlzLnJvb3QuZXhwYW5kZWQgPSB0cnVlO1xuICAgIHRoaXMudHJhY2VJbnB1dHMgPSB0cnVlO1xuICB9XG5cbiAgY29tcHV0ZVNjYWxlcygpOiB2b2lkIHtcblxuICAgIHRoaXMuZWRnZVdpZHRoU2l6ZWRCYXNlZFNjYWxlID0gc2NhbGVMaW5lYXIoKVxuICAgIC5kb21haW4oWyAxLCB0aGlzLmhpZXJhcmNoeS5tYXhNZXRhRWRnZVNpemUgXSlcbiAgICAucmFuZ2UoWyBNSU5fRURHRV9XSURUSCwgTUFYX0VER0VfV0lEVEggXSBhcyBSZWFkb25seUFycmF5PG51bWJlcj4pO1xuICB9XG5cbiAgZ2V0U3ViaGllcmFyY2h5KCkge1xuICAgIHJldHVybiB0aGlzLmhhc1N1YmhpZXJhcmNoeTtcbiAgfVxuXG4gIGJ1aWxkU3ViaGllcmFyY2h5KG5vZGVOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAobm9kZU5hbWUgaW4gdGhpcy5oYXNTdWJoaWVyYXJjaHkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYXNTdWJoaWVyYXJjaHlbIG5vZGVOYW1lIF0gPSB0cnVlO1xuXG4gICAgY29uc3QgcmVuZGVyTm9kZUluZm8gPSB0aGlzLmluZGV4WyBub2RlTmFtZSBdO1xuXG4gICAgaWYgKHJlbmRlck5vZGVJbmZvLm5vZGUudHlwZSAhPT0gTm9kZVR5cGUuTUVUQSAmJlxuICAgICAgcmVuZGVyTm9kZUluZm8ubm9kZS50eXBlICE9PSBOb2RlVHlwZS5TRVJJRVMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJHcm91cE5vZGVJbmZvID0gPFJlbmRlckdyb3VwTm9kZUluZm8+IHJlbmRlck5vZGVJbmZvO1xuXG4gICAgY29uc3QgbWV0YWdyYXBoID0gcmVuZGVyR3JvdXBOb2RlSW5mby5ub2RlLm1ldGFncmFwaDtcbiAgICBjb25zdCBjb3JlR3JhcGggPSByZW5kZXJHcm91cE5vZGVJbmZvLmNvcmVHcmFwaDtcblxuICAgIG1ldGFncmFwaC5ub2RlcygpLmZvckVhY2goY2hpbGROYW1lID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkUmVuZGVySW5mbyA9IHRoaXMuZ2V0T3JDcmVhdGVSZW5kZXJOb2RlQnlOYW1lKGNoaWxkTmFtZSk7XG4gICAgICBjb3JlR3JhcGguc2V0Tm9kZShjaGlsZE5hbWUsIGNoaWxkUmVuZGVySW5mbyk7XG4gICAgfSk7XG5cbiAgICBtZXRhZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGVkZ2VPYmogPT4ge1xuICAgICAgY29uc3QgbWV0YWVkZ2UgPSBtZXRhZ3JhcGguZWRnZShlZGdlT2JqKTtcbiAgICAgIGNvbnN0IHJlbmRlck1ldGFlZGdlSW5mbyA9IG5ldyBSZW5kZXJNZXRhZWRnZUluZm8obWV0YWVkZ2UpO1xuICAgICAgY29yZUdyYXBoLnNldEVkZ2UoZWRnZU9iai52LCBlZGdlT2JqLncsIHJlbmRlck1ldGFlZGdlSW5mbyk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwYXJlbnROb2RlID0gcmVuZGVyR3JvdXBOb2RlSW5mby5ub2RlLnBhcmVudE5vZGU7XG4gICAgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudE5vZGVJbmZvID0gPFJlbmRlckdyb3VwTm9kZUluZm8+IHRoaXMuaW5kZXhbIHBhcmVudE5vZGUubmFtZSBdO1xuXG4gICAgY29uc3QgZ2V0QnJpZGdlTm9kZU5hbWUgPSAoaW5ib3VuZCwgLi4ucmVzdCkgPT5cbiAgICAgIHJlc3QuY29uY2F0KFsgaW5ib3VuZCA/ICdJTicgOiAnT1VUJyBdKS5qb2luKCd+ficpO1xuXG4gICAgY29uc3QgYnJpZGdlZ3JhcGggPSB0aGlzLmhpZXJhcmNoeS5nZXRCcmlkZ2VncmFwaChub2RlTmFtZSk7XG4gICAgLy8gTG9vayBmb3IgcG9wdWxhciBub2RlcyBzbyB3ZSBjYW4gbWFrZSBhbm5vdGF0aW9ucyBpbnN0ZWFkIG9mIHBhdGhzLlxuICAgIGNvbnN0IG90aGVyQ291bnRzID0ge1xuICAgICAgLy8gQ291bnRzIG9mIGVkZ2VzIGNvbWluZyBJTlRPIG90aGVyIG5vZGVzIGJ5IG5hbWUgKG91dGdvaW5nIGZyb20gc2VsZikuXG4gICAgICBpbiAgICAgOiA8eyBbIG5vZGVOYW1lOiBzdHJpbmcgXTogbnVtYmVyIH0+IHt9LFxuICAgICAgLy8gQ291bnRzIG9mIGVkZ2VzIGdvaW5nIE9VVCBmcm9tIG90aGVyIG5vZGVzIGJ5IG5hbWUgKGNvbWluZyBpbnRvIHNlbGYpLlxuICAgICAgb3V0ICAgIDogPHsgWyBub2RlTmFtZTogc3RyaW5nIF06IG51bWJlciB9PiB7fSxcbiAgICAgIC8vIENvdW50cyBvZiBhbGwgY29udHJvbCBlZGdlcyBpbnZvbHZpbmcgb3RoZXIgbm9kZXMgYnkgbmFtZS5cbiAgICAgIGNvbnRyb2w6IDx7IFsgbm9kZU5hbWU6IHN0cmluZyBdOiBudW1iZXIgfT4ge31cbiAgICB9O1xuXG4gICAgYnJpZGdlZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGUgPT4ge1xuICAgICAgLy8gQW4gZWRnZSBpcyBpbmJvdW5kIGlmIGl0cyBkZXN0aW5hdGlvbiBub2RlIGlzIGluIHRoZSBtZXRhZ3JhcGguXG4gICAgICBjb25zdCBpbmJvdW5kID0gISFtZXRhZ3JhcGgubm9kZShlLncpO1xuICAgICAgY29uc3Qgb3RoZXJOYW1lID0gaW5ib3VuZCA/IGUudiA6IGUudztcbiAgICAgIGNvbnN0IG1ldGFlZGdlID0gYnJpZGdlZ3JhcGguZWRnZShlKTtcbiAgICAgIGlmICghbWV0YWVkZ2UubnVtUmVndWxhckVkZ2VzKSB7XG4gICAgICAgIG90aGVyQ291bnRzLmNvbnRyb2xbIG90aGVyTmFtZSBdID1cbiAgICAgICAgICAob3RoZXJDb3VudHMuY29udHJvbFsgb3RoZXJOYW1lIF0gfHwgMCkgKyAxO1xuICAgICAgfSBlbHNlIGlmIChpbmJvdW5kKSB7XG4gICAgICAgIG90aGVyQ291bnRzLm91dFsgb3RoZXJOYW1lIF0gPSAob3RoZXJDb3VudHMub3V0WyBvdGhlck5hbWUgXSB8fCAwKSArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdGhlckNvdW50cy5pblsgb3RoZXJOYW1lIF0gPSAob3RoZXJDb3VudHMuaW5bIG90aGVyTmFtZSBdIHx8IDApICsgMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGhpZXJhcmNoeU5vZGVNYXAgPSB0aGlzLmhpZXJhcmNoeS5nZXROb2RlTWFwKCk7XG4gICAgYnJpZGdlZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGJyaWRnZUVkZ2VPYmogPT4ge1xuICAgICAgY29uc3QgYnJpZGdlTWV0YWVkZ2UgPSBicmlkZ2VncmFwaC5lZGdlKGJyaWRnZUVkZ2VPYmopO1xuICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBicmlkZ2UgZWRnZSBpcyBpbmNvbWluZyBieSBjaGVja2luZyB0aGVcbiAgICAgIC8vIG1ldGFncmFwaCBmb3IgYSBub2RlIHRoYXQgbWF0Y2hlcyB0aGUgZGVzdGluYXRpb24gZW5kLlxuICAgICAgY29uc3QgaW5ib3VuZCA9ICEhbWV0YWdyYXBoLm5vZGUoYnJpZGdlRWRnZU9iai53KTtcblxuICAgICAgLy8gQmFzZWQgb24gdGhlIGRpcmVjdGlvbiBvZiB0aGUgZWRnZSwgb25lIGVuZHBvaW50IHdpbGwgYmUgYW4gaW1tZWRpYXRlXG4gICAgICAvLyBjaGlsZCBvZiB0aGlzIHJlbmRlck5vZGVJbmZvLCBhbmQgdGhlIG90aGVyIGVuZHBvaW50IHdpbGwgYmUgYSBzaWJsaW5nXG4gICAgICAvLyBvZiB0aGUgcGFyZW50IChvciBhbiBhbmNlc3RvciBmdXJ0aGVyIHVwKS5cbiAgICAgIGNvbnN0IFsgY2hpbGROYW1lLCBvdGhlck5hbWUgXSA9XG4gICAgICAgICAgICAgIGluYm91bmQgP1xuICAgICAgICAgICAgICAgIFsgYnJpZGdlRWRnZU9iai53LCBicmlkZ2VFZGdlT2JqLnYgXSA6XG4gICAgICAgICAgICAgICAgWyBicmlkZ2VFZGdlT2JqLnYsIGJyaWRnZUVkZ2VPYmoudyBdO1xuXG4gICAgICBjb25zdCBjaGlsZFJlbmRlckluZm8gPSB0aGlzLmluZGV4WyBjaGlsZE5hbWUgXTtcbiAgICAgIGNvbnN0IG90aGVyUmVuZGVySW5mbyA9IHRoaXMuaW5kZXhbIG90aGVyTmFtZSBdO1xuXG4gICAgICAvLyBEb24ndCByZW5kZXIgYSBicmlkZ2UgcGF0aCBpZiB0aGUgb3RoZXIgbm9kZSBoYXMgaW4gb3Igb3V0IGRlZ3JlZSBhYm92ZVxuICAgICAgLy8gYSB0aHJlc2hvbGQsIGxlc3QgYnJpZGdlIHBhdGhzIGVtYW5hdGluZyBvdXQgb2YgYSBtZXRhZ3JhcGggY3Jvd2QgdXAsXG4gICAgICAvLyBhcyB3YXMgdGhlIGNhc2UgZm9yIHRoZSBGYXRjYXQgTFNUTSBsc3RtXzEgPiBsc3RtXzEgbWV0YWdyYXBoLlxuICAgICAgY29uc3Qgb3RoZXJEZWdyZWVDb3VudCA9XG4gICAgICAgICAgICAgIChpbmJvdW5kID8gb3RoZXJDb3VudHMub3V0IDogb3RoZXJDb3VudHMuaW4pWyBvdGhlck5hbWUgXTtcbiAgICAgIGNvbnN0IGlzT3RoZXJIaWdoRGVncmVlID0gb3RoZXJEZWdyZWVDb3VudCA+IFBBUkFNUy5tYXhCcmlkZ2VQYXRoRGVncmVlO1xuXG4gICAgICAvLyBUaGUgYWRqb2luaW5nIHJlbmRlciBtZXRhZWRnZSBpbmZvIGZyb20gdGhlIHBhcmVudCdzIGNvcmVHcmFwaCwgaWYgYW55LlxuICAgICAgLy8gSXQgd2lsbCBlaXRoZXIgYmUgYSBNZXRhZWRnZSBpbnZvbHZpbmcgdGhpcyBub2RlIGRpcmVjdGx5LCBpZiBpdFxuICAgICAgLy8gcHJldmlvdXNseSBjYW1lIGZyb20gYSBtZXRhZ3JhcGgsIG9yIGl0J2xsIGJlIGEgTWV0YWVkZ2UgaW52b2x2aW5nXG4gICAgICAvLyBhIHByZXZpb3VzbHkgY3JlYXRlZCBicmlkZ2Ugbm9kZSBzdGFuZGluZyBpbiBmb3IgdGhlIG90aGVyIG5vZGUuXG4gICAgICBsZXQgYWRqb2luaW5nTWV0YWVkZ2UgPSBudWxsO1xuXG4gICAgICAvLyBXZSBjYW4gb25seSBob3BlIHRvIHJlbmRlciBhIGJyaWRnZSBwYXRoIGlmOlxuICAgICAgLy8gIC0gYnJpZGdlZ3JhcGggcGF0aHMgYXJlIGVuYWJsZWQsXG4gICAgICAvLyAgLSB0aGUgb3RoZXIgbm9kZSBpcyBub3QgdG9vIGhpZ2gtZGVncmVlLFxuICAgICAgLy8gIC0gdGhlIGNoaWxkIGlzIGluIHRoZSBjb3JlIChub3QgZXh0cmFjdGVkIGZvciBiZWluZyBoaWdoLWRlZ3JlZSksIGFuZFxuICAgICAgLy8gIC0gdGhlcmUncyBhIHBhdGggKGluIHRoZSB0cmF2ZXJzYWwgc2Vuc2UpIGJldHdlZW4gY2hpbGQgYW5kIG90aGVyLlxuICAgICAgbGV0IGNhbkRyYXdCcmlkZ2VQYXRoID0gZmFsc2U7XG4gICAgICBpZiAoIWlzT3RoZXJIaWdoRGVncmVlICYmXG4gICAgICAgIGNoaWxkUmVuZGVySW5mby5pc0luQ29yZSgpKSB7XG5cbiAgICAgICAgLy8gVXRpbGl0eSBmdW5jdGlvbiBmb3IgZmluZGluZyBhbiBhZGpvaW5pbmcgbWV0YWVkZ2UuXG4gICAgICAgIGNvbnN0IGZpbmRBZGpvaW5pbmdNZXRhZWRnZSA9IHRhcmdldE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IGFkam9pbmluZ0VkZ2VPYmo6IGdyYXBobGliLkVkZ2VPYmplY3QgPVxuICAgICAgICAgICAgICAgICAgaW5ib3VuZCA/XG4gICAgICAgICAgICAgICAgICAgIHsgdjogdGFyZ2V0TmFtZSwgdzogbm9kZU5hbWUgfSA6XG4gICAgICAgICAgICAgICAgICAgIHsgdjogbm9kZU5hbWUsIHc6IHRhcmdldE5hbWUgfTtcbiAgICAgICAgICByZXR1cm4gPFJlbmRlck1ldGFlZGdlSW5mbz5cbiAgICAgICAgICAgIHBhcmVudE5vZGVJbmZvLmNvcmVHcmFwaC5lZGdlKGFkam9pbmluZ0VkZ2VPYmopO1xuICAgICAgICB9O1xuXG4gICAgICAgIGFkam9pbmluZ01ldGFlZGdlID0gZmluZEFkam9pbmluZ01ldGFlZGdlKG90aGVyTmFtZSk7XG4gICAgICAgIGlmICghYWRqb2luaW5nTWV0YWVkZ2UpIHtcbiAgICAgICAgICBhZGpvaW5pbmdNZXRhZWRnZSA9IGZpbmRBZGpvaW5pbmdNZXRhZWRnZShcbiAgICAgICAgICAgIGdldEJyaWRnZU5vZGVOYW1lKGluYm91bmQsIG90aGVyTmFtZSwgcGFyZW50Tm9kZS5uYW1lKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjYW5EcmF3QnJpZGdlUGF0aCA9ICEhYWRqb2luaW5nTWV0YWVkZ2U7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJhY2t3YXJkcyA9IGZhbHNlO1xuICAgICAgaWYgKGFkam9pbmluZ01ldGFlZGdlICYmICFicmlkZ2VNZXRhZWRnZS5udW1SZWd1bGFyRWRnZXMpIHtcbiAgICAgICAgLy8gRmluZCB0aGUgdG9wLW1vc3QgYWRqb2luaW5nIHJlbmRlciBtZXRhZWRnZSBpbmZvcm1hdGlvbiwgYW5kIHRoZVxuICAgICAgICAvLyBHcm91cE5vZGUgd2hvc2UgbWV0YWdyYXBoIG11c3QgY29udGFpbiB0aGUgYXNzb2NpYXRlZCBtZXRhZWRnZS5cbiAgICAgICAgbGV0IHRvcEFkam9pbmluZ01ldGFlZGdlID0gYWRqb2luaW5nTWV0YWVkZ2U7XG4gICAgICAgIGxldCB0b3BHcm91cE5vZGUgPSBwYXJlbnROb2RlSW5mby5ub2RlO1xuICAgICAgICB3aGlsZSAodG9wQWRqb2luaW5nTWV0YWVkZ2UuYWRqb2luaW5nTWV0YWVkZ2UpIHtcbiAgICAgICAgICB0b3BBZGpvaW5pbmdNZXRhZWRnZSA9IHRvcEFkam9pbmluZ01ldGFlZGdlLmFkam9pbmluZ01ldGFlZGdlO1xuICAgICAgICAgIHRvcEdyb3VwTm9kZSA9IDxHcm91cE5vZGU+dG9wR3JvdXBOb2RlLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyBpcyBiYWNrd2FyZHNcbiAgICAgIH1cblxuICAgICAgY29uc3QgYnJpZGdlQ29udGFpbmVyTmFtZSA9IGdldEJyaWRnZU5vZGVOYW1lKGluYm91bmQsIG5vZGVOYW1lKTtcbiAgICAgIGNvbnN0IGJyaWRnZU5vZGVOYW1lID0gZ2V0QnJpZGdlTm9kZU5hbWUoaW5ib3VuZCwgb3RoZXJOYW1lLCBub2RlTmFtZSk7XG4gICAgICBsZXQgYnJpZGdlTm9kZVJlbmRlckluZm8gPSBjb3JlR3JhcGgubm9kZShicmlkZ2VOb2RlTmFtZSk7XG5cbiAgICAgIGlmICghYnJpZGdlTm9kZVJlbmRlckluZm8pIHtcbiAgICAgICAgbGV0IGJyaWRnZUNvbnRhaW5lckluZm8gPSBjb3JlR3JhcGgubm9kZShicmlkZ2VDb250YWluZXJOYW1lKTtcblxuICAgICAgICBpZiAoIWJyaWRnZUNvbnRhaW5lckluZm8pIHtcbiAgICAgICAgICBjb25zdCBicmlkZ2VDb250YWluZXJOb2RlOiBCcmlkZ2VOb2RlID0ge1xuICAgICAgICAgICAgLy8gSW1wb3J0YW50IG5vZGUgcHJvcGVydGllcy5cbiAgICAgICAgICAgIG5hbWUgICAgICAgOiBicmlkZ2VDb250YWluZXJOYW1lLFxuICAgICAgICAgICAgdHlwZSAgICAgICA6IE5vZGVUeXBlLkJSSURHRSxcbiAgICAgICAgICAgIC8vIFVudXNlZCBub2RlIHByb3BlcnRpZXMuXG4gICAgICAgICAgICBpc0dyb3VwTm9kZTogZmFsc2UsXG4gICAgICAgICAgICBjYXJkaW5hbGl0eTogMCxcbiAgICAgICAgICAgIHBhcmVudE5vZGUgOiBudWxsLFxuICAgICAgICAgICAgaW5jbHVkZSAgICA6IEluY2x1c2lvblR5cGUuVU5TUEVDSUZJRUQsXG4gICAgICAgICAgICAvLyBCcmlkZ2VOb2RlIHByb3BlcnRpZXMuXG4gICAgICAgICAgICBpbmJvdW5kICAgIDogaW5ib3VuZCxcbiAgICAgICAgICAgIGF0dHIgICAgICAgOiB7fVxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJpZGdlQ29udGFpbmVySW5mbyA9XG4gICAgICAgICAgICBuZXcgUmVuZGVyTm9kZUluZm8oYnJpZGdlQ29udGFpbmVyTm9kZSk7XG4gICAgICAgICAgdGhpcy5pbmRleFsgYnJpZGdlQ29udGFpbmVyTmFtZSBdID0gYnJpZGdlQ29udGFpbmVySW5mbztcbiAgICAgICAgICBjb3JlR3JhcGguc2V0Tm9kZShicmlkZ2VDb250YWluZXJOYW1lLCBicmlkZ2VDb250YWluZXJJbmZvKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgY29uc3QgYnJpZGdlTm9kZTogQnJpZGdlTm9kZSA9IHtcbiAgICAgICAgICAvLyBJbXBvcnRhbnQgbm9kZSBwcm9wZXJ0aWVzLlxuICAgICAgICAgIG5hbWUgICAgICAgOiBicmlkZ2VOb2RlTmFtZSxcbiAgICAgICAgICB0eXBlICAgICAgIDogTm9kZVR5cGUuQlJJREdFLFxuICAgICAgICAgIC8vIFVuaW1wb3J0YW50IG5vZGUgcHJvcGVydGllcy5cbiAgICAgICAgICBpc0dyb3VwTm9kZTogZmFsc2UsXG4gICAgICAgICAgY2FyZGluYWxpdHk6IDEsXG4gICAgICAgICAgcGFyZW50Tm9kZSA6IG51bGwsXG4gICAgICAgICAgaW5jbHVkZSAgICA6IEluY2x1c2lvblR5cGUuVU5TUEVDSUZJRUQsXG4gICAgICAgICAgLy8gQnJpZGdlTm9kZSBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGluYm91bmQgICAgOiBpbmJvdW5kLFxuICAgICAgICAgIGF0dHIgICAgICAgOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIGJyaWRnZU5vZGVSZW5kZXJJbmZvID0gbmV3IFJlbmRlck5vZGVJbmZvKGJyaWRnZU5vZGUpO1xuICAgICAgICB0aGlzLmluZGV4WyBicmlkZ2VOb2RlTmFtZSBdID0gYnJpZGdlTm9kZVJlbmRlckluZm87XG4gICAgICAgIGNvcmVHcmFwaC5zZXROb2RlKGJyaWRnZU5vZGVOYW1lLCBicmlkZ2VOb2RlUmVuZGVySW5mbyk7XG5cbiAgICAgICAgLy8gU2V0IGJyaWRnZU5vZGUgdG8gYmUgYSBncmFwaGxpYiBjaGlsZCBvZiB0aGUgY29udGFpbmVyIG5vZGUuXG4gICAgICAgIGNvcmVHcmFwaC5zZXRQYXJlbnQoYnJpZGdlTm9kZU5hbWUsIGJyaWRnZUNvbnRhaW5lck5hbWUpO1xuICAgICAgICBicmlkZ2VDb250YWluZXJJbmZvLm5vZGUuY2FyZGluYWxpdHkrKztcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgYSBicmlkZ2UgcmVuZGVyIG1ldGFlZGdlLlxuICAgICAgY29uc3QgYnJpZGdlUmVuZGVyTWV0YWVkZ2UgPVxuICAgICAgICAgICAgICBuZXcgUmVuZGVyTWV0YWVkZ2VJbmZvKGJyaWRnZU1ldGFlZGdlKTtcbiAgICAgIGJyaWRnZVJlbmRlck1ldGFlZGdlLmFkam9pbmluZ01ldGFlZGdlID0gYWRqb2luaW5nTWV0YWVkZ2U7XG4gICAgICBpbmJvdW5kID9cbiAgICAgICAgY29yZUdyYXBoLnNldEVkZ2UoYnJpZGdlTm9kZU5hbWUsIGNoaWxkTmFtZSwgYnJpZGdlUmVuZGVyTWV0YWVkZ2UpIDpcbiAgICAgICAgY29yZUdyYXBoLnNldEVkZ2UoY2hpbGROYW1lLCBicmlkZ2VOb2RlTmFtZSwgYnJpZGdlUmVuZGVyTWV0YWVkZ2UpO1xuICAgIH0pO1xuXG4gICAgWyB0cnVlLCBmYWxzZSBdLmZvckVhY2goaW5ib3VuZCA9PiB7XG4gICAgICBjb25zdCBicmlkZ2VDb250YWluZXJOYW1lID0gZ2V0QnJpZGdlTm9kZU5hbWUoaW5ib3VuZCwgbm9kZU5hbWUpO1xuICAgICAgY29uc3QgYnJpZGdlQ29udGFpbmVySW5mbyA9IGNvcmVHcmFwaC5ub2RlKGJyaWRnZUNvbnRhaW5lck5hbWUpO1xuICAgICAgaWYgKCFicmlkZ2VDb250YWluZXJJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvcmVHcmFwaC5ub2RlcygpLmZvckVhY2goY2hpbGROYW1lID0+IHtcbiAgICAgICAgLy8gU2hvcnQtY2lyY3VpdCBpZiB0aGlzIGNoaWxkIGlzIGEgYnJpZGdlIG5vZGUgb3IgaXQncyBub3QgYSB0ZXJtaW5hbFxuICAgICAgICAvLyBub2RlIGluIHRoZSBkaXJlY3Rpb24gd2UncmUgaW50ZXJlc3RlZCBpbi5cbiAgICAgICAgY29uc3QgY2hpbGROb2RlSW5mbyA9IGNvcmVHcmFwaC5ub2RlKGNoaWxkTmFtZSk7XG4gICAgICAgIGlmIChjaGlsZE5vZGVJbmZvLm5vZGUudHlwZSA9PT0gTm9kZVR5cGUuQlJJREdFKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzVGVybWluYWwgPSBpbmJvdW5kID9cbiAgICAgICAgICAhY29yZUdyYXBoLnByZWRlY2Vzc29ycyhjaGlsZE5hbWUpLmxlbmd0aCA6XG4gICAgICAgICAgIWNvcmVHcmFwaC5zdWNjZXNzb3JzKGNoaWxkTmFtZSkubGVuZ3RoO1xuICAgICAgICBpZiAoIWlzVGVybWluYWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIG9yIGNyZWF0ZSBhIGJyaWRnZSBub2RlIGluIHRoZSBjb250YWluZXIgZm9yIGFsbCBzdHJ1Y3R1cmFsXG4gICAgICAgIC8vIG1ldGFlZGdlcy4gSXQgd291bGQgaGF2ZSBiZWVuIG5pY2UgdG8gc2tpcCB0aGlzIHN0ZXAgYW5kIHNpbXBseVxuICAgICAgICAvLyBzZXQgYSBtZXRhZWRnZSBiZXR3ZWVuIHRoZSB0ZXJtaW5hbCBub2RlIGFuZCB0aGUgY29udGFpbmVyIG5vZGUsIGJ1dFxuICAgICAgICAvLyBpbiB0aGF0IGNhc2UsIHNvbWV0aGluZyBhYm91dCB0aGUgZ3JhcGggdXBzZXRzIGRhZ3JlLmxheW91dCgpJ3NcbiAgICAgICAgLy8gbG9uZ2VzdFBhdGggYWxnb3JpdGhtICh3YXMgZ2V0dGluZyBlcnJvcnMgZHVlIHRvIGFuIHVuZGVmaW5lZCkuXG4gICAgICAgIGNvbnN0IHN0cnVjdHVyYWxOb2RlTmFtZSA9XG4gICAgICAgICAgICAgICAgZ2V0QnJpZGdlTm9kZU5hbWUoaW5ib3VuZCwgbm9kZU5hbWUsICdTVFJVQ1RVUkFMX1RBUkdFVCcpO1xuICAgICAgICBsZXQgc3RydWN0dXJhbFJlbmRlckluZm8gPSBjb3JlR3JhcGgubm9kZShzdHJ1Y3R1cmFsTm9kZU5hbWUpO1xuICAgICAgICBpZiAoIXN0cnVjdHVyYWxSZW5kZXJJbmZvKSB7XG4gICAgICAgICAgY29uc3QgYnJpZGdlTm9kZTogQnJpZGdlTm9kZSA9IHtcbiAgICAgICAgICAgIC8vIEltcG9ydGFudCBOb2RlIHByb3BlcnRpZXMuXG4gICAgICAgICAgICBuYW1lICAgICAgIDogc3RydWN0dXJhbE5vZGVOYW1lLFxuICAgICAgICAgICAgdHlwZSAgICAgICA6IE5vZGVUeXBlLkJSSURHRSxcbiAgICAgICAgICAgIC8vIFVuaW1wb3J0YW50IE5vZGUgcHJvcGVydGllcy5cbiAgICAgICAgICAgIGlzR3JvdXBOb2RlOiBmYWxzZSxcbiAgICAgICAgICAgIGNhcmRpbmFsaXR5OiAxLFxuICAgICAgICAgICAgcGFyZW50Tm9kZSA6IG51bGwsXG4gICAgICAgICAgICBpbmNsdWRlICAgIDogSW5jbHVzaW9uVHlwZS5VTlNQRUNJRklFRCxcbiAgICAgICAgICAgIC8vIEJyaWRnZU5vZGUgcHJvcGVydGllcy5cbiAgICAgICAgICAgIGluYm91bmQgICAgOiBpbmJvdW5kLFxuICAgICAgICAgICAgYXR0ciAgICAgICA6IHt9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBzdHJ1Y3R1cmFsUmVuZGVySW5mbyA9IG5ldyBSZW5kZXJOb2RlSW5mbyhicmlkZ2VOb2RlKTtcbiAgICAgICAgICBzdHJ1Y3R1cmFsUmVuZGVySW5mby5zdHJ1Y3R1cmFsID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmluZGV4WyBzdHJ1Y3R1cmFsTm9kZU5hbWUgXSA9IHN0cnVjdHVyYWxSZW5kZXJJbmZvO1xuICAgICAgICAgIGNvcmVHcmFwaC5zZXROb2RlKHN0cnVjdHVyYWxOb2RlTmFtZSwgc3RydWN0dXJhbFJlbmRlckluZm8pO1xuICAgICAgICAgIGJyaWRnZUNvbnRhaW5lckluZm8ubm9kZS5jYXJkaW5hbGl0eSsrO1xuICAgICAgICAgIGNvcmVHcmFwaC5zZXRQYXJlbnQoc3RydWN0dXJhbE5vZGVOYW1lLCBicmlkZ2VDb250YWluZXJOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgc3RydWN0dXJhbCBNZXRhZWRnZSBhbmQgaW5zZXJ0IGl0LlxuICAgICAgICBjb25zdCBzdHJ1Y3R1cmFsTWV0YWVkZ2VJbmZvID0gbmV3IFJlbmRlck1ldGFlZGdlSW5mbyhudWxsKTtcbiAgICAgICAgc3RydWN0dXJhbE1ldGFlZGdlSW5mby5zdHJ1Y3R1cmFsID0gdHJ1ZTtcbiAgICAgICAgc3RydWN0dXJhbE1ldGFlZGdlSW5mby53ZWlnaHQtLTsgLy8gUmVkdWNlIHdlaWdodCBmb3IgZGFncmUgbGF5b3V0LlxuICAgICAgICBpbmJvdW5kID9cbiAgICAgICAgICBjb3JlR3JhcGguc2V0RWRnZShcbiAgICAgICAgICAgIHN0cnVjdHVyYWxOb2RlTmFtZSwgY2hpbGROYW1lLCBzdHJ1Y3R1cmFsTWV0YWVkZ2VJbmZvKSA6XG4gICAgICAgICAgY29yZUdyYXBoLnNldEVkZ2UoXG4gICAgICAgICAgICBjaGlsZE5hbWUsIHN0cnVjdHVyYWxOb2RlTmFtZSwgc3RydWN0dXJhbE1ldGFlZGdlSW5mbyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE9yQ3JlYXRlUmVuZGVyTm9kZUJ5TmFtZShub2RlTmFtZTogc3RyaW5nKTogUmVuZGVyTm9kZUluZm8ge1xuICAgIGlmICghbm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChub2RlTmFtZSBpbiB0aGlzLmluZGV4KSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmRleFsgbm9kZU5hbWUgXTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gdGhpcy5oaWVyYXJjaHkubm9kZShub2RlTmFtZSk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4WyBub2RlTmFtZSBdID0gbm9kZS5pc0dyb3VwTm9kZSA/XG4gICAgICBuZXcgUmVuZGVyR3JvdXBOb2RlSW5mbyg8R3JvdXBOb2RlPm5vZGUsIHRoaXMuaGllcmFyY2h5LmdyYXBoT3B0aW9ucykgOlxuICAgICAgbmV3IFJlbmRlck5vZGVJbmZvKG5vZGUpO1xuICAgIHRoaXMucmVuZGVyZWRPcE5hbWVzLnB1c2gobm9kZU5hbWUpO1xuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbIG5vZGVOYW1lIF07XG5cbiAgfVxuXG4gIGdldFJlbmRlck5vZGVCeU5hbWUobm9kZU5hbWU6IHN0cmluZyk6IFJlbmRlck5vZGVJbmZvIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleFsgbm9kZU5hbWUgXTtcbiAgfVxuXG4gIGdldE5vZGVCeU5hbWUobm9kZU5hbWU6IHN0cmluZyk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLmhpZXJhcmNoeS5ub2RlKG5vZGVOYW1lKTtcbiAgfVxuXG59XG5cblxuZXhwb3J0IGNsYXNzIFJlbmRlck5vZGVJbmZvIHtcbiAgbm9kZTogTm9kZTtcbiAgZXhwYW5kZWQ6IGJvb2xlYW47XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgY29yZUJveDoge1xuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gIH07XG4gIGluYm94V2lkdGg6IG51bWJlcjtcbiAgb3V0Ym94V2lkdGg6IG51bWJlcjtcbiAgZXhjbHVkZWQ6IGJvb2xlYW47XG4gIHN0cnVjdHVyYWw6IGJvb2xlYW47XG4gIGxhYmVsT2Zmc2V0OiBudW1iZXI7XG4gIHJhZGl1czogbnVtYmVyO1xuICBsYWJlbEhlaWdodDogbnVtYmVyO1xuICBwYWRkaW5nVG9wOiBudW1iZXI7XG4gIHBhZGRpbmdMZWZ0OiBudW1iZXI7XG4gIHBhZGRpbmdSaWdodDogbnVtYmVyO1xuICBwYWRkaW5nQm90dG9tOiBudW1iZXI7XG4gIGlzSW5FeHRyYWN0OiBib29sZWFuO1xuICBpc091dEV4dHJhY3Q6IGJvb2xlYW47XG4gIGlzRmFkZWRPdXQ6IGJvb2xlYW47XG4gIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iobm9kZTogTm9kZSkge1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLndpZHRoID0gMDtcbiAgICB0aGlzLmhlaWdodCA9IDA7XG4gICAgdGhpcy5pbmJveFdpZHRoID0gMDtcbiAgICB0aGlzLm91dGJveFdpZHRoID0gMDtcblxuICAgIHRoaXMuZXhjbHVkZWQgPSBmYWxzZTtcblxuICAgIC8vIFBhcmFtcyBmb3IgYnJpZGdlIHBhdGhzLlxuICAgIHRoaXMuc3RydWN0dXJhbCA9IGZhbHNlO1xuXG4gICAgLy8gUGFyYW1zIGZvciBub2RlIGJveC5cbiAgICB0aGlzLmxhYmVsT2Zmc2V0ID0gMDtcbiAgICB0aGlzLnJhZGl1cyA9IDA7XG5cbiAgICAvLyBQYXJhbXMgZm9yIGV4cGFuZGVkIG5vZGVcbiAgICB0aGlzLmxhYmVsSGVpZ2h0ID0gMDtcbiAgICB0aGlzLnBhZGRpbmdUb3AgPSAwO1xuICAgIHRoaXMucGFkZGluZ0xlZnQgPSAwO1xuICAgIHRoaXMucGFkZGluZ1JpZ2h0ID0gMDtcbiAgICB0aGlzLnBhZGRpbmdCb3R0b20gPSAwO1xuICAgIHRoaXMuaXNJbkV4dHJhY3QgPSBmYWxzZTtcbiAgICB0aGlzLmlzT3V0RXh0cmFjdCA9IGZhbHNlO1xuICAgIHRoaXMuY29yZUJveCA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG4gICAgLy8gQnkgZGVmYXVsdCwgd2UgZG9uJ3QgZmFkZSBub2RlcyBvdXQuIERlZmF1bHQgdG8gZmFsc2UgZm9yIHNhZmV0eS5cbiAgICB0aGlzLmlzRmFkZWRPdXQgPSBmYWxzZTtcblxuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBub2RlLm5hbWUuc3Vic3RyaW5nKFxuICAgICAgbm9kZS5uYW1lLmxhc3RJbmRleE9mKE5BTUVTUEFDRV9ERUxJTSkgKyAxKTtcbiAgfVxuXG4gIGlzSW5Db3JlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5pc0luRXh0cmFjdCAmJiAhdGhpcy5pc091dEV4dHJhY3Q7XG4gIH1cblxufVxuXG5leHBvcnQgY2xhc3MgUmVuZGVyTWV0YWVkZ2VJbmZvIHtcbiAgbWV0YWVkZ2U6IE1ldGFlZGdlO1xuICBhZGpvaW5pbmdNZXRhZWRnZTogUmVuZGVyTWV0YWVkZ2VJbmZvO1xuICBzdHJ1Y3R1cmFsOiBib29sZWFuO1xuICB3ZWlnaHQ6IG51bWJlcjtcbiAgcG9pbnRzOiBQb2ludFtdO1xuICBlZGdlR3JvdXA6IFNlbGVjdGlvbjxSZW5kZXJNZXRhZWRnZUluZm8gJiBhbnksIGFueSwgYW55LCBhbnk+O1xuICBzdGFydE1hcmtlcklkOiBzdHJpbmc7XG4gIGVuZE1hcmtlcklkOiBzdHJpbmc7XG4gIGlzRmFkZWRPdXQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IobWV0YWVkZ2U6IE1ldGFlZGdlKSB7XG4gICAgdGhpcy5tZXRhZWRnZSA9IG1ldGFlZGdlO1xuICAgIHRoaXMuYWRqb2luaW5nTWV0YWVkZ2UgPSBudWxsO1xuICAgIHRoaXMuc3RydWN0dXJhbCA9IGZhbHNlO1xuICAgIHRoaXMud2VpZ2h0ID0gMTtcbiAgICB0aGlzLmlzRmFkZWRPdXQgPSBmYWxzZTtcbiAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJHcm91cE5vZGVJbmZvIGV4dGVuZHMgUmVuZGVyTm9kZUluZm8ge1xuICBub2RlOiBHcm91cE5vZGU7XG4gIGNvcmVHcmFwaDogZ3JhcGhsaWIuR3JhcGg8UmVuZGVyTm9kZUluZm8sIFJlbmRlck1ldGFlZGdlSW5mbz47XG4gIGluRXh0cmFjdEJveDogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9O1xuICBvdXRFeHRyYWN0Qm94OiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH07XG4gIC8qKiBBcnJheSBvZiBpc29sYXRlZCBpbi1leHRyYWN0IG5vZGVzLiAqL1xuICBpc29sYXRlZEluRXh0cmFjdDogUmVuZGVyTm9kZUluZm9bXTtcbiAgLyoqIEFycmF5IG9mIGlzb2xhdGVkIG91dC1leHRyYWN0IG5vZGVzLiAqL1xuICBpc29sYXRlZE91dEV4dHJhY3Q6IFJlbmRlck5vZGVJbmZvW107XG5cbiAgY29uc3RydWN0b3IoZ3JvdXBOb2RlOiBHcm91cE5vZGUsIGdyYXBoT3B0aW9uczogR3JhcGhPcHRpb25zKSB7XG4gICAgc3VwZXIoZ3JvdXBOb2RlKTtcbiAgICBjb25zdCBtZXRhZ3JhcGggPSBncm91cE5vZGUubWV0YWdyYXBoO1xuICAgIGNvbnN0IGdsID0gbWV0YWdyYXBoLmdyYXBoKCk7XG4gICAgZ3JhcGhPcHRpb25zLmNvbXBvdW5kID0gdHJ1ZTtcbiAgICB0aGlzLmNvcmVHcmFwaCA9XG4gICAgICBjcmVhdGVHcmFwaDxSZW5kZXJOb2RlSW5mbywgUmVuZGVyTWV0YWVkZ2VJbmZvPihcbiAgICAgICAgZ2wubmFtZSwgR3JhcGhUeXBlLkNPUkUsIGdyYXBoT3B0aW9ucyk7XG4gICAgdGhpcy5pbkV4dHJhY3RCb3ggPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB0aGlzLm91dEV4dHJhY3RCb3ggPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcbiAgICB0aGlzLmlzb2xhdGVkSW5FeHRyYWN0ID0gW107XG4gICAgdGhpcy5pc29sYXRlZE91dEV4dHJhY3QgPSBbXTtcblxuICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVuZGVyKGdyYXBoSGllcmFyY2h5OiBIaWVyYXJjaHkpOiBQcm9taXNlPFJlbmRlckdyYXBoSW5mbz4ge1xuICByZXR1cm4gcnVuQXN5bmNUYXNrKCgpID0+IHtcbiAgICByZXR1cm4gbmV3IFJlbmRlckdyYXBoSW5mbyhncmFwaEhpZXJhcmNoeSwgZmFsc2UpO1xuICB9KTtcbn1cbiJdfQ==
