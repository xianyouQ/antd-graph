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
/** @type {?} */
export var ROOT_NAME = '__root__';
/** @type {?} */
export var BRIDGE_GRAPH_NAME = '__bridgegraph__';
/** @type {?} */
export var NAMESPACE_DELIM = '/';
/** @enum {number} */
var NodeType = {
    META: 0, OP: 1, SERIES: 2, BRIDGE: 3, ELLIPSIS: 4,
};
export { NodeType };
NodeType[NodeType.META] = 'META';
NodeType[NodeType.OP] = 'OP';
NodeType[NodeType.SERIES] = 'SERIES';
NodeType[NodeType.BRIDGE] = 'BRIDGE';
NodeType[NodeType.ELLIPSIS] = 'ELLIPSIS';
/** @enum {number} */
var InclusionType = {
    INCLUDE: 0, EXCLUDE: 1, UNSPECIFIED: 2,
};
export { InclusionType };
InclusionType[InclusionType.INCLUDE] = 'INCLUDE';
InclusionType[InclusionType.EXCLUDE] = 'EXCLUDE';
InclusionType[InclusionType.UNSPECIFIED] = 'UNSPECIFIED';
/** @enum {number} */
var GraphType = {
    FULL: 0, EMBEDDED: 1, META: 2, SERIES: 3, CORE: 4, SHADOW: 5, BRIDGE: 6, EDGE: 7,
};
export { GraphType };
GraphType[GraphType.FULL] = 'FULL';
GraphType[GraphType.EMBEDDED] = 'EMBEDDED';
GraphType[GraphType.META] = 'META';
GraphType[GraphType.SERIES] = 'SERIES';
GraphType[GraphType.CORE] = 'CORE';
GraphType[GraphType.SHADOW] = 'SHADOW';
GraphType[GraphType.BRIDGE] = 'BRIDGE';
GraphType[GraphType.EDGE] = 'EDGE';
/**
 * @record
 */
export function GraphDef() { }
if (false) {
    /** @type {?} */
    GraphDef.prototype.nodes;
}
/**
 * @record
 */
export function NodeDef() { }
if (false) {
    /** @type {?} */
    NodeDef.prototype.name;
    /** @type {?} */
    NodeDef.prototype.inputs;
    /** @type {?} */
    NodeDef.prototype.attr;
}
/**
 * @record
 */
export function NodeInputDef() { }
if (false) {
    /** @type {?} */
    NodeInputDef.prototype.name;
    /** @type {?} */
    NodeInputDef.prototype.attr;
}
/**
 * @record
 */
export function AttrDef() { }
/**
 * @record
 */
export function BaseEdge() { }
if (false) {
    /** @type {?} */
    BaseEdge.prototype.w;
    /** @type {?} */
    BaseEdge.prototype.v;
    /** @type {?|undefined} */
    BaseEdge.prototype.name;
}
/**
 * @record
 */
export function HierarchyParams() { }
if (false) {
    /** @type {?} */
    HierarchyParams.prototype.rankDirection;
}
/**
 * @record
 */
export function BridgeNode() { }
if (false) {
    /**
     * Whether this bridge node represents edges coming into its parent node.
     * @type {?}
     */
    BridgeNode.prototype.inbound;
}
/**
 * @record
 */
export function Node() { }
if (false) {
    /** @type {?} */
    Node.prototype.name;
    /** @type {?} */
    Node.prototype.type;
    /** @type {?} */
    Node.prototype.isGroupNode;
    /** @type {?} */
    Node.prototype.cardinality;
    /** @type {?} */
    Node.prototype.parentNode;
    /** @type {?} */
    Node.prototype.include;
    /** @type {?} */
    Node.prototype.attr;
}
/**
 * @record
 */
export function Edges() { }
if (false) {
    /** @type {?} */
    Edges.prototype.control;
    /** @type {?} */
    Edges.prototype.regular;
}
/**
 * @record
 */
export function Metanode() { }
if (false) {
    /** @type {?} */
    Metanode.prototype.depth;
    /** @type {?} */
    Metanode.prototype.templateId;
    /** @type {?} */
    Metanode.prototype.opHistogram;
    /** @type {?} */
    Metanode.prototype.associatedFunction;
    /**
     * @return {?}
     */
    Metanode.prototype.getFirstChild = function () { };
    /**
     * @return {?}
     */
    Metanode.prototype.getChildren = function () { };
    /**
     * @return {?}
     */
    Metanode.prototype.getRootOp = function () { };
    /**
     * @return {?}
     */
    Metanode.prototype.leaves = function () { };
}
/**
 * @record
 */
export function Metaedge() { }
if (false) {
    /**
     * Stores the original BaseEdges represented by this Metaedge.
     * @type {?}
     */
    Metaedge.prototype.baseEdgeList;
    /**
     * Whether this edge represents a relationship that is inbound (or outbound)
     * to the object which contains this information. For example, in a Metanode's
     * bridgegraph, each edge connects an immediate child to something outside
     * the Metanode. If the destination of the edge is inside the Metanode, then
     * its inbound property should be true. If the destination is outside the
     * Metanode, then its inbound property should be false.
     *
     * The property is optional because not all edges can be described as
     * inbound/outbound. For example, in a Metanode's metagraph, all of the edges
     * connect immediate children of the Metanode. None should have an inbound
     * property, or they should be null/undefined.
     * @type {?|undefined}
     */
    Metaedge.prototype.inbound;
    /**
     * Number of regular edges (not control dependency edges).
     * @type {?}
     */
    Metaedge.prototype.numRegularEdges;
    /**
     * Number of control dependency edges.
     * @type {?}
     */
    Metaedge.prototype.numControlEdges;
    /**
     * Number of reference edges, which is an edge to an operation
     * that takes a reference to its input and changes its value.
     * @type {?}
     */
    Metaedge.prototype.numRefEdges;
    /**
     * Total size (number of units) of all the tensors flowing through this edge.
     * @type {?}
     */
    Metaedge.prototype.totalSize;
    /**
     * @param {?} edge
     * @param {?} h
     * @return {?}
     */
    Metaedge.prototype.addBaseEdge = function (edge, h) { };
}
/**
 * @record
 */
export function GroupNode() { }
if (false) {
    /** @type {?} */
    GroupNode.prototype.metagraph;
    /** @type {?} */
    GroupNode.prototype.bridgegraph;
    /** @type {?} */
    GroupNode.prototype.deviceHistogram;
    /** @type {?} */
    GroupNode.prototype.xlaClusterHistogram;
    /** @type {?} */
    GroupNode.prototype.compatibilityHistogram;
    /** @type {?} */
    GroupNode.prototype.hasNonControlEdges;
}
