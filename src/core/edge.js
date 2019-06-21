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
import * as d3 from 'd3';
import { select } from 'd3-selection';
import * as _ from 'lodash';
import { EDGE_KEY_DELIM } from './graph';
import { selectOrCreateChild, Class, SVG_NAMESPACE } from './scene';
/** @type {?} */
export var MIN_EDGE_WIDTH = 2.5;
/**
 * The maximum stroke width of an edge.
 * @type {?}
 */
export var MAX_EDGE_WIDTH = 12;
/**
 * Minimum stroke width to put edge labels in the middle of edges
 * @type {?}
 */
var CENTER_EDGE_LABEL_MIN_STROKE_WIDTH = 8;
/**
 * @record
 */
export function EdgeData() { }
if (false) {
    /** @type {?} */
    EdgeData.prototype.v;
    /** @type {?} */
    EdgeData.prototype.w;
    /** @type {?} */
    EdgeData.prototype.label;
}
/**
 * @param {?} edgeObj
 * @return {?}
 */
export function getEdgeKey(edgeObj) {
    return edgeObj.v + EDGE_KEY_DELIM + edgeObj.w;
}
/** @type {?} */
var arrowheadSizeArr = ['small', 'medium', 'large', 'xlarge'];
/** @type {?} */
var arrowheadMap = d3.scaleQuantize().domain([MIN_EDGE_WIDTH, MAX_EDGE_WIDTH]).range(arrowheadSizeArr);
/** @type {?} */
export var interpolate = d3.line()
    .curve(d3.curveBasis)
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; });
/**
 * @param {?} sceneGroup
 * @param {?} graph
 * @param {?} sceneElement
 * @return {?}
 */
export function buildGroupEdge(sceneGroup, graph, sceneElement) {
    /** @type {?} */
    var edges = [];
    edges = _.reduce(graph.edges(), function (_edges, edgeObj) {
        /** @type {?} */
        var edgeLabel = graph.edge(edgeObj);
        _edges.push({
            v: edgeObj.v,
            w: edgeObj.w,
            label: edgeLabel
        });
        return _edges;
    }, edges);
    /** @type {?} */
    var container = selectOrCreateChild(sceneGroup, 'g', Class.Edge.CONTAINER);
    // Select all children and join with data.
    // (Note that all children of g.edges are g.edge)
    /** @type {?} */
    var edgeGroups = ((/** @type {?} */ (container))).selectAll(function () { return this.childNodes; }).data(edges, getEdgeKey);
    // Make edges a group to support rendering multiple lines for metaedge
    edgeGroups.enter()
        .append('g')
        .attr('class', Class.Edge.GROUP)
        .attr('data-edge', getEdgeKey)
        .each(function (d) {
        /** @type {?} */
        var edgeGroup = select(this);
        d.label.edgeGroup = edgeGroup;
        // index node group for quick highlighting
        sceneElement._edgeGroupIndex[getEdgeKey(d)] = edgeGroup;
        if (sceneElement.handleEdgeSelected) {
            // The user or some higher-level component has opted to make edges selectable.
            edgeGroup
                .on('click', function (_d) {
                // Stop this event's propagation so that it isn't also considered
                // a graph-select.
                ((/** @type {?} */ (d3.event))).stopPropagation();
                sceneElement.fire('edge-select', {
                    edgeData: _d,
                    edgeGroup: edgeGroup
                });
            });
        }
        // Add line during enter because we're assuming that type of line
        // normally does not change.
        appendEdge(edgeGroup, d, sceneElement);
    })
        .merge(edgeGroups)
        .each(position)
        .each(function (d) {
        stylize(select(this), d);
    });
    edgeGroups.exit()
        .each(function (d) {
        delete sceneElement._edgeGroupIndex[getEdgeKey(d)];
    })
        .remove();
    return edgeGroups;
}
/**
 * @param {?} edgeGroup
 * @param {?} d
 * @param {?} graphComponent
 * @param {?=} edgeClass
 * @return {?}
 */
export function appendEdge(edgeGroup, d, graphComponent, edgeClass) {
    edgeClass = edgeClass || Class.Edge.LINE; // set default type
    if (d.label && d.label.structural) {
        edgeClass += ' ' + Class.Edge.STRUCTURAL;
    }
    if (d.label && d.label.metaedge && d.label.metaedge.numRefEdges) {
        edgeClass += ' ' + Class.Edge.REFERENCE_EDGE;
    }
    if (graphComponent.handleEdgeSelected) {
        // The user has opted to make edges selectable.
        edgeClass += ' ' + Class.Edge.SELECTABLE;
    }
    // Give the path a unique id, which will be used to link
    // the textPath (edge label) to this path.
    /** @type {?} */
    var pathId = 'path_' + getEdgeKey(d);
    /** @type {?} */
    var strokeWidth;
    if (graphComponent.renderHierarchy.edgeWidthFunction) {
        // Compute edge thickness based on the user-specified method.
        strokeWidth = graphComponent.renderHierarchy.edgeWidthFunction(d, edgeClass);
    }
    else {
        // Encode tensor size within edge thickness.
        /** @type {?} */
        var size = 1;
        if (d.label != null && d.label.metaedge != null) {
            // There is an underlying Metaedge.
            size = d.label.metaedge.totalSize;
        }
        strokeWidth = graphComponent.renderHierarchy.edgeWidthSizedBasedScale(size);
    }
    /** @type {?} */
    var path = edgeGroup.append('path')
        .attr('id', pathId)
        .attr('class', edgeClass)
        .style('stroke-width', strokeWidth + 'px');
    // Check if there is a reference edge and add an arrowhead of the right size.
    if (d.label && d.label.metaedge) {
        if (d.label.metaedge.numRefEdges) {
            // We have a reference edge.
            /** @type {?} */
            var markerId = "reference-arrowhead-" + arrowheadMap(strokeWidth);
            path.style('marker-start', "url(#" + markerId + ")");
            d.label.startMarkerId = markerId;
        }
        else {
            // We have a dataflow edge.
            /** @type {?} */
            var markerId = "dataflow-arrowhead-" + arrowheadMap(strokeWidth);
            path.style('marker-end', "url(#" + markerId + ")");
            d.label.endMarkerId = markerId;
        }
    }
    if (d.label == null || d.label.metaedge == null) {
        // There is no associated metaedge, thus no text.
        // This happens for annotation edges.
        return;
    }
    /** @type {?} */
    var labelForEdge = getLabelForEdge(d.label.metaedge, graphComponent.renderHierarchy, graphComponent);
    if (labelForEdge == null) {
        // We have no information to show on this edge.
        return;
    }
    // Put edge label in the middle of edge only if the edge is thick enough.
    /** @type {?} */
    var baseline = strokeWidth > CENTER_EDGE_LABEL_MIN_STROKE_WIDTH ?
        '0em' :
        '-0.5em';
    edgeGroup.append('text')
        .attr('dy', baseline)
        .append('textPath')
        .attr('xlink:href', '#' + pathId)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text(labelForEdge);
}
/**
 * @param {?} d
 * @return {?}
 */
