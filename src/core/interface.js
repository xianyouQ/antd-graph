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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXpvcnJvL25nLXBsdXMvZ3JhcGgvIiwic291cmNlcyI6WyJjb3JlL2ludGVyZmFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLE1BQU0sS0FBTyxTQUFTLEdBQUcsVUFBVTs7QUFDbkMsTUFBTSxLQUFPLGlCQUFpQixHQUFHLGlCQUFpQjs7QUFDbEQsTUFBTSxLQUFPLGVBQWUsR0FBRyxHQUFHOzs7SUFFWixPQUFJLEVBQUUsS0FBRSxFQUFFLFNBQU0sRUFBRSxTQUFNLEVBQUUsV0FBUTs7Ozs7Ozs7OztJQUU3QixVQUFPLEVBQUUsVUFBTyxFQUFFLGNBQVc7Ozs7Ozs7O0lBRWpDLE9BQUksRUFBRSxXQUFRLEVBQUUsT0FBSSxFQUFFLFNBQU0sRUFBRSxPQUFJLEVBQUUsU0FBTSxFQUFFLFNBQU0sRUFBRSxPQUFJOzs7Ozs7Ozs7Ozs7OztBQUUvRSw4QkFFQzs7O0lBREMseUJBQWlCOzs7OztBQUduQiw2QkFJQzs7O0lBSEMsdUJBQWE7O0lBQ2IseUJBQXVCOztJQUN2Qix1QkFBYzs7Ozs7QUFHaEIsa0NBR0M7OztJQUZDLDRCQUFhOztJQUNiLDRCQUFjOzs7OztBQUdoQiw2QkFFQzs7OztBQUVELDhCQUlDOzs7SUFIQyxxQkFBVTs7SUFDVixxQkFBVTs7SUFDVix3QkFBYzs7Ozs7QUFHaEIscUNBRUM7OztJQURDLHdDQUF5Qzs7Ozs7QUFHM0MsZ0NBS0M7Ozs7OztJQURDLDZCQUFpQjs7Ozs7QUFHbkIsMEJBUUM7OztJQVBDLG9CQUFhOztJQUNiLG9CQUFlOztJQUNmLDJCQUFxQjs7SUFDckIsMkJBQW9COztJQUNwQiwwQkFBaUI7O0lBQ2pCLHVCQUF1Qjs7SUFDdkIsb0JBQWM7Ozs7O0FBR2hCLDJCQUdDOzs7SUFGQyx3QkFBb0I7O0lBQ3BCLHdCQUFvQjs7Ozs7QUFJdEIsOEJBWUM7OztJQVhDLHlCQUFjOztJQUNkLDhCQUFtQjs7SUFDbkIsK0JBQXdDOztJQUV4QyxzQ0FBMkI7Ozs7SUFFM0IsbURBQWtDOzs7O0lBQ2xDLGlEQUEyQzs7OztJQUMzQywrQ0FBa0I7Ozs7SUFFbEIsNENBQW1COzs7OztBQUdyQiw4QkE0Q0M7Ozs7OztJQXZDQyxnQ0FBeUI7Ozs7Ozs7Ozs7Ozs7OztJQWV6QiwyQkFBa0I7Ozs7O0lBS2xCLG1DQUF3Qjs7Ozs7SUFLeEIsbUNBQXdCOzs7Ozs7SUFNeEIsK0JBQW9COzs7OztJQUtwQiw2QkFBa0I7Ozs7OztJQUVsQix3REFBZ0Q7Ozs7O0FBR2xELCtCQU9DOzs7SUFOQyw4QkFBMEQ7O0lBQzFELGdDQUE0RDs7SUFDNUQsb0NBQWdEOztJQUNoRCx3Q0FBb0Q7O0lBQ3BELDJDQUFxRTs7SUFDckUsdUNBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFRoaXMgcHJvZHVjdCBjb250YWlucyBhIG1vZGlmaWVkIHZlcnNpb24gb2YgJ1RlbnNvckJvYXJkIHBsdWdpbiBmb3IgZ3JhcGhzJyxcbiAqIGEgQW5ndWxhciBpbXBsZW1lbnRhdGlvbiBvZiBuZXN0LWdyYXBoIHZpc3VhbGl6YXRpb25cbiAqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgbmctem9ycm8tcGx1cyBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiAnQVMgSVMnIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuXG5pbXBvcnQgeyBCYXNlTm9kZSB9IGZyb20gJy4vZ3JhcGgnO1xuaW1wb3J0IHsgSGllcmFyY2h5IH0gZnJvbSAnLi9oaWVyYXJjaHknO1xuXG5leHBvcnQgY29uc3QgUk9PVF9OQU1FID0gJ19fcm9vdF9fJztcbmV4cG9ydCBjb25zdCBCUklER0VfR1JBUEhfTkFNRSA9ICdfX2JyaWRnZWdyYXBoX18nO1xuZXhwb3J0IGNvbnN0IE5BTUVTUEFDRV9ERUxJTSA9ICcvJztcblxuZXhwb3J0IGVudW0gTm9kZVR5cGUge01FVEEsIE9QLCBTRVJJRVMsIEJSSURHRSwgRUxMSVBTSVN9XG5cbmV4cG9ydCBlbnVtIEluY2x1c2lvblR5cGUge0lOQ0xVREUsIEVYQ0xVREUsIFVOU1BFQ0lGSUVEfVxuXG5leHBvcnQgZW51bSBHcmFwaFR5cGUge0ZVTEwsIEVNQkVEREVELCBNRVRBLCBTRVJJRVMsIENPUkUsIFNIQURPVywgQlJJREdFLCBFREdFfVxuXG5leHBvcnQgaW50ZXJmYWNlIEdyYXBoRGVmIHtcbiAgbm9kZXM6IE5vZGVEZWZbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb2RlRGVmIHtcbiAgbmFtZTogc3RyaW5nO1xuICBpbnB1dHM6IE5vZGVJbnB1dERlZltdO1xuICBhdHRyOiBBdHRyRGVmO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVJbnB1dERlZiB7XG4gIG5hbWU6IHN0cmluZztcbiAgYXR0cjogQXR0ckRlZjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyRGVmIHtcbiAgWyBrZXk6IHN0cmluZyBdOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZUVkZ2Uge1xuICB3OiBzdHJpbmc7XG4gIHY6IHN0cmluZztcbiAgbmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIaWVyYXJjaHlQYXJhbXMge1xuICByYW5rRGlyZWN0aW9uOiAnVEInIHwgJ0JUJyB8ICdMUicgfCAnUkwnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWRnZU5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBicmlkZ2Ugbm9kZSByZXByZXNlbnRzIGVkZ2VzIGNvbWluZyBpbnRvIGl0cyBwYXJlbnQgbm9kZS5cbiAgICovXG4gIGluYm91bmQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9kZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogTm9kZVR5cGU7XG4gIGlzR3JvdXBOb2RlOiBib29sZWFuO1xuICBjYXJkaW5hbGl0eTogbnVtYmVyO1xuICBwYXJlbnROb2RlOiBOb2RlO1xuICBpbmNsdWRlOiBJbmNsdXNpb25UeXBlO1xuICBhdHRyOiBBdHRyRGVmO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVkZ2VzIHtcbiAgY29udHJvbDogTWV0YWVkZ2VbXTtcbiAgcmVndWxhcjogTWV0YWVkZ2VbXTtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFub2RlIGV4dGVuZHMgR3JvdXBOb2RlIHtcbiAgZGVwdGg6IG51bWJlcjtcbiAgdGVtcGxhdGVJZDogc3RyaW5nO1xuICBvcEhpc3RvZ3JhbTogeyBbIG9wOiBzdHJpbmcgXTogbnVtYmVyIH07XG5cbiAgYXNzb2NpYXRlZEZ1bmN0aW9uOiBzdHJpbmc7XG5cbiAgZ2V0Rmlyc3RDaGlsZCgpOiBHcm91cE5vZGUgfCBOb2RlO1xuICBnZXRDaGlsZHJlbigpOiBBcnJheTxHcm91cE5vZGUgfCBCYXNlTm9kZT47XG4gIGdldFJvb3RPcCgpOiBOb2RlO1xuXG4gIGxlYXZlcygpOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZWRnZSBleHRlbmRzIGdyYXBobGliLkVkZ2VPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIG9yaWdpbmFsIEJhc2VFZGdlcyByZXByZXNlbnRlZCBieSB0aGlzIE1ldGFlZGdlLlxuICAgKi9cbiAgYmFzZUVkZ2VMaXN0OiBCYXNlRWRnZVtdO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgZWRnZSByZXByZXNlbnRzIGEgcmVsYXRpb25zaGlwIHRoYXQgaXMgaW5ib3VuZCAob3Igb3V0Ym91bmQpXG4gICAqIHRvIHRoZSBvYmplY3Qgd2hpY2ggY29udGFpbnMgdGhpcyBpbmZvcm1hdGlvbi4gRm9yIGV4YW1wbGUsIGluIGEgTWV0YW5vZGUnc1xuICAgKiBicmlkZ2VncmFwaCwgZWFjaCBlZGdlIGNvbm5lY3RzIGFuIGltbWVkaWF0ZSBjaGlsZCB0byBzb21ldGhpbmcgb3V0c2lkZVxuICAgKiB0aGUgTWV0YW5vZGUuIElmIHRoZSBkZXN0aW5hdGlvbiBvZiB0aGUgZWRnZSBpcyBpbnNpZGUgdGhlIE1ldGFub2RlLCB0aGVuXG4gICAqIGl0cyBpbmJvdW5kIHByb3BlcnR5IHNob3VsZCBiZSB0cnVlLiBJZiB0aGUgZGVzdGluYXRpb24gaXMgb3V0c2lkZSB0aGVcbiAgICogTWV0YW5vZGUsIHRoZW4gaXRzIGluYm91bmQgcHJvcGVydHkgc2hvdWxkIGJlIGZhbHNlLlxuICAgKlxuICAgKiBUaGUgcHJvcGVydHkgaXMgb3B0aW9uYWwgYmVjYXVzZSBub3QgYWxsIGVkZ2VzIGNhbiBiZSBkZXNjcmliZWQgYXNcbiAgICogaW5ib3VuZC9vdXRib3VuZC4gRm9yIGV4YW1wbGUsIGluIGEgTWV0YW5vZGUncyBtZXRhZ3JhcGgsIGFsbCBvZiB0aGUgZWRnZXNcbiAgICogY29ubmVjdCBpbW1lZGlhdGUgY2hpbGRyZW4gb2YgdGhlIE1ldGFub2RlLiBOb25lIHNob3VsZCBoYXZlIGFuIGluYm91bmRcbiAgICogcHJvcGVydHksIG9yIHRoZXkgc2hvdWxkIGJlIG51bGwvdW5kZWZpbmVkLlxuICAgKi9cbiAgaW5ib3VuZD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiByZWd1bGFyIGVkZ2VzIChub3QgY29udHJvbCBkZXBlbmRlbmN5IGVkZ2VzKS5cbiAgICovXG4gIG51bVJlZ3VsYXJFZGdlczogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgY29udHJvbCBkZXBlbmRlbmN5IGVkZ2VzLlxuICAgKi9cbiAgbnVtQ29udHJvbEVkZ2VzOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiByZWZlcmVuY2UgZWRnZXMsIHdoaWNoIGlzIGFuIGVkZ2UgdG8gYW4gb3BlcmF0aW9uXG4gICAqIHRoYXQgdGFrZXMgYSByZWZlcmVuY2UgdG8gaXRzIGlucHV0IGFuZCBjaGFuZ2VzIGl0cyB2YWx1ZS5cbiAgICovXG4gIG51bVJlZkVkZ2VzOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRvdGFsIHNpemUgKG51bWJlciBvZiB1bml0cykgb2YgYWxsIHRoZSB0ZW5zb3JzIGZsb3dpbmcgdGhyb3VnaCB0aGlzIGVkZ2UuXG4gICAqL1xuICB0b3RhbFNpemU6IG51bWJlcjtcblxuICBhZGRCYXNlRWRnZShlZGdlOiBCYXNlRWRnZSwgaDogSGllcmFyY2h5KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHcm91cE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgbWV0YWdyYXBoOiBncmFwaGxpYi5HcmFwaDxHcm91cE5vZGUgfCBCYXNlTm9kZSwgTWV0YWVkZ2U+O1xuICBicmlkZ2VncmFwaDogZ3JhcGhsaWIuR3JhcGg8R3JvdXBOb2RlIHwgQmFzZU5vZGUsIE1ldGFlZGdlPjtcbiAgZGV2aWNlSGlzdG9ncmFtOiB7IFsgZGV2aWNlOiBzdHJpbmcgXTogbnVtYmVyIH07XG4gIHhsYUNsdXN0ZXJIaXN0b2dyYW06IHsgWyBkZXZpY2U6IHN0cmluZyBdOiBudW1iZXIgfTtcbiAgY29tcGF0aWJpbGl0eUhpc3RvZ3JhbTogeyBjb21wYXRpYmxlOiBudW1iZXIsIGluY29tcGF0aWJsZTogbnVtYmVyIH07XG4gIGhhc05vbkNvbnRyb2xFZGdlczogYm9vbGVhbjtcbn1cblxuIl19