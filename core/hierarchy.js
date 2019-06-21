/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2h5LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXpvcnJvL25nLXBsdXMvZ3JhcGgvIiwic291cmNlcyI6WyJjb3JlL2hpZXJhcmNoeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDdEMsT0FBTyxFQUFZLFdBQVcsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFhLE1BQU0sU0FBUyxDQUFDO0FBQ2hILE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsU0FBUyxFQUtULFNBQVMsRUFDVixNQUFNLGFBQWEsQ0FBQztBQUVyQjtJQWNFLG1CQUFZLFlBQW1DO1FBVC9DLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBU25CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxJQUFJLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV4QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFFLFNBQVMsQ0FBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFFdEIsQ0FBQzs7OztJQUVELDhCQUFVOzs7SUFBVjtRQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDOzs7OztJQUVE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LENBQUMsQ0FBQztJQUVsRCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWNELFNBQVMsc0JBQXNCLENBQzdCLEtBQW1ELEVBQ25ELElBQVUsRUFBRSxPQUFnQixFQUFFLE9BQWM7O1FBQ3RDLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDNUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7O1lBQ1AsUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztZQUN4QixVQUFVLEdBQ1IsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU87UUFDcEUsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogVGhpcyBwcm9kdWN0IGNvbnRhaW5zIGEgbW9kaWZpZWQgdmVyc2lvbiBvZiAnVGVuc29yQm9hcmQgcGx1Z2luIGZvciBncmFwaHMnLFxuICogYSBBbmd1bGFyIGltcGxlbWVudGF0aW9uIG9mIG5lc3QtZ3JhcGggdmlzdWFsaXphdGlvblxuICpcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBuZy16b3Jyby1wbHVzIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgJ0xpY2Vuc2UnKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuICdBUyBJUycgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbi8vIHRzbGludDpkaXNhYmxlXG5cbmltcG9ydCB7IHJ1bkFzeW5jVGFzayB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBCYXNlTm9kZSwgY3JlYXRlR3JhcGgsIGNyZWF0ZU1ldGFlZGdlLCBjcmVhdGVNZXRhbm9kZSwgZ2V0SGllcmFyY2hpY2FsUGF0aCwgU2xpbUdyYXBoIH0gZnJvbSAnLi9ncmFwaCc7XG5pbXBvcnQge1xuICBCUklER0VfR1JBUEhfTkFNRSwgRWRnZXMsXG4gIEdyYXBoVHlwZSxcbiAgR3JvdXBOb2RlLFxuICBIaWVyYXJjaHlQYXJhbXMsIE1ldGFlZGdlLFxuICBNZXRhbm9kZSxcbiAgTm9kZSxcbiAgUk9PVF9OQU1FXG59IGZyb20gJy4vaW50ZXJmYWNlJztcblxuZXhwb3J0IGNsYXNzIEhpZXJhcmNoeSB7XG5cbiAgcHJpdmF0ZSBpbmRleDogeyBbIG5vZGVOYW1lOiBzdHJpbmcgXTogR3JvdXBOb2RlIHwgQmFzZU5vZGUgfTtcblxuICByb290OiBNZXRhbm9kZTtcbiAgbWF4TWV0YUVkZ2VTaXplID0gMTtcbiAgaGFzU2hhcGVJbmZvID0gZmFsc2U7XG5cbiAgZ3JhcGhPcHRpb25zOiBncmFwaGxpYi5HcmFwaE9wdGlvbnM7XG4gIHRlbXBsYXRlczogeyBbIHRlbXBsYXRlSWQ6IHN0cmluZyBdOiBzdHJpbmdbXSB9O1xuICBkZXZpY2VzOiBzdHJpbmdbXTtcbiAgeGxhQ2x1c3RlcnM6IHN0cmluZ1tdO1xuICBvcmRlcmluZ3M6IHsgWyBub2RlTmFtZTogc3RyaW5nIF06IHsgWyBjaGlsZE5hbWU6IHN0cmluZyBdOiBudW1iZXIgfSB9O1xuXG4gIGNvbnN0cnVjdG9yKGdyYXBoT3B0aW9uczogZ3JhcGhsaWIuR3JhcGhPcHRpb25zKSB7XG4gICAgdGhpcy5ncmFwaE9wdGlvbnMgPSBncmFwaE9wdGlvbnMgfHwge307XG4gICAgdGhpcy5ncmFwaE9wdGlvbnMuY29tcG91bmQgPSB0cnVlO1xuICAgIHRoaXMucm9vdCA9IGNyZWF0ZU1ldGFub2RlKFJPT1RfTkFNRSwgdGhpcy5ncmFwaE9wdGlvbnMpO1xuICAgIHRoaXMudGVtcGxhdGVzID0gbnVsbDtcbiAgICB0aGlzLmRldmljZXMgPSBudWxsO1xuICAgIHRoaXMueGxhQ2x1c3RlcnMgPSBudWxsO1xuXG4gICAgdGhpcy5pbmRleCA9IHt9O1xuICAgIHRoaXMuaW5kZXhbIFJPT1RfTkFNRSBdID0gdGhpcy5yb290O1xuICAgIHRoaXMub3JkZXJpbmdzID0ge307XG5cbiAgfVxuXG4gIGdldE5vZGVNYXAoKTogeyBbIG5vZGVOYW1lOiBzdHJpbmcgXTogR3JvdXBOb2RlIHwgQmFzZU5vZGUgfSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXg7XG4gIH1cblxuICBub2RlKG5hbWU6IHN0cmluZyk6IEdyb3VwTm9kZSB8IEJhc2VOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleFsgbmFtZSBdO1xuICB9XG5cbiAgc2V0Tm9kZShuYW1lOiBzdHJpbmcsIG5vZGU6IEdyb3VwTm9kZSB8IEJhc2VOb2RlKTogdm9pZCB7XG4gICAgdGhpcy5pbmRleFsgbmFtZSBdID0gbm9kZTtcbiAgfVxuXG4gIGdldEJyaWRnZWdyYXBoKG5vZGVOYW1lOiBzdHJpbmcpOiBncmFwaGxpYi5HcmFwaDxHcm91cE5vZGUgfCBCYXNlTm9kZSwgTWV0YWVkZ2U+IHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5pbmRleFsgbm9kZU5hbWUgXTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBub2RlIGluIGhpZXJhcmNoeTogJyArIG5vZGVOYW1lKTtcbiAgICB9XG5cbiAgICBpZiAoISgnbWV0YWdyYXBoJyBpbiBub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZ3JvdXBOb2RlID0gbm9kZSBhcyBHcm91cE5vZGU7XG4gICAgaWYgKGdyb3VwTm9kZS5icmlkZ2VncmFwaCkge1xuICAgICAgcmV0dXJuIGdyb3VwTm9kZS5icmlkZ2VncmFwaDtcbiAgICB9XG5cbiAgICBjb25zdCBicmlkZ2VncmFwaCA9IGNyZWF0ZUdyYXBoPEdyb3VwTm9kZSB8IEJhc2VOb2RlLCBNZXRhZWRnZT4oQlJJREdFX0dSQVBIX05BTUUsIEdyYXBoVHlwZS5CUklER0UsIHRoaXMuZ3JhcGhPcHRpb25zKTtcbiAgICBncm91cE5vZGUuYnJpZGdlZ3JhcGggPSBicmlkZ2VncmFwaDtcblxuICAgIGlmICghbm9kZS5wYXJlbnROb2RlIHx8ICEoJ21ldGFncmFwaCcgaW4gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgcmV0dXJuIGJyaWRnZWdyYXBoO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGUgYXMgR3JvdXBOb2RlO1xuICAgIGNvbnN0IHBhcmVudE1ldGFncmFwaCA9IHBhcmVudE5vZGUubWV0YWdyYXBoO1xuICAgIGNvbnN0IHBhcmVudEJyaWRnZWdyYXBoID0gdGhpcy5nZXRCcmlkZ2VncmFwaChwYXJlbnROb2RlLm5hbWUpO1xuXG4gICAgWyBwYXJlbnRNZXRhZ3JhcGgsIHBhcmVudEJyaWRnZWdyYXBoIF0uZm9yRWFjaChwYXJlbnRHcmFwaCA9PiB7XG4gICAgICBwYXJlbnRHcmFwaFxuICAgICAgLmVkZ2VzKClcbiAgICAgIC5maWx0ZXIoZSA9PiBlLnYgPT09IG5vZGVOYW1lIHx8IGUudyA9PT0gbm9kZU5hbWUpXG4gICAgICAuZm9yRWFjaChwYXJlbnRFZGdlT2JqID0+IHtcbiAgICAgICAgY29uc3QgaW5ib3VuZCA9IHBhcmVudEVkZ2VPYmoudyA9PT0gbm9kZU5hbWU7XG4gICAgICAgIGNvbnN0IHBhcmVudE1ldGFlZGdlID0gcGFyZW50R3JhcGguZWRnZShwYXJlbnRFZGdlT2JqKTtcblxuICAgICAgICBwYXJlbnRNZXRhZWRnZS5iYXNlRWRnZUxpc3QuZm9yRWFjaChiYXNlRWRnZSA9PiB7XG4gICAgICAgICAgY29uc3QgWyBkZXNjZW5kYW50TmFtZSwgb3RoZXJOYW1lIF0gPVxuICAgICAgICAgICAgICAgIGluYm91bmQgP1xuICAgICAgICAgICAgICAgICAgWyBiYXNlRWRnZS53LCBwYXJlbnRFZGdlT2JqLnYgXSA6XG4gICAgICAgICAgICAgICAgICBbIGJhc2VFZGdlLnYsIHBhcmVudEVkZ2VPYmoudyBdO1xuICAgICAgICAgIGNvbnN0IGNoaWxkTmFtZSA9IHRoaXMuZ2V0Q2hpbGROYW1lKG5vZGVOYW1lLCBkZXNjZW5kYW50TmFtZSk7XG5cbiAgICAgICAgICBjb25zdCBicmlkZ2VFZGdlT2JqID0gPGdyYXBobGliLkVkZ2VPYmplY3Q+IHtcbiAgICAgICAgICAgIHY6IGluYm91bmQgPyBvdGhlck5hbWUgOiBjaGlsZE5hbWUsXG4gICAgICAgICAgICB3OiBpbmJvdW5kID8gY2hpbGROYW1lIDogb3RoZXJOYW1lLFxuICAgICAgICAgIH07XG4gICAgICAgICAgbGV0IGJyaWRnZU1ldGFlZGdlID0gYnJpZGdlZ3JhcGguZWRnZShicmlkZ2VFZGdlT2JqKTtcblxuICAgICAgICAgIGlmICghYnJpZGdlTWV0YWVkZ2UpIHtcbiAgICAgICAgICAgIGJyaWRnZU1ldGFlZGdlID0gY3JlYXRlTWV0YWVkZ2UoYnJpZGdlRWRnZU9iai52LCBicmlkZ2VFZGdlT2JqLncpO1xuICAgICAgICAgICAgYnJpZGdlTWV0YWVkZ2UuaW5ib3VuZCA9IGluYm91bmQ7XG4gICAgICAgICAgICBicmlkZ2VncmFwaC5zZXRFZGdlKGJyaWRnZUVkZ2VPYmoudiwgYnJpZGdlRWRnZU9iai53LFxuICAgICAgICAgICAgICBicmlkZ2VNZXRhZWRnZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyaWRnZU1ldGFlZGdlLmFkZEJhc2VFZGdlKGJhc2VFZGdlLCB0aGlzKTtcblxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBicmlkZ2VncmFwaDtcbiAgfVxuXG4gIGdldENoaWxkTmFtZShub2RlTmFtZTogc3RyaW5nLCBkZXNjZW5kYW50TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBXYWxrIHVwIHRoZSBoaWVyYXJjaHkgZnJvbSB0aGUgZGVzY2VuZGFudCB0byBmaW5kIHRoZSBjaGlsZC5cbiAgICBsZXQgY3VycmVudE5vZGU6IE5vZGUgPSB0aGlzLmluZGV4W2Rlc2NlbmRhbnROYW1lXTtcbiAgICB3aGlsZSAoY3VycmVudE5vZGUpIHtcbiAgICAgIGlmIChjdXJyZW50Tm9kZS5wYXJlbnROb2RlICYmIGN1cnJlbnROb2RlLnBhcmVudE5vZGUubmFtZSA9PT0gbm9kZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnROb2RlLm5hbWU7XG4gICAgICB9XG4gICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHRocm93IEVycm9yKFxuICAgICAgJ0NvdWxkIG5vdCBmaW5kIGltbWVkaWF0ZSBjaGlsZCBmb3IgZGVzY2VuZGFudDogJyArIGRlc2NlbmRhbnROYW1lKTtcbiAgfVxuXG4gIGdldFByZWRlY2Vzc29ycyhub2RlTmFtZTogc3RyaW5nKTogRWRnZXMge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmluZGV4W25vZGVOYW1lXTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZmluZCBub2RlIHdpdGggbmFtZTogJyArIG5vZGVOYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0T25lV2F5RWRnZXMobm9kZSwgdHJ1ZSk7XG4gIH1cblxuICBnZXRTdWNjZXNzb3JzKG5vZGVOYW1lOiBzdHJpbmcpOiBFZGdlcyB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuaW5kZXhbbm9kZU5hbWVdO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIG5vZGUgd2l0aCBuYW1lOiAnICsgbm9kZU5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRPbmVXYXlFZGdlcyhub2RlLCBmYWxzZSk7XG5cbiAgfVxuXG4gIGdldE9uZVdheUVkZ2VzKG5vZGU6IEdyb3VwTm9kZXxCYXNlTm9kZSwgaW5FZGdlczogYm9vbGVhbikge1xuICAgIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IHtjb250cm9sOiBbXSwgcmVndWxhcjogW119O1xuICAgIC8vIEEgbm9kZSB3aXRoIG5vIHBhcmVudCBjYW5ub3QgaGF2ZSBhbnkgZWRnZXMuXG4gICAgaWYgKCFub2RlLnBhcmVudE5vZGUgfHwgIW5vZGUucGFyZW50Tm9kZS5pc0dyb3VwTm9kZSkge1xuICAgICAgcmV0dXJuIGVkZ2VzO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnROb2RlID0gPEdyb3VwTm9kZT4gbm9kZS5wYXJlbnROb2RlO1xuICAgIGNvbnN0IG1ldGFncmFwaCA9IHBhcmVudE5vZGUubWV0YWdyYXBoO1xuICAgIGNvbnN0IGJyaWRnZWdyYXBoID0gdGhpcy5nZXRCcmlkZ2VncmFwaChwYXJlbnROb2RlLm5hbWUpO1xuICAgIGZpbmRFZGdlVGFyZ2V0c0luR3JhcGgobWV0YWdyYXBoLCBub2RlLCBpbkVkZ2VzLCBlZGdlcyk7XG4gICAgZmluZEVkZ2VUYXJnZXRzSW5HcmFwaChicmlkZ2VncmFwaCwgbm9kZSwgaW5FZGdlcywgZWRnZXMpO1xuICAgIHJldHVybiBlZGdlcztcbiAgfVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEhpZXJhcmNoeShncmFwaDogU2xpbUdyYXBoLCBwYXJhbXM6IEhpZXJhcmNoeVBhcmFtcykge1xuICBjb25zdCBoID0gbmV3IEhpZXJhcmNoeSh7ICdyYW5rZGlyJzogcGFyYW1zLnJhbmtEaXJlY3Rpb24gfSk7XG4gIHJldHVybiBydW5Bc3luY1Rhc2soKCkgPT4gYWRkTm9kZXMoaCwgZ3JhcGgpKVxuICAvLyBncm91cFNlcmllc1xuICAudGhlbigoKSA9PiBhZGRFZGdlcyhoLCBncmFwaCkpXG4gIC50aGVuKCgpID0+IGgpO1xufVxuXG5mdW5jdGlvbiBhZGROb2RlcyhoOiBIaWVyYXJjaHksIGdyYXBoOiBTbGltR3JhcGgpIHtcblxuICBPYmplY3Qua2V5cyhncmFwaC5ub2RlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBncmFwaC5ub2Rlc1sga2V5IF07XG4gICAgY29uc3QgcGF0aCA9IGdldEhpZXJhcmNoaWNhbFBhdGgobm9kZS5uYW1lKTtcbiAgICBsZXQgcGFyZW50OiBNZXRhbm9kZSA9IGgucm9vdDtcbiAgICBwYXJlbnQuZGVwdGggPSBNYXRoLm1heChwYXRoLmxlbmd0aCwgcGFyZW50LmRlcHRoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgcGFyZW50LmRlcHRoID0gTWF0aC5tYXgocGFyZW50LmRlcHRoLCBwYXRoLmxlbmd0aCAtIGkpO1xuICAgICAgcGFyZW50LmNhcmRpbmFsaXR5ICs9IG5vZGUuY2FyZGluYWxpdHk7XG4gICAgICBpZiAoaSA9PT0gcGF0aC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgbmFtZSA9IHBhdGhbIGkgXTtcbiAgICAgIGxldCBjaGlsZCA9IDxNZXRhbm9kZT5oLm5vZGUobmFtZSk7XG4gICAgICBpZiAoIWNoaWxkKSB7XG4gICAgICAgIGNoaWxkID0gY3JlYXRlTWV0YW5vZGUobmFtZSwgaC5ncmFwaE9wdGlvbnMpO1xuICAgICAgICBjaGlsZC5wYXJlbnROb2RlID0gcGFyZW50O1xuICAgICAgICBoLnNldE5vZGUobmFtZSwgY2hpbGQpO1xuICAgICAgICBwYXJlbnQubWV0YWdyYXBoLnNldE5vZGUobmFtZSwgY2hpbGQpO1xuICAgICAgfVxuICAgICAgcGFyZW50ID0gY2hpbGQ7XG4gICAgfVxuXG4gICAgaC5zZXROb2RlKG5vZGUubmFtZSwgbm9kZSk7XG4gICAgbm9kZS5wYXJlbnROb2RlID0gcGFyZW50O1xuICAgIHBhcmVudC5tZXRhZ3JhcGguc2V0Tm9kZShub2RlLm5hbWUsIG5vZGUpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRWRnZXMoaDogSGllcmFyY2h5LCBncmFwaDogU2xpbUdyYXBoKSB7XG4gIGNvbnN0IG5vZGVJbmRleCA9IGguZ2V0Tm9kZU1hcCgpO1xuXG4gIGNvbnN0IHNvdXJjZVBhdGg6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGRlc3RQYXRoOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGNvbnN0IGdldFBhdGggPSAobm9kZTogTm9kZSwgcGF0aDogc3RyaW5nW10pOiBudW1iZXIgPT4ge1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgcGF0aFsgaSsrIF0gPSBub2RlLm5hbWU7XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gaSAtIDE7XG4gIH07XG5cbiAgZ3JhcGguZWRnZXMuZm9yRWFjaChiYXNlRWRnZSA9PiB7XG4gICAgbGV0IHNvdXJjZUFuY2VzdG9ySW5kZXggPSBnZXRQYXRoKGdyYXBoLm5vZGVzWyBiYXNlRWRnZS52IF0sIHNvdXJjZVBhdGgpO1xuICAgIGxldCBkZXN0QW5jZXN0b3JJbmRleCA9IGdldFBhdGgoZ3JhcGgubm9kZXNbIGJhc2VFZGdlLncgXSwgZGVzdFBhdGgpO1xuXG4gICAgaWYgKHNvdXJjZUFuY2VzdG9ySW5kZXggPT09IC0xIHx8IGRlc3RBbmNlc3RvckluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZpbmQgdGhlIGxvd2VzdCBzaGFyZWQgYW5jZXN0b3IgYmV0d2VlbiBzb3VyY2UgYW5kIGRlc3QgYnkgbG9va2luZyBmb3JcbiAgICAvLyB0aGUgaGlnaGVzdCBub2RlcyB0aGF0IGRpZmZlciBiZXR3ZWVuIHRoZWlyIGFuY2VzdG9yIHBhdGhzLlxuICAgIHdoaWxlIChzb3VyY2VQYXRoWyBzb3VyY2VBbmNlc3RvckluZGV4IF0gPT09IGRlc3RQYXRoWyBkZXN0QW5jZXN0b3JJbmRleCBdKSB7XG4gICAgICBzb3VyY2VBbmNlc3RvckluZGV4LS07XG4gICAgICBkZXN0QW5jZXN0b3JJbmRleC0tO1xuICAgICAgaWYgKHNvdXJjZUFuY2VzdG9ySW5kZXggPCAwIHx8IGRlc3RBbmNlc3RvckluZGV4IDwgMCkge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIG9ubHkgb2NjdXIgaWYgdGhlIHR3byBub2RlcyB3ZXJlIHRoZSBzYW1lIChhIGN5Y2xlIGluIHRoZVxuICAgICAgICAvLyBncmFwaCksIG9yIGlmIG9uZSBlbmRwb2ludCB3YXMgYSBzdHJpY3QgYW5jZXN0b3Igb2YgdGhlIG90aGVyLiBUaGVcbiAgICAgICAgLy8gbGF0dGVyIHNob3VsZG4ndCBoYXBwZW4gYmVjYXVzZSB3ZSByZW5hbWUgbm9kZXMgd2hpY2ggYXJlIGJvdGhcbiAgICAgICAgLy8gbWV0YW5vZGVzIGFuZCBvcCBub2Rlcy4gRS5nLiAnQS9CJyBiZWNvbWVzICdBL0IvKEIpJy5cbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vIGRpZmZlcmVuY2UgZm91bmQgYmV0d2VlbiBhbmNlc3RvciBwYXRocy4nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaGFyZWRBbmNlc3Rvck5vZGUgPVxuICAgICAgICAgICAgPEdyb3VwTm9kZT5ub2RlSW5kZXhbIHNvdXJjZVBhdGhbIHNvdXJjZUFuY2VzdG9ySW5kZXggKyAxIF0gXTtcbiAgICBjb25zdCBzb3VyY2VBbmNlc3Rvck5hbWUgPSBzb3VyY2VQYXRoWyBzb3VyY2VBbmNlc3RvckluZGV4IF07XG4gICAgY29uc3QgZGVzdEFuY2VzdG9yTmFtZSA9IGRlc3RQYXRoWyBkZXN0QW5jZXN0b3JJbmRleCBdO1xuXG4gICAgLy8gRmluZCBvciBjcmVhdGUgdGhlIE1ldGFlZGdlIHdoaWNoIHNob3VsZCBjb250YWluIHRoaXMgQmFzZUVkZ2UgaW5zaWRlXG4gICAgLy8gdGhlIHNoYXJlZCBhbmNlc3Rvci5cbiAgICBsZXQgbWV0YWVkZ2UgPVxuICAgICAgICAgIHNoYXJlZEFuY2VzdG9yTm9kZS5tZXRhZ3JhcGguZWRnZShzb3VyY2VBbmNlc3Rvck5hbWUsIGRlc3RBbmNlc3Rvck5hbWUpO1xuICAgIGlmICghbWV0YWVkZ2UpIHtcbiAgICAgIG1ldGFlZGdlID0gY3JlYXRlTWV0YWVkZ2Uoc291cmNlQW5jZXN0b3JOYW1lLCBkZXN0QW5jZXN0b3JOYW1lKTtcbiAgICAgIHNoYXJlZEFuY2VzdG9yTm9kZS5tZXRhZ3JhcGhcbiAgICAgIC5zZXRFZGdlKHNvdXJjZUFuY2VzdG9yTmFtZSwgZGVzdEFuY2VzdG9yTmFtZSwgbWV0YWVkZ2UpO1xuICAgIH1cbiAgICAobWV0YWVkZ2UgYXMgTWV0YWVkZ2UpLmFkZEJhc2VFZGdlKGJhc2VFZGdlLCBoKTtcblxuICB9KTtcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCB1dGlsaXR5IGZ1bmN0aW9uIC0gZ2l2ZW4gYSBncmFwaCAoc2hvdWxkIGJlIGVpdGhlciBhIG1ldGFncmFwaCBvciBhXG4gKiBicmlkZ2VncmFwaCkgYW5kIGEgbm9kZSB3aGljaCBpcyBrbm93biB0byBiZSBpbiB0aGF0IGdyYXBoLCBkZXRlcm1pbmVcbiAqIHRoZSBvdGhlciBlbmRzIG9mIGVkZ2VzIHRoYXQgaW52b2x2ZSB0aGF0IG5vZGUgaW4gdGhlIGRpcmVjdGlvbiBzcGVjaWZpZWRcbiAqIGJ5IHdoZXRoZXIgaXQncyBpbmJvdW5kLlxuICpcbiAqIEZvciBleGFtcGxlIGlmIHlvdSB3YW50ZWQgdG8gZmluZCB0aGUgcHJlZGVjZXNzb3JzIG9mIGEgbm9kZSwgeW91J2QgY2FsbFxuICogdGhpcyBtZXRob2QgZm9yIHRoZSBwYXJlbnQncyBtZXRhZ3JhcGggYW5kIGJyaWRnZWdyYXBoLCBzcGVjaWZ5aW5nIGluYm91bmRcbiAqIGFzIHRydWUgKGxvb2sgYXQgdGhlIHNvdXJjZSBvZiBpbmJvdW5kIGVkZ2VzIHRvIHRoZSBzcGVjaWZpZWQgbm9kZSkuXG4gKlxuICogRGlzY292ZXJlZCB0YXJnZXQgbmFtZXMgYXJlIGFwcGVuZGVkIHRvIHRoZSB0YXJnZXRzIGFycmF5LlxuICovXG5mdW5jdGlvbiBmaW5kRWRnZVRhcmdldHNJbkdyYXBoKFxuICBncmFwaDogZ3JhcGhsaWIuR3JhcGg8R3JvdXBOb2RlfEJhc2VOb2RlLCBNZXRhZWRnZT4sXG4gIG5vZGU6IE5vZGUsIGluYm91bmQ6IGJvb2xlYW4sIHRhcmdldHM6IEVkZ2VzKTogdm9pZCB7XG4gIGNvbnN0IGVkZ2VzID0gaW5ib3VuZCA/IGdyYXBoLmluRWRnZXMobm9kZS5uYW1lKSA6IGdyYXBoLm91dEVkZ2VzKG5vZGUubmFtZSk7XG4gIGVkZ2VzLmZvckVhY2goZSA9PiB7XG4gICAgY29uc3QgbWV0YWVkZ2UgPSBncmFwaC5lZGdlKGUpO1xuICAgIGNvbnN0IHRhcmdldExpc3QgPVxuICAgICAgICAgICAgbWV0YWVkZ2UubnVtUmVndWxhckVkZ2VzID8gdGFyZ2V0cy5yZWd1bGFyIDogdGFyZ2V0cy5jb250cm9sO1xuICAgIHRhcmdldExpc3QucHVzaChtZXRhZWRnZSk7XG4gIH0pO1xufVxuIl19