function position(d) {
    d3.select(this)
        .select('path.' + Class.Edge.LINE)
        .transition()
        .attrTween('d', (/** @type {?} */ (getEdgePathInterpolator)));
}
/**
 * Creates the label for the given metaedge. If the metaedge consists
 * of only 1 tensor, and it's shape is known, the label will contain that
 * shape. Otherwise, the label will say the number of tensors in the metaedge.
 * @param {?} metaedge
 * @param {?} renderInfo
 * @param {?} graphComponent
 * @return {?}
 */
export function getLabelForEdge(metaedge, renderInfo, graphComponent) {
    if (graphComponent.edgeLabelFunction) {
        // The user has specified a means of computing the label.
        return graphComponent.edgeLabelFunction(metaedge, renderInfo);
    }
    // Compute the label based on either tensor count or size.
    /** @type {?} */
    var isMultiEdge = metaedge.baseEdgeList.length > 1;
    return isMultiEdge ?
        metaedge.baseEdgeList.length + ' operators' :
        getLabelForBaseEdge(metaedge.baseEdgeList[0], renderInfo);
}
/**
 * Returns the label for the given base edge.
 * The label is the shape of the underlying tensor.
 * @param {?} baseEdge
 * @param {?} renderInfo
 * @return {?}
 */
export function getLabelForBaseEdge(baseEdge, renderInfo) {
    return '';
}
/**
 * Returns a tween interpolator for the endpoint of an edge path.
 * @param {?} d
 * @param {?} i
 * @param {?} a
 * @return {?}
 */
function getEdgePathInterpolator(d, i, a) {
    /** @type {?} */
    var renderMetaedgeInfo = (/** @type {?} */ (d.label));
    /** @type {?} */
    var adjoiningMetaedge = renderMetaedgeInfo.adjoiningMetaedge;
    /** @type {?} */
    var points = renderMetaedgeInfo.points;
    // Adjust the path so that start/end markers point to the end
    // of the path.
    if (d.label.startMarkerId) {
        points = adjustPathPointsForMarker(points, d3.select('#' + d.label.startMarkerId), true);
    }
    if (d.label.endMarkerId) {
        points = adjustPathPointsForMarker(points, d3.select('#' + d.label.endMarkerId), false);
    }
    if (!adjoiningMetaedge) {
        return d3.interpolate(a, interpolate(points));
    }
    /** @type {?} */
    var renderPath = this;
    // Get the adjoining path that matches the adjoining metaedge.
    /** @type {?} */
    var adjoiningPath = (/** @type {?} */ ((((/** @type {?} */ (adjoiningMetaedge.edgeGroup.node())))
        .firstChild)));
    // Find the desired SVGPoint along the adjoining path, then convert those
    // coordinates into the space of the renderPath using its Current
    // Transformation Matrix (CTM).
    /** @type {?} */
    var inbound = renderMetaedgeInfo.metaedge.inbound;
    return function (t) {
        /** @type {?} */
        var adjoiningPoint = adjoiningPath
            .getPointAtLength(inbound ? adjoiningPath.getTotalLength() : 0)
            .matrixTransform(adjoiningPath.getCTM())
            .matrixTransform(renderPath.getCTM().inverse());
        // Update the relevant point in the renderMetaedgeInfo's points list, then
        // re-interpolate the path.
        /** @type {?} */
        var index = inbound ? 0 : points.length - 1;
        points[index].x = adjoiningPoint.x;
        points[index].y = adjoiningPoint.y;
        return interpolate(points);
    };
}
/**
 * Shortens the path enought such that the tip of the start/end marker will
 * point to the start/end of the path. The marker can be of arbitrary size.
 *
 * @param {?} points Array of path control points.
 * @param {?} marker D3 selection of the <marker> svg element.
 * @param {?} isStart Is the marker a `start-marker`. If false, the marker is
 *     an `end-marker`.
 * @return {?} The new array of control points.
 */
function adjustPathPointsForMarker(points, marker, isStart) {
    /** @type {?} */
    var lineFunc = d3.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; });
    /** @type {?} */
    var path = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
        .attr('d', lineFunc(points));
    /** @type {?} */
    var markerWidth = +marker.attr('markerWidth');
    /** @type {?} */
    var viewBox = marker.attr('viewBox').split(' ').map(Number);
    /** @type {?} */
    var viewBoxWidth = viewBox[2] - viewBox[0];
    /** @type {?} */
    var refX = +marker.attr('refX');
    /** @type {?} */
    var pathNode = (/** @type {?} */ (path.node()));
    if (isStart) {
        // The edge flows downwards. Do not make the edge go the whole way, lest we
        // clobber the arrowhead.
        /** @type {?} */
        var fractionStickingOut = 1 - refX / viewBoxWidth;
        /** @type {?} */
        var length_1 = markerWidth * fractionStickingOut;
        /** @type {?} */
        var point = pathNode.getPointAtLength(length_1);
        // Figure out how many segments of the path we need to remove in order
        // to shorten the path.
        /** @type {?} */
        var segIndex = getPathSegmentIndexAtLength(points, length_1, lineFunc);
        // Update the very first segment.
        points[segIndex - 1] = { x: point.x, y: point.y };
        // Ignore every point before segIndex - 1.
        return points.slice(segIndex - 1);
    }
    else {
        // The edge flows upwards. Do not make the edge go the whole way, lest we
        // clobber the arrowhead.
        /** @type {?} */
        var fractionStickingOut = 1 - refX / viewBoxWidth;
        /** @type {?} */
        var length_2 = pathNode.getTotalLength() - markerWidth * fractionStickingOut;
        /** @type {?} */
        var point = pathNode.getPointAtLength(length_2);
        // Figure out how many segments of the path we need to remove in order
        // to shorten the path.
        /** @type {?} */
        var segIndex = getPathSegmentIndexAtLength(points, length_2, lineFunc);
        // Update the very last segment.
        points[segIndex] = { x: point.x, y: point.y };
        // Ignore every point after segIndex.
        return points.slice(0, segIndex + 1);
    }
}
/**
 * Computes the index into a set of points that constitute a path for which the
 * distance along the path from the initial point is as large as possible
 * without exceeding the length. This function was introduced after the
 * native getPathSegAtLength method got deprecated by SVG 2.
 * @param {?} points Array of path control points. A point has x and y properties.
 *   Must be of length at least 2.
 * @param {?} length The length (float).
 * @param {?} lineFunc A function that takes points and returns the "d" attribute
 *   of a path made from connecting the points.
 * @return {?} The index into the points array.
 */
