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
import * as d3 from "d3";
import { select } from "d3-selection";
import * as _ from "lodash";
import { EDGE_KEY_DELIM } from "./graph";
import { selectOrCreateChild, Class, SVG_NAMESPACE } from "./scene";
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
export function EdgeData() {}

/**
 * @param {?} edgeObj
 * @return {?}
 */
export function getEdgeKey(edgeObj) {
  return edgeObj.v + EDGE_KEY_DELIM + edgeObj.w;
}
/** @type {?} */
var arrowheadSizeArr = ["small", "medium", "large", "xlarge"];
/** @type {?} */
var arrowheadMap = d3
  .scaleQuantize()
  .domain([MIN_EDGE_WIDTH, MAX_EDGE_WIDTH])
  .range(arrowheadSizeArr);
/** @type {?} */
export var interpolate = d3
  .line()
  .curve(d3.curveBasis)
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  });
/**
 * @param {?} sceneGroup
 * @param {?} graph
 * @param {?} sceneElement
 * @return {?}
 */
export function buildGroupEdge(sceneGroup, graph, sceneElement) {
  /** @type {?} */
  var edges = [];
  edges = _.reduce(
    graph.edges(),
    function(_edges, edgeObj) {
      /** @type {?} */
      var edgeLabel = graph.edge(edgeObj);
      _edges.push({
        v: edgeObj.v,
        w: edgeObj.w,
        label: edgeLabel
      });
      return _edges;
    },
    edges
  );
  /** @type {?} */

  var container = selectOrCreateChild(sceneGroup, "g", Class.Edge.CONTAINER);
  // Select all children and join with data.
  // (Note that all children of g.edges are g.edge)
  /** @type {?} */
  var edgeGroups = /** @type {?} */ (container)
    .selectAll(function() {
      return this.childNodes;
    })
    .data(edges, getEdgeKey);


  // Make edges a group to support rendering multiple lines for metaedge
  edgeGroups
    .enter()
    .append("g")
    .attr("class", Class.Edge.GROUP)
    .attr("data-edge", getEdgeKey)
    .each(function(d) {
      /** @type {?} */
      var edgeGroup = select(this);
      d.label.edgeGroup = edgeGroup;
      // index node group for quick highlighting
      sceneElement._edgeGroupIndex[getEdgeKey(d)] = edgeGroup;
      if (sceneElement.handleEdgeSelected) {
        // The user or some higher-level component has opted to make edges selectable.
        edgeGroup.on("click", function(_d) {
          // Stop this event's propagation so that it isn't also considered
          // a graph-select.
          d3.event.stopPropagation();
          sceneElement.fire("edge-select", {
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
    .each(function(d) {
      stylize(select(this), d);
    });
  edgeGroups
    .exit()
    .each(function(d) {
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
    edgeClass += " " + Class.Edge.STRUCTURAL;
  }
  if (d.label && d.label.metaedge && d.label.metaedge.numRefEdges) {
    edgeClass += " " + Class.Edge.REFERENCE_EDGE;
  }
  if (graphComponent.handleEdgeSelected) {
    // The user has opted to make edges selectable.
    edgeClass += " " + Class.Edge.SELECTABLE;
  }
  // Give the path a unique id, which will be used to link
  // the textPath (edge label) to this path.
  /** @type {?} */
  var pathId = "path_" + getEdgeKey(d);
  /** @type {?} */
  var strokeWidth;
  if (graphComponent.renderHierarchy.edgeWidthFunction) {
    // Compute edge thickness based on the user-specified method.
    strokeWidth = graphComponent.renderHierarchy.edgeWidthFunction(
      d,
      edgeClass
    );
  } else {
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
  var path = edgeGroup
    .append("path")
    .attr("id", pathId)
    .attr("class", edgeClass)
    .style("stroke-width", strokeWidth + "px");
  // Check if there is a reference edge and add an arrowhead of the right size.
  if (d.label && d.label.metaedge) {
    if (d.label.metaedge.numRefEdges) {
      // We have a reference edge.
      /** @type {?} */
      var markerId = "reference-arrowhead-" + arrowheadMap(strokeWidth);
      path.style("marker-start", "url(#" + markerId + ")");
      d.label.startMarkerId = markerId;
    } else {
      // We have a dataflow edge.
      /** @type {?} */
      var markerId = "dataflow-arrowhead-" + arrowheadMap(strokeWidth);
      path.style("marker-end", "url(#" + markerId + ")");
      d.label.endMarkerId = markerId;
    }
  }
  if (d.label == null || d.label.metaedge == null) {
    // There is no associated metaedge, thus no text.
    // This happens for annotation edges.
    return;
  }
  /** @type {?} */
  var labelForEdge = getLabelForEdge(
    d.label.metaedge,
    graphComponent.renderHierarchy,
    graphComponent
  );
  if (labelForEdge == null) {
    // We have no information to show on this edge.
    return;
  }
  // Put edge label in the middle of edge only if the edge is thick enough.
  /** @type {?} */
  var baseline =
    strokeWidth > CENTER_EDGE_LABEL_MIN_STROKE_WIDTH ? "0em" : "-0.5em";
  edgeGroup
    .append("text")
    .attr("dy", baseline)
    .append("textPath")
    .attr("xlink:href", "#" + pathId)
    .attr("startOffset", "50%")
    .attr("text-anchor", "middle")
    .text(labelForEdge);
}
/**
 * @param {?} d
 * @return {?}
 */
function position(d) {
  d3.select(this)
    .select("path." + Class.Edge.LINE)
    .transition()
    .attrTween("d", getEdgePathInterpolator);
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
  return isMultiEdge
    ? metaedge.baseEdgeList.length + " operators"
    : getLabelForBaseEdge(metaedge.baseEdgeList[0], renderInfo);
}
/**
 * Returns the label for the given base edge.
 * The label is the shape of the underlying tensor.
 * @param {?} baseEdge
 * @param {?} renderInfo
 * @return {?}
 */
export function getLabelForBaseEdge(baseEdge, renderInfo) {
  return "";
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
  var renderMetaedgeInfo = /** @type {?} */ (d.label);
  /** @type {?} */
  var adjoiningMetaedge = renderMetaedgeInfo.adjoiningMetaedge;
  /** @type {?} */
  var points = renderMetaedgeInfo.points;
  // Adjust the path so that start/end markers point to the end
  // of the path.
  var root = d3.select(this);
  if (d.label.startMarkerId) {
    points = adjustPathPointsForMarker(
      points,
      d3.select("#" + d.label.startMarkerId),
      true
    );
  }
  if (d.label.endMarkerId) {
    points = adjustPathPointsForMarker(
      points,
      d3.select("#" + d.label.endMarkerId),
      false
    );
  }
  if (!adjoiningMetaedge) {
    return d3.interpolate(a, interpolate(points));
  }
  /** @type {?} */
  var renderPath = this;
  // Get the adjoining path that matches the adjoining metaedge.
  /** @type {?} */
  var adjoiningPath = /** @type {?} */ /** @type {?} */ (adjoiningMetaedge.edgeGroup.node()
    .firstChild);
  // Find the desired SVGPoint along the adjoining path, then convert those
  // coordinates into the space of the renderPath using its Current
  // Transformation Matrix (CTM).
  /** @type {?} */
  var inbound = renderMetaedgeInfo.metaedge.inbound;
  return function(t) {
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
  var lineFunc = d3
    .line()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    });
  /** @type {?} */
  var path = d3
    .select(document.createElementNS("http://www.w3.org/2000/svg", "path"))
    .attr("d", lineFunc(points));
  /** @type {?} */
  var markerWidth = +marker.attr("markerWidth");
  /** @type {?} */
  var viewBox = marker
    .attr("viewBox")
    .split(" ")
    .map(Number);
  /** @type {?} */
  var viewBoxWidth = viewBox[2] - viewBox[0];
  /** @type {?} */
  var refX = +marker.attr("refX");
  /** @type {?} */
  var pathNode = /** @type {?} */ (path.node());
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
  } else {
    // The edge flows upwards. Do not make the edge go the whole way, lest we
    // clobber the arrowhead.
    /** @type {?} */
    var fractionStickingOut = 1 - refX / viewBoxWidth;
    /** @type {?} */
    var length_2 =
      pathNode.getTotalLength() - markerWidth * fractionStickingOut;
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
  var path = document.createElementNS(SVG_NAMESPACE, "path");
  path.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  for (var i = 1; i < points.length; i++) {
    path.setAttribute("d", lineFunc(points.slice(0, i)));
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
  edgeGroup.classed("faded", d.label.isFadedOut);
  // const metaedge = d.label.metaedge;
  // edgeGroup.select('path.' + Class.Edge.LINE)
  // .classed('control-dep', metaedge && !metaedge.numRegularEdges);
}