function getPathSegmentIndexAtLength(points, length, lineFunc) {
    /** @type {?} */
    var path = document.createElementNS(SVG_NAMESPACE, 'path');
    for (var i = 1; i < points.length; i++) {
        path.setAttribute('d', lineFunc(points.slice(0, i)));
        if (path.getTotalLength() > length) {
            // This many points has already exceeded the length.
            return i - 1;
        }
    }
    // The entire path is shorter than the specified length.
    return points.length - 1;
}
/**
 * For a given d3 selection and data object, mark the edge as a control
 * dependency if it contains only control edges.
 *
 * d's label property will be a RenderMetaedgeInfo object.
 * @param {?} edgeGroup
 * @param {?} d
 * @return {?}
 */
function stylize(edgeGroup, d) {
    edgeGroup.classed('faded', d.label.isFadedOut);
    // const metaedge = d.label.metaedge;
    // edgeGroup.select('path.' + Class.Edge.LINE)
    // .classed('control-dep', metaedge && !metaedge.numRegularEdges);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRnZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BuZy16b3Jyby9uZy1wbHVzL2dyYXBoLyIsInNvdXJjZXMiOlsiY29yZS9lZGdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQSxPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQztBQUN6QixPQUFPLEVBQUUsTUFBTSxFQUFhLE1BQU0sY0FBYyxDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFJekMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUM7O0FBRXBFLE1BQU0sS0FBTyxjQUFjLEdBQUcsR0FBRzs7Ozs7QUFHakMsTUFBTSxLQUFPLGNBQWMsR0FBRyxFQUFFOzs7OztJQUcxQixrQ0FBa0MsR0FBRyxDQUFDOzs7O0FBRTVDLDhCQUE2RTs7O0lBQWxELHFCQUFVOztJQUFDLHFCQUFVOztJQUFDLHlCQUEwQjs7Ozs7O0FBRTNFLE1BQU0sVUFBVSxVQUFVLENBQUMsT0FBaUI7SUFDMUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxHQUFHLGNBQWMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7O0lBRUssZ0JBQWdCLEdBQTBCLENBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFFOztJQUNsRixZQUFZLEdBQ1osRUFBRSxDQUFDLGFBQWEsRUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzs7QUFFakcsTUFBTSxLQUFLLFdBQVcsR0FBb0MsRUFBRSxDQUFDLElBQUksRUFBMEI7S0FDMUYsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7S0FDcEIsQ0FBQyxDQUFDLFVB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PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBUaGlzIHByb2R1Y3QgY29udGFpbnMgYSBtb2RpZmllZCB2ZXJzaW9uIG9mICdUZW5zb3JCb2FyZCBwbHVnaW4gZm9yIGdyYXBocycsXG4gKiBhIEFuZ3VsYXIgaW1wbGVtZW50YXRpb24gb2YgbmVzdC1ncmFwaCB2aXN1YWxpemF0aW9uXG4gKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIG5nLXpvcnJvLXBsdXMgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSAnTGljZW5zZScpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gJ0FTIElTJyBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnO1xuaW1wb3J0IHsgc2VsZWN0LCBTZWxlY3Rpb24gfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgTnpHcmFwaENvbXBvbmVudCB9IGZyb20gJy4uL2dyYXBoL2dyYXBoLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFREdFX0tFWV9ERUxJTSB9IGZyb20gJy4vZ3JhcGgnO1xuaW1wb3J0IHsgQmFzZUVkZ2UsIE1ldGFlZGdlIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuLyoqIFRoZSBtaW5pbXVtIHN0cm9rZSB3aWR0aCBvZiBhbiBlZGdlLiAqL1xuaW1wb3J0IHsgUG9pbnQsIFJlbmRlckdyYXBoSW5mbywgUmVuZGVyTWV0YWVkZ2VJbmZvLCBSZW5kZXJOb2RlSW5mbyB9IGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCB7IHNlbGVjdE9yQ3JlYXRlQ2hpbGQsIENsYXNzLCBTVkdfTkFNRVNQQUNFIH0gZnJvbSAnLi9zY2VuZSc7XG5cbmV4cG9ydCBjb25zdCBNSU5fRURHRV9XSURUSCA9IDIuNTtcblxuLyoqIFRoZSBtYXhpbXVtIHN0cm9rZSB3aWR0aCBvZiBhbiBlZGdlLiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9FREdFX1dJRFRIID0gMTI7XG5cbi8qKiBNaW5pbXVtIHN0cm9rZSB3aWR0aCB0byBwdXQgZWRnZSBsYWJlbHMgaW4gdGhlIG1pZGRsZSBvZiBlZGdlcyAqL1xuY29uc3QgQ0VOVEVSX0VER0VfTEFCRUxfTUlOX1NUUk9LRV9XSURUSCA9IDg7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWRnZURhdGEge3Y6IHN0cmluZzsgdzogc3RyaW5nOyBsYWJlbDogUmVuZGVyTWV0YWVkZ2VJbmZvOyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZGdlS2V5KGVkZ2VPYmo6IEVkZ2VEYXRhKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVkZ2VPYmoudiArIEVER0VfS0VZX0RFTElNICsgZWRnZU9iai53O1xufVxuXG5jb25zdCBhcnJvd2hlYWRTaXplQXJyOiBSZWFkb25seUFycmF5PHN0cmluZz4gPSBbICdzbWFsbCcsICdtZWRpdW0nLCAnbGFyZ2UnLCAneGxhcmdlJyBdO1xuY29uc3QgYXJyb3doZWFkTWFwID1cbiAgICAgIGQzLnNjYWxlUXVhbnRpemU8c3RyaW5nPigpLmRvbWFpbihbTUlOX0VER0VfV0lEVEgsIE1BWF9FREdFX1dJRFRIXSkucmFuZ2UoYXJyb3doZWFkU2l6ZUFycik7XG5cbmV4cG9ydCBsZXQgaW50ZXJwb2xhdGU6IGQzLkxpbmU8e3g6IG51bWJlciwgeTogbnVtYmVyfT4gPSBkMy5saW5lPHt4OiBudW1iZXIsIHk6IG51bWJlcn0+KClcbi5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuLngoKGQpID0+IGQueClcbi55KChkKSA9PiBkLnkpO1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRHcm91cEVkZ2Uoc2NlbmVHcm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaDogZ3JhcGhsaWIuR3JhcGg8UmVuZGVyTm9kZUluZm8sIFJlbmRlck1ldGFlZGdlSW5mbz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVFbGVtZW50KSB7XG4gIGxldCBlZGdlczogRWRnZURhdGFbXSA9IFtdO1xuICBlZGdlcyA9IF8ucmVkdWNlKGdyYXBoLmVkZ2VzKCksIChfZWRnZXMsIGVkZ2VPYmopID0+IHtcbiAgICBjb25zdCBlZGdlTGFiZWwgPSBncmFwaC5lZGdlKGVkZ2VPYmopO1xuICAgIF9lZGdlcy5wdXNoKHtcbiAgICAgIHY6IGVkZ2VPYmoudixcbiAgICAgIHc6IGVkZ2VPYmoudyxcbiAgICAgIGxhYmVsOiBlZGdlTGFiZWxcbiAgICB9KTtcbiAgICByZXR1cm4gX2VkZ2VzO1xuICB9LCBlZGdlcyk7XG5cbiAgY29uc3QgY29udGFpbmVyID0gc2VsZWN0T3JDcmVhdGVDaGlsZChzY2VuZUdyb3VwLCAnZycsIENsYXNzLkVkZ2UuQ09OVEFJTkVSKTtcblxuICAvLyBTZWxlY3QgYWxsIGNoaWxkcmVuIGFuZCBqb2luIHdpdGggZGF0YS5cbiAgLy8gKE5vdGUgdGhhdCBhbGwgY2hpbGRyZW4gb2YgZy5lZGdlcyBhcmUgZy5lZGdlKVxuICBjb25zdCBlZGdlR3JvdXBzID0gKGNvbnRhaW5lciBhcyBhbnkpLnNlbGVjdEFsbChmdW5jdGlvbigpIHtyZXR1cm4gdGhpcy5jaGlsZE5vZGVzOyB9KS5kYXRhKGVkZ2VzLCBnZXRFZGdlS2V5KTtcblxuICAvLyBNYWtlIGVkZ2VzIGEgZ3JvdXAgdG8gc3VwcG9ydCByZW5kZXJpbmcgbXVsdGlwbGUgbGluZXMgZm9yIG1ldGFlZGdlXG4gIGVkZ2VHcm91cHMuZW50ZXIoKVxuICAuYXBwZW5kKCdnJylcbiAgLmF0dHIoJ2NsYXNzJywgQ2xhc3MuRWRnZS5HUk9VUClcbiAgLmF0dHIoJ2RhdGEtZWRnZScsIGdldEVkZ2VLZXkpXG4gIC5lYWNoKGZ1bmN0aW9uKGQ6IEVkZ2VEYXRhKSB7XG4gICAgY29uc3QgZWRnZUdyb3VwID0gc2VsZWN0KHRoaXMpO1xuICAgIGQubGFiZWwuZWRnZUdyb3VwID0gZWRnZUdyb3VwO1xuICAgIC8vIGluZGV4IG5vZGUgZ3JvdXAgZm9yIHF1aWNrIGhpZ2hsaWdodGluZ1xuICAgIHNjZW5lRWxlbWVudC5fZWRnZUdyb3VwSW5kZXhbZ2V0RWRnZUtleShkKV0gPSBlZGdlR3JvdXA7XG5cbiAgICBpZiAoc2NlbmVFbGVtZW50LmhhbmRsZUVkZ2VTZWxlY3RlZCkge1xuICAgICAgLy8gVGhlIHVzZXIgb3Igc29tZSBoaWdoZXItbGV2ZWwgY29tcG9uZW50IGhhcyBvcHRlZCB0byBtYWtlIGVkZ2VzIHNlbGVjdGFibGUuXG4gICAgICBlZGdlR3JvdXBcbiAgICAgIC5vbignY2xpY2snLFxuICAgICAgICBfZCA9PiB7XG4gICAgICAgICAgLy8gU3RvcCB0aGlzIGV2ZW50J3MgcHJvcGFnYXRpb24gc28gdGhhdCBpdCBpc24ndCBhbHNvIGNvbnNpZGVyZWRcbiAgICAgICAgICAvLyBhIGdyYXBoLXNlbGVjdC5cbiAgICAgICAgICAoZDMuZXZlbnQgYXMgRXZlbnQpLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIHNjZW5lRWxlbWVudC5maXJlKCdlZGdlLXNlbGVjdCcsIHtcbiAgICAgICAgICAgIGVkZ2VEYXRhOiBfZCxcbiAgICAgICAgICAgIGVkZ2VHcm91cFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgbGluZSBkdXJpbmcgZW50ZXIgYmVjYXVzZSB3ZSdyZSBhc3N1bWluZyB0aGF0IHR5cGUgb2YgbGluZVxuICAgIC8vIG5vcm1hbGx5IGRvZXMgbm90IGNoYW5nZS5cbiAgICBhcHBlbmRFZGdlKGVkZ2VHcm91cCwgZCwgc2NlbmVFbGVtZW50KTtcbiAgfSlcbiAgLm1lcmdlKGVkZ2VHcm91cHMpXG4gIC5lYWNoKHBvc2l0aW9uKVxuICAuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgc3R5bGl6ZShzZWxlY3QodGhpcyksIGQpO1xuICB9KTtcblxuICBlZGdlR3JvdXBzLmV4aXQoKVxuICAuZWFjaChkID0+IHtcbiAgICBkZWxldGUgc2NlbmVFbGVtZW50Ll9lZGdlR3JvdXBJbmRleFtnZXRFZGdlS2V5KGQpXTtcbiAgfSlcbiAgLnJlbW92ZSgpO1xuICByZXR1cm4gZWRnZUdyb3Vwcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZEVkZ2UoZWRnZUdyb3VwLCBkOiBFZGdlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoQ29tcG9uZW50OiBOekdyYXBoQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRnZUNsYXNzPzogc3RyaW5nKSB7XG4gIGVkZ2VDbGFzcyA9IGVkZ2VDbGFzcyB8fCBDbGFzcy5FZGdlLkxJTkU7IC8vIHNldCBkZWZhdWx0IHR5cGVcblxuICBpZiAoZC5sYWJlbCAmJiBkLmxhYmVsLnN0cnVjdHVyYWwpIHtcbiAgICBlZGdlQ2xhc3MgKz0gJyAnICsgQ2xhc3MuRWRnZS5TVFJVQ1RVUkFMO1xuICB9XG4gIGlmIChkLmxhYmVsICYmIGQubGFiZWwubWV0YWVkZ2UgJiYgZC5sYWJlbC5tZXRhZWRnZS5udW1SZWZFZGdlcykge1xuICAgIGVkZ2VDbGFzcyArPSAnICcgKyBDbGFzcy5FZGdlLlJFRkVSRU5DRV9FREdFO1xuICB9XG4gIGlmIChncmFwaENvbXBvbmVudC5oYW5kbGVFZGdlU2VsZWN0ZWQpIHtcbiAgICAvLyBUaGUgdXNlciBoYXMgb3B0ZWQgdG8gbWFrZSBlZGdlcyBzZWxlY3RhYmxlLlxuICAgIGVkZ2VDbGFzcyArPSAnICcgKyBDbGFzcy5FZGdlLlNFTEVDVEFCTEU7XG4gIH1cbiAgLy8gR2l2ZSB0aGUgcGF0aCBhIHVuaXF1ZSBpZCwgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGxpbmtcbiAgLy8gdGhlIHRleHRQYXRoIChlZGdlIGxhYmVsKSB0byB0aGlzIHBhdGguXG4gIGNvbnN0IHBhdGhJZCA9ICdwYXRoXycgKyBnZXRFZGdlS2V5KGQpO1xuXG4gIGxldCBzdHJva2VXaWR0aDtcbiAgaWYgKGdyYXBoQ29tcG9uZW50LnJlbmRlckhpZXJhcmNoeS5lZGdlV2lkdGhGdW5jdGlvbikge1xuICAgIC8vIENvbXB1dGUgZWRnZSB0aGlja25lc3MgYmFzZWQgb24gdGhlIHVzZXItc3BlY2lmaWVkIG1ldGhvZC5cbiAgICBzdHJva2VXaWR0aCA9IGdyYXBoQ29tcG9uZW50LnJlbmRlckhpZXJhcmNoeS5lZGdlV2lkdGhGdW5jdGlvbihkLCBlZGdlQ2xhc3MpO1xuICB9IGVsc2Uge1xuICAgIC8vIEVuY29kZSB0ZW5zb3Igc2l6ZSB3aXRoaW4gZWRnZSB0aGlja25lc3MuXG4gICAgbGV0IHNpemUgPSAxO1xuICAgIGlmIChkLmxhYmVsICE9IG51bGwgJiYgZC5sYWJlbC5tZXRhZWRnZSAhPSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhbiB1bmRlcmx5aW5nIE1ldGFlZGdlLlxuICAgICAgc2l6ZSA9IGQubGFiZWwubWV0YWVkZ2UudG90YWxTaXplO1xuICAgIH1cbiAgICBzdHJva2VXaWR0aCA9IGdyYXBoQ29tcG9uZW50LnJlbmRlckhpZXJhcmNoeS5lZGdlV2lkdGhTaXplZEJhc2VkU2NhbGUoc2l6ZSk7XG4gIH1cblxuICBjb25zdCBwYXRoID0gZWRnZUdyb3VwLmFwcGVuZCgncGF0aCcpXG4gIC5hdHRyKCdpZCcsIHBhdGhJZClcbiAgLmF0dHIoJ2NsYXNzJywgZWRnZUNsYXNzKVxuICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsIHN0cm9rZVdpZHRoICsgJ3B4Jyk7XG5cbiAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSByZWZlcmVuY2UgZWRnZSBhbmQgYWRkIGFuIGFycm93aGVhZCBvZiB0aGUgcmlnaHQgc2l6ZS5cbiAgaWYgKGQubGFiZWwgJiYgZC5sYWJlbC5tZXRhZWRnZSkge1xuICAgIGlmIChkLmxhYmVsLm1ldGFlZGdlLm51bVJlZkVkZ2VzKSB7XG4gICAgICAvLyBXZSBoYXZlIGEgcmVmZXJlbmNlIGVkZ2UuXG4gICAgICBjb25zdCBtYXJrZXJJZCA9IGByZWZlcmVuY2UtYXJyb3doZWFkLSR7YXJyb3doZWFkTWFwKHN0cm9rZVdpZHRoKX1gO1xuICAgICAgcGF0aC5zdHlsZSgnbWFya2VyLXN0YXJ0JywgYHVybCgjJHttYXJrZXJJZH0pYCk7XG4gICAgICBkLmxhYmVsLnN0YXJ0TWFya2VySWQgPSBtYXJrZXJJZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2UgaGF2ZSBhIGRhdGFmbG93IGVkZ2UuXG4gICAgICBjb25zdCBtYXJrZXJJZCA9IGBkYXRhZmxvdy1hcnJvd2hlYWQtJHthcnJvd2hlYWRNYXAoc3Ryb2tlV2lkdGgpfWA7XG4gICAgICBwYXRoLnN0eWxlKCdtYXJrZXItZW5kJywgYHVybCgjJHttYXJrZXJJZH0pYCk7XG4gICAgICBkLmxhYmVsLmVuZE1hcmtlcklkID0gbWFya2VySWQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKGQubGFiZWwgPT0gbnVsbCB8fCBkLmxhYmVsLm1ldGFlZGdlID09IG51bGwpIHtcbiAgICAvLyBUaGVyZSBpcyBubyBhc3NvY2lhdGVkIG1ldGFlZGdlLCB0aHVzIG5vIHRleHQuXG4gICAgLy8gVGhpcyBoYXBwZW5zIGZvciBhbm5vdGF0aW9uIGVkZ2VzLlxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbEZvckVkZ2UgPSBnZXRMYWJlbEZvckVkZ2UoZC5sYWJlbC5tZXRhZWRnZSxcbiAgICBncmFwaENvbXBvbmVudC5yZW5kZXJIaWVyYXJjaHksIGdyYXBoQ29tcG9uZW50KTtcbiAgaWYgKGxhYmVsRm9yRWRnZSA9PSBudWxsKSB7XG4gICAgLy8gV2UgaGF2ZSBubyBpbmZvcm1hdGlvbiB0byBzaG93IG9uIHRoaXMgZWRnZS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBQdXQgZWRnZSBsYWJlbCBpbiB0aGUgbWlkZGxlIG9mIGVkZ2Ugb25seSBpZiB0aGUgZWRnZSBpcyB0aGljayBlbm91Z2guXG4gIGNvbnN0IGJhc2VsaW5lID0gc3Ryb2tlV2lkdGggPiBDRU5URVJfRURHRV9MQUJFTF9NSU5fU1RST0tFX1dJRFRIID9cbiAgICAnMGVtJyA6XG4gICAgJy0wLjVlbSc7XG5cbiAgZWRnZUdyb3VwLmFwcGVuZCgndGV4dCcpXG4gIC5hdHRyKCdkeScsIGJhc2VsaW5lKVxuICAuYXBwZW5kKCd0ZXh0UGF0aCcpXG4gIC5hdHRyKCd4bGluazpocmVmJywgJyMnICsgcGF0aElkKVxuICAuYXR0cignc3RhcnRPZmZzZXQnLCAnNTAlJylcbiAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gIC50ZXh0KGxhYmVsRm9yRWRnZSk7XG59XG5cbmZ1bmN0aW9uIHBvc2l0aW9uKGQpIHtcbiAgZDMuc2VsZWN0KHRoaXMpXG4gIC5zZWxlY3QoJ3BhdGguJyArIENsYXNzLkVkZ2UuTElORSlcbiAgLnRyYW5zaXRpb24oKVxuICAuYXR0clR3ZWVuKCdkJywgZ2V0RWRnZVBhdGhJbnRlcnBvbGF0b3IgYXMgYW55KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBsYWJlbCBmb3IgdGhlIGdpdmVuIG1ldGFlZGdlLiBJZiB0aGUgbWV0YWVkZ2UgY29uc2lzdHNcbiAqIG9mIG9ubHkgMSB0ZW5zb3IsIGFuZCBpdCdzIHNoYXBlIGlzIGtub3duLCB0aGUgbGFiZWwgd2lsbCBjb250YWluIHRoYXRcbiAqIHNoYXBlLiBPdGhlcndpc2UsIHRoZSBsYWJlbCB3aWxsIHNheSB0aGUgbnVtYmVyIG9mIHRlbnNvcnMgaW4gdGhlIG1ldGFlZGdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFiZWxGb3JFZGdlKG1ldGFlZGdlOiBNZXRhZWRnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVySW5mbzogUmVuZGVyR3JhcGhJbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaENvbXBvbmVudDogTnpHcmFwaENvbXBvbmVudCk6IHN0cmluZyB7XG4gIGlmIChncmFwaENvbXBvbmVudC5lZGdlTGFiZWxGdW5jdGlvbikge1xuICAgIC8vIFRoZSB1c2VyIGhhcyBzcGVjaWZpZWQgYSBtZWFucyBvZiBjb21wdXRpbmcgdGhlIGxhYmVsLlxuICAgIHJldHVybiBncmFwaENvbXBvbmVudC5lZGdlTGFiZWxGdW5jdGlvbihtZXRhZWRnZSwgcmVuZGVySW5mbyk7XG4gIH1cbiAgLy8gQ29tcHV0ZSB0aGUgbGFiZWwgYmFzZWQgb24gZWl0aGVyIHRlbnNvciBjb3VudCBvciBzaXplLlxuICBjb25zdCBpc011bHRpRWRnZSA9IG1ldGFlZGdlLmJhc2VFZGdlTGlzdC5sZW5ndGggPiAxO1xuICByZXR1cm4gaXNNdWx0aUVkZ2UgP1xuICAgIG1ldGFlZGdlLmJhc2VFZGdlTGlzdC5sZW5ndGggKyAnIG9wZXJhdG9ycycgOlxuICAgIGdldExhYmVsRm9yQmFzZUVkZ2UobWV0YWVkZ2UuYmFzZUVkZ2VMaXN0WzBdLCByZW5kZXJJbmZvKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYWJlbCBmb3IgdGhlIGdpdmVuIGJhc2UgZWRnZS5cbiAqIFRoZSBsYWJlbCBpcyB0aGUgc2hhcGUgb2YgdGhlIHVuZGVybHlpbmcgdGVuc29yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFiZWxGb3JCYXNlRWRnZShcbiAgYmFzZUVkZ2U6IEJhc2VFZGdlLCByZW5kZXJJbmZvOiBSZW5kZXJHcmFwaEluZm8pOiBzdHJpbmcge1xuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHR3ZWVuIGludGVycG9sYXRvciBmb3IgdGhlIGVuZHBvaW50IG9mIGFuIGVkZ2UgcGF0aC5cbiAqL1xuZnVuY3Rpb24gZ2V0RWRnZVBhdGhJbnRlcnBvbGF0b3IoZDogRWRnZURhdGEsIGk6IG51bWJlciwgYTogc3RyaW5nKSB7XG4gIGNvbnN0IHJlbmRlck1ldGFlZGdlSW5mbyA9IGQubGFiZWwgYXMgUmVuZGVyTWV0YWVkZ2VJbmZvO1xuICBjb25zdCBhZGpvaW5pbmdNZXRhZWRnZSA9IHJlbmRlck1ldGFlZGdlSW5mby5hZGpvaW5pbmdNZXRhZWRnZTtcbiAgbGV0IHBvaW50cyA9IHJlbmRlck1ldGFlZGdlSW5mby5wb2ludHM7XG4gIC8vIEFkanVzdCB0aGUgcGF0aCBzbyB0aGF0IHN0YXJ0L2VuZCBtYXJrZXJzIHBvaW50IHRvIHRoZSBlbmRcbiAgLy8gb2YgdGhlIHBhdGguXG4gIGlmIChkLmxhYmVsLnN0YXJ0TWFya2VySWQpIHtcbiAgICBwb2ludHMgPSBhZGp1c3RQYXRoUG9pbnRzRm9yTWFya2VyKFxuICAgICAgcG9pbnRzLCBkMy5zZWxlY3QoJyMnICsgZC5sYWJlbC5zdGFydE1hcmtlcklkKSwgdHJ1ZSk7XG4gIH1cbiAgaWYgKGQubGFiZWwuZW5kTWFya2VySWQpIHtcbiAgICBwb2ludHMgPSBhZGp1c3RQYXRoUG9pbnRzRm9yTWFya2VyKFxuICAgICAgcG9pbnRzLCBkMy5zZWxlY3QoJyMnICsgZC5sYWJlbC5lbmRNYXJrZXJJZCksIGZhbHNlKTtcbiAgfVxuXG4gIGlmICghYWRqb2luaW5nTWV0YWVkZ2UpIHtcbiAgICByZXR1cm4gZDMuaW50ZXJwb2xhdGUoYSwgaW50ZXJwb2xhdGUocG9pbnRzKSk7XG4gIH1cblxuICBjb25zdCByZW5kZXJQYXRoID0gdGhpcztcbiAgLy8gR2V0IHRoZSBhZGpvaW5pbmcgcGF0aCB0aGF0IG1hdGNoZXMgdGhlIGFkam9pbmluZyBtZXRhZWRnZS5cbiAgY29uc3QgYWRqb2luaW5nUGF0aCA9XG4gICAgICAgICgoYWRqb2luaW5nTWV0YWVkZ2UuZWRnZUdyb3VwLm5vZGUoKSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICAuZmlyc3RDaGlsZCkgYXMgU1ZHUGF0aEVsZW1lbnQ7XG5cbiAgLy8gRmluZCB0aGUgZGVzaXJlZCBTVkdQb2ludCBhbG9uZyB0aGUgYWRqb2luaW5nIHBhdGgsIHRoZW4gY29udmVydCB0aG9zZVxuICAvLyBjb29yZGluYXRlcyBpbnRvIHRoZSBzcGFjZSBvZiB0aGUgcmVuZGVyUGF0aCB1c2luZyBpdHMgQ3VycmVudFxuICAvLyBUcmFuc2Zvcm1hdGlvbiBNYXRyaXggKENUTSkuXG4gIGNvbnN0IGluYm91bmQgPSByZW5kZXJNZXRhZWRnZUluZm8ubWV0YWVkZ2UuaW5ib3VuZDtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGNvbnN0IGFkam9pbmluZ1BvaW50ID0gYWRqb2luaW5nUGF0aFxuICAgIC5nZXRQb2ludEF0TGVuZ3RoKGluYm91bmQgPyBhZGpvaW5pbmdQYXRoLmdldFRvdGFsTGVuZ3RoKCkgOiAwKVxuICAgIC5tYXRyaXhUcmFuc2Zvcm0oYWRqb2luaW5nUGF0aC5nZXRDVE0oKSlcbiAgICAubWF0cml4VHJhbnNmb3JtKHJlbmRlclBhdGguZ2V0Q1RNKCkuaW52ZXJzZSgpKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgcmVsZXZhbnQgcG9pbnQgaW4gdGhlIHJlbmRlck1ldGFlZGdlSW5mbydzIHBvaW50cyBsaXN0LCB0aGVuXG4gICAgLy8gcmUtaW50ZXJwb2xhdGUgdGhlIHBhdGguXG4gICAgY29uc3QgaW5kZXggPSBpbmJvdW5kID8gMCA6IHBvaW50cy5sZW5ndGggLSAxO1xuICAgIHBvaW50c1tpbmRleF0ueCA9IGFkam9pbmluZ1BvaW50Lng7XG4gICAgcG9pbnRzW2luZGV4XS55ID0gYWRqb2luaW5nUG9pbnQueTtcbiAgICByZXR1cm4gaW50ZXJwb2xhdGUocG9pbnRzKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBTaG9ydGVucyB0aGUgcGF0aCBlbm91Z2h0IHN1Y2ggdGhhdCB0aGUgdGlwIG9mIHRoZSBzdGFydC9lbmQgbWFya2VyIHdpbGxcbiAqIHBvaW50IHRvIHRoZSBzdGFydC9lbmQgb2YgdGhlIHBhdGguIFRoZSBtYXJrZXIgY2FuIGJlIG9mIGFyYml0cmFyeSBzaXplLlxuICpcbiAqIEBwYXJhbSBwb2ludHMgQXJyYXkgb2YgcGF0aCBjb250cm9sIHBvaW50cy5cbiAqIEBwYXJhbSBtYXJrZXIgRDMgc2VsZWN0aW9uIG9mIHRoZSA8bWFya2VyPiBzdmcgZWxlbWVudC5cbiAqIEBwYXJhbSBpc1N0YXJ0IElzIHRoZSBtYXJrZXIgYSBgc3RhcnQtbWFya2VyYC4gSWYgZmFsc2UsIHRoZSBtYXJrZXIgaXNcbiAqICAgICBhbiBgZW5kLW1hcmtlcmAuXG4gKiBAcmV0dXJuIFRoZSBuZXcgYXJyYXkgb2YgY29udHJvbCBwb2ludHMuXG4gKi9cbmZ1bmN0aW9uIGFkanVzdFBhdGhQb2ludHNGb3JNYXJrZXIocG9pbnRzOiBQb2ludFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXI6IFNlbGVjdGlvbjxhbnksIGFueSwgYW55LCBhbnk+LCBpc1N0YXJ0OiBib29sZWFuKTogUG9pbnRbXSB7XG4gIGNvbnN0IGxpbmVGdW5jID0gZDMubGluZTxQb2ludD4oKVxuICAueChkID0+IGQueClcbiAgLnkoZCA9PiBkLnkpO1xuICBjb25zdCBwYXRoID1cbiAgICAgICAgZDMuc2VsZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAncGF0aCcpKVxuICAgICAgICAuYXR0cignZCcsIGxpbmVGdW5jKHBvaW50cykpO1xuICBjb25zdCBtYXJrZXJXaWR0aCA9ICttYXJrZXIuYXR0cignbWFya2VyV2lkdGgnKTtcbiAgY29uc3Qgdmlld0JveCA9IG1hcmtlci5hdHRyKCd2aWV3Qm94Jykuc3BsaXQoJyAnKS5tYXAoTnVtYmVyKTtcbiAgY29uc3Qgdmlld0JveFdpZHRoID0gdmlld0JveFsyXSAtIHZpZXdCb3hbMF07XG4gIGNvbnN0IHJlZlggPSArbWFya2VyLmF0dHIoJ3JlZlgnKTtcbiAgY29uc3QgcGF0aE5vZGUgPSBwYXRoLm5vZGUoKSBhcyBTVkdQYXRoRWxlbWVudDtcbiAgaWYgKGlzU3RhcnQpIHtcbiAgICAvLyBUaGUgZWRnZSBmbG93cyBkb3dud2FyZHMuIERvIG5vdCBtYWtlIHRoZSBlZGdlIGdvIHRoZSB3aG9sZSB3YXksIGxlc3Qgd2VcbiAgICAvLyBjbG9iYmVyIHRoZSBhcnJvd2hlYWQuXG4gICAgY29uc3QgZnJhY3Rpb25TdGlja2luZ091dCA9IDEgLSByZWZYIC8gdmlld0JveFdpZHRoO1xuICAgIGNvbnN0IGxlbmd0aCA9IG1hcmtlcldpZHRoICogZnJhY3Rpb25TdGlja2luZ091dDtcbiAgICBjb25zdCBwb2ludCA9IHBhdGhOb2RlLmdldFBvaW50QXRMZW5ndGgobGVuZ3RoKTtcbiAgICAvLyBGaWd1cmUgb3V0IGhvdyBtYW55IHNlZ21lbnRzIG9mIHRoZSBwYXRoIHdlIG5lZWQgdG8gcmVtb3ZlIGluIG9yZGVyXG4gICAgLy8gdG8gc2hvcnRlbiB0aGUgcGF0aC5cbiAgICBjb25zdCBzZWdJbmRleCA9IGdldFBhdGhTZWdtZW50SW5kZXhBdExlbmd0aChwb2ludHMsIGxlbmd0aCwgbGluZUZ1bmMpO1xuICAgIC8vIFVwZGF0ZSB0aGUgdmVyeSBmaXJzdCBzZWdtZW50LlxuICAgIHBvaW50c1tzZWdJbmRleCAtIDFdID0ge3g6IHBvaW50LngsIHk6IHBvaW50Lnl9O1xuICAgIC8vIElnbm9yZSBldmVyeSBwb2ludCBiZWZvcmUgc2VnSW5kZXggLSAxLlxuICAgIHJldHVybiBwb2ludHMuc2xpY2Uoc2VnSW5kZXggLSAxKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgZWRnZSBmbG93cyB1cHdhcmRzLiBEbyBub3QgbWFrZSB0aGUgZWRnZSBnbyB0aGUgd2hvbGUgd2F5LCBsZXN0IHdlXG4gICAgLy8gY2xvYmJlciB0aGUgYXJyb3doZWFkLlxuICAgIGNvbnN0IGZyYWN0aW9uU3RpY2tpbmdPdXQgPSAxIC0gcmVmWCAvIHZpZXdCb3hXaWR0aDtcbiAgICBjb25zdCBsZW5ndGggPVxuICAgICAgICAgICAgcGF0aE5vZGUuZ2V0VG90YWxMZW5ndGgoKSAtIG1hcmtlcldpZHRoICogZnJhY3Rpb25TdGlja2luZ091dDtcbiAgICBjb25zdCBwb2ludCA9IHBhdGhOb2RlLmdldFBvaW50QXRMZW5ndGgobGVuZ3RoKTtcbiAgICAvLyBGaWd1cmUgb3V0IGhvdyBtYW55IHNlZ21lbnRzIG9mIHRoZSBwYXRoIHdlIG5lZWQgdG8gcmVtb3ZlIGluIG9yZGVyXG4gICAgLy8gdG8gc2hvcnRlbiB0aGUgcGF0aC5cbiAgICBjb25zdCBzZWdJbmRleCA9IGdldFBhdGhTZWdtZW50SW5kZXhBdExlbmd0aChwb2ludHMsIGxlbmd0aCwgbGluZUZ1bmMpO1xuICAgIC8vIFVwZGF0ZSB0aGUgdmVyeSBsYXN0IHNlZ21lbnQuXG4gICAgcG9pbnRzW3NlZ0luZGV4XSA9IHt4OiBwb2ludC54LCB5OiBwb2ludC55fTtcbiAgICAvLyBJZ25vcmUgZXZlcnkgcG9pbnQgYWZ0ZXIgc2VnSW5kZXguXG4gICAgcmV0dXJuIHBvaW50cy5zbGljZSgwLCBzZWdJbmRleCArIDEpO1xuICB9XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGluZGV4IGludG8gYSBzZXQgb2YgcG9pbnRzIHRoYXQgY29uc3RpdHV0ZSBhIHBhdGggZm9yIHdoaWNoIHRoZVxuICogZGlzdGFuY2UgYWxvbmcgdGhlIHBhdGggZnJvbSB0aGUgaW5pdGlhbCBwb2ludCBpcyBhcyBsYXJnZSBhcyBwb3NzaWJsZVxuICogd2l0aG91dCBleGNlZWRpbmcgdGhlIGxlbmd0aC4gVGhpcyBmdW5jdGlvbiB3YXMgaW50cm9kdWNlZCBhZnRlciB0aGVcbiAqIG5hdGl2ZSBnZXRQYXRoU2VnQXRMZW5ndGggbWV0aG9kIGdvdCBkZXByZWNhdGVkIGJ5IFNWRyAyLlxuICogQHBhcmFtIHBvaW50cyBBcnJheSBvZiBwYXRoIGNvbnRyb2wgcG9pbnRzLiBBIHBvaW50IGhhcyB4IGFuZCB5IHByb3BlcnRpZXMuXG4gKiAgIE11c3QgYmUgb2YgbGVuZ3RoIGF0IGxlYXN0IDIuXG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSBsZW5ndGggKGZsb2F0KS5cbiAqIEBwYXJhbSBsaW5lRnVuYyBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgcG9pbnRzIGFuZCByZXR1cm5zIHRoZSBcImRcIiBhdHRyaWJ1dGVcbiAqICAgb2YgYSBwYXRoIG1hZGUgZnJvbSBjb25uZWN0aW5nIHRoZSBwb2ludHMuXG4gKiBAcmV0dXJuIFRoZSBpbmRleCBpbnRvIHRoZSBwb2ludHMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhTZWdtZW50SW5kZXhBdExlbmd0aChcbiAgcG9pbnRzOiBQb2ludFtdLFxuICBsZW5ndGg6IG51bWJlcixcbiAgbGluZUZ1bmM6IChwb2ludHM6IFBvaW50W10pID0+IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IHBhdGg6IFNWR1BhdGhFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OQU1FU1BBQ0UsICdwYXRoJyk7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ2QnLCBsaW5lRnVuYyhwb2ludHMuc2xpY2UoMCwgaSkpKTtcbiAgICBpZiAocGF0aC5nZXRUb3RhbExlbmd0aCgpID4gbGVuZ3RoKSB7XG4gICAgICAvLyBUaGlzIG1hbnkgcG9pbnRzIGhhcyBhbHJlYWR5IGV4Y2VlZGVkIHRoZSBsZW5ndGguXG4gICAgICByZXR1cm4gaSAtIDE7XG4gICAgfVxuICB9XG4gIC8vIFRoZSBlbnRpcmUgcGF0aCBpcyBzaG9ydGVyIHRoYW4gdGhlIHNwZWNpZmllZCBsZW5ndGguXG4gIHJldHVybiBwb2ludHMubGVuZ3RoIC0gMTtcbn1cblxuLyoqXG4gKiBGb3IgYSBnaXZlbiBkMyBzZWxlY3Rpb24gYW5kIGRhdGEgb2JqZWN0LCBtYXJrIHRoZSBlZGdlIGFzIGEgY29udHJvbFxuICogZGVwZW5kZW5jeSBpZiBpdCBjb250YWlucyBvbmx5IGNvbnRyb2wgZWRnZXMuXG4gKlxuICogZCdzIGxhYmVsIHByb3BlcnR5IHdpbGwgYmUgYSBSZW5kZXJNZXRhZWRnZUluZm8gb2JqZWN0LlxuICovXG5mdW5jdGlvbiBzdHlsaXplKGVkZ2VHcm91cCwgZDogRWRnZURhdGEpIHtcbiAgZWRnZUdyb3VwLmNsYXNzZWQoJ2ZhZGVkJywgZC5sYWJlbC5pc0ZhZGVkT3V0KTtcbiAgLy8gY29uc3QgbWV0YWVkZ2UgPSBkLmxhYmVsLm1ldGFlZGdlO1xuICAvLyBlZGdlR3JvdXAuc2VsZWN0KCdwYXRoLicgKyBDbGFzcy5FZGdlLkxJTkUpXG4gIC8vIC5jbGFzc2VkKCdjb250cm9sLWRlcCcsIG1ldGFlZGdlICYmICFtZXRhZWRnZS5udW1SZWd1bGFyRWRnZXMpO1xufVxuIl19