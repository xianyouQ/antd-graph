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
import { layout } from 'dagre';
import * as _ from 'lodash';
import { NodeType } from './interface';
/** @type {?} */
export var PARAMS = {
    animation: {
        /**
         * Default duration for graph animations in ms.
         */
        duration: 250
    },
    graph: {
        /**
         * Graph parameter for metanode.
         */
        meta: {
            /**
             * Dagre's nodesep param - number of pixels that
             * separate nodes horizontally in the layout.
             *
             * See https://github.com/cpettitt/dagre/wiki#configuring-the-layout
             */
            nodeSep: 50,
            /**
             * Dagre's ranksep param - number of pixels
             * between each rank in the layout.
             *
             * See https://github.com/cpettitt/dagre/wiki#configuring-the-layout
             */
            rankSep: 40,
            /**
             * Dagre's edgesep param - number of pixels that separate
             * edges horizontally in the layout.
             */
            edgeSep: 5
        },
        /**
         * Graph parameter for metanode.
         */
        series: {
            /**
             * Dagre's nodesep param - number of pixels that
             * separate nodes horizontally in the layout.
             *
             * See https://github.com/cpettitt/dagre/wiki#configuring-the-layout
             */
            nodeSep: 5,
            /**
             * Dagre's ranksep param - number of pixels
             * between each rank in the layout.
             *
             * See https://github.com/cpettitt/dagre/wiki#configuring-the-layout
             */
            rankSep: 25,
            /**
             * Dagre's edgesep param - number of pixels that separate
             * edges horizontally in the layout.
             */
            edgeSep: 5
        },
        /**
         * Padding is used to correctly position the graph SVG inside of its parent
         * element. The padding amounts are applied using an SVG transform of X and
         * Y coordinates.
         */
        padding: { paddingTop: 10, paddingLeft: 0 }
    },
    subscene: {
        meta: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
            /**
             * Used to leave room for the label on top of the highest node in
             * the groupCore graph.
             */
            labelHeight: 20,
            /**
             * X-space between each extracted node and the groupCore graph.
             */
            extractXOffset: 0,
            /**
             * Y-space between each extracted node.
             */
            extractYOffset: 0
        },
        series: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            labelHeight: 10
        }
    },
    nodeSize: {
        /**
         * Size of meta nodes.
         */
        meta: {
            radius: 2,
            width: 230,
            maxLabelWidth: 0,
            /**
             * A scale for the node's height based on number of nodes inside
             */
            // Hack - set this as an any type to avoid issues in exporting a type
            // from an external module.
            height: 165,
            /**
             * The radius of the circle denoting the expand button.
             */
            expandButtonRadius: 3
        },
        /**
         * Size of op nodes.
         */
        op: {
            width: 230,
            height: 160,
            radius: 1,
            // for making annotation touching ellipse
            labelOffset: 10,
            maxLabelWidth: 40
        },
        /**
         * Size of series nodes.
         */
        series: {
            expanded: {
                // For expanded series nodes, width and height will be
                // computed to account for the subscene.
                radius: 10,
                labelOffset: 0
            },
            vertical: {
                // When unexpanded, series whose underlying metagraphs contain
                // one or more non-control edges will show as a vertical stack
                // of ellipses.
                width: 16,
                height: 13,
                labelOffset: -13
            },
            horizontal: {
                // When unexpanded, series whose underlying metagraphs contain
                // no non-control edges will show as a horizontal stack of
                // ellipses.
                width: 24,
                height: 8,
                radius: 10,
                // Forces annotations to center line.
                labelOffset: -10
            }
        },
        /**
         * Size of bridge nodes.
         */
        bridge: {
            // NOTE: bridge nodes will normally be invisible, but they must
            // take up some space so that the layout step leaves room for
            // their edges.
            width: 20,
            height: 20,
            radius: 2,
            labelOffset: 0
        }
    },
    shortcutSize: {
        /**
         * Size of shortcuts for op nodes
         */
        op: { width: 10, height: 4 },
        /**
         * Size of shortcuts for meta nodes
         */
        meta: { width: 12, height: 4, radius: 1 },
        /**
         * Size of shortcuts for series nodes
         */
        series: {
            width: 14,
            height: 4
        }
    },
    annotations: {
        /**
         * Maximum possible width of the bounding box for in annotations
         */
        inboxWidth: 50,
        /**
         * Maximum possible width of the bounding box for out annotations
         */
        outboxWidth: 50,
        /**
         * X-space between the shape and each annotation-node.
         */
        xOffset: 10,
        /**
         * Y-space between each annotation-node.
         */
        yOffset: 3,
        /**
         * X-space between each annotation-node and its label.
         */
        labelOffset: 2,
        /**
         * Defines the max width for annotation label
         */
        maxLabelWidth: 120
    },
    constant: { size: { width: 4, height: 4 } },
    series: {
        /**
         * Maximum number of repeated item for unexpanded series node.
         */
        maxStackCount: 3,
        /**
         * Positioning offset ratio for collapsed stack
         * of parallel series (series without edges between its members).
         */
        parallelStackOffsetRatio: 0.2,
        /**
         * Positioning offset ratio for collapsed stack
         * of tower series (series with edges between its members).
         */
        towerStackOffsetRatio: 0.5
    },
    minimap: {
        /**
         * The maximum width/height the minimap can have.
         */
        size: 150
    }
};
/**
 * The minimum width we confer upon the auxiliary nodes section if functions
 * also appear. Without enforcing this minimum, metanodes in the function
 * library section could jut into the auxiliary nodes section because the
 * title "Auxiliary Nodes" is longer than the width of the auxiliary nodes
 * section itself.
 * @type {?}
 */
export var MIN_AUX_WIDTH = 0;
/**
 * Calculate layout for a scene of a group node.
 * @param {?} renderNodeInfo
 * @param {?} graphComponent
 * @return {?}
 */
export function layoutScene(renderNodeInfo, graphComponent) {
    // Update layout, size, and annotations of its children nodes and edges.
    if (renderNodeInfo.node.isGroupNode) {
        layoutChildren(renderNodeInfo, graphComponent);
    }
    // Update position of its children nodes and edges
    if (renderNodeInfo.node.type === NodeType.META) {
        layoutMetanode(renderNodeInfo, graphComponent);
    }
    else if (renderNodeInfo.node.type === NodeType.SERIES) {
        layoutSeriesNode(renderNodeInfo, graphComponent);
    }
}
/**
 * 更新其子节点与 edges 的布局和大小
 * @param {?} renderNodeInfo
 * @param {?} graphComponent
 * @return {?}
 */
export function layoutChildren(renderNodeInfo, graphComponent) {
    /** @type {?} */
    var children = renderNodeInfo.coreGraph.nodes().map(function (n) {
        return renderNodeInfo.coreGraph.node(n);
    }).concat(renderNodeInfo.isolatedInExtract, renderNodeInfo.isolatedOutExtract);
    children.forEach(function (childNodeInfo) {
        // Set size of each child
        switch (childNodeInfo.node.type) {
            case NodeType.OP:
                Object.assign(childNodeInfo, PARAMS.nodeSize.op);
                if (graphComponent.opNodeHeightFunction) {
                    childNodeInfo.height = graphComponent.opNodeHeightFunction(childNodeInfo);
                }
                else {
                    childNodeInfo.height = PARAMS.nodeSize.op.height;
                }
                if (graphComponent.opNodeWidthFunction) {
                    childNodeInfo.height = graphComponent.opNodeWidthFunction(childNodeInfo);
                }
                else {
                    childNodeInfo.width = PARAMS.nodeSize.op.width;
                }
                break;
            case NodeType.BRIDGE:
                Object.assign(childNodeInfo, PARAMS.nodeSize.bridge);
                break;
            case NodeType.META:
                if (!childNodeInfo.expanded) {
                    // Set fixed width and scalable height based on cardinality
                    Object.assign(childNodeInfo, PARAMS.nodeSize.meta);
                    if (graphComponent.groupNodeHeightFunction) {
                        childNodeInfo.height = graphComponent.groupNodeHeightFunction(childNodeInfo);
                    }
                    else {
                        childNodeInfo.height = PARAMS.nodeSize.meta.height;
                    }
                    if (graphComponent.groupNodeWidthFunction) {
                        childNodeInfo.height = graphComponent.groupNodeWidthFunction(childNodeInfo);
                    }
                    else {
                        childNodeInfo.width = PARAMS.nodeSize.meta.width;
                    }
                }
                else {
                    /** @type {?} */
                    var childGroupNodeInfo = (/** @type {?} */ (childNodeInfo));
                    layoutScene(childGroupNodeInfo, graphComponent); // Recursively layout its subscene.
                }
                break;
            case NodeType.SERIES:
                if (childNodeInfo.expanded) {
                    Object.assign(childNodeInfo, PARAMS.nodeSize.series.expanded);
                    /** @type {?} */
                    var childGroupNodeInfo = (/** @type {?} */ (childNodeInfo));
                    layoutScene(childGroupNodeInfo, graphComponent); // Recursively layout its subscene.
                }
                else {
                    /** @type {?} */
                    var childGroupNodeInfo = (/** @type {?} */ (childNodeInfo));
                    /** @type {?} */
                    var seriesParams = childGroupNodeInfo.node.hasNonControlEdges ?
                        PARAMS.nodeSize.series.vertical :
                        PARAMS.nodeSize.series.horizontal;
                    Object.assign(childNodeInfo, seriesParams);
                }
                break;
            default:
                throw Error('Unrecognized node type: ' + childNodeInfo.node.type);
        }
        // Compute total width of un-expanded nodes. Width of expanded nodes
        // has already been computed.
        if (!childNodeInfo.expanded) {
            updateTotalWidthOfNode(childNodeInfo);
        }
    });
}
/**
 * @param {?} renderNodeInfo
 * @param {?} graphComponent
 * @return {?}
 */
export function layoutMetanode(renderNodeInfo, graphComponent) {
    // First, copy params specific to meta nodes onto this render info object.
    /** @type {?} */
    var params = PARAMS.subscene.meta;
    Object.assign(renderNodeInfo, params);
    // Invoke dagre.layout() on the groupCore graph and record the bounding box
    // dimensions.
    Object.assign(renderNodeInfo.coreBox, dagreLayout(renderNodeInfo.coreGraph, PARAMS.graph.meta, graphComponent));
    // Calculate the position of nodes in isolatedInExtract relative to the
    // top-left corner of inExtractBox (the bounding box for all inExtract nodes)
    // and calculate the size of the inExtractBox.
    /** @type {?} */
    var maxInExtractWidth = renderNodeInfo.isolatedInExtract.length ?
        _.maxBy(renderNodeInfo.isolatedInExtract, function (renderNode) { return renderNode.width; }).width : null;
    renderNodeInfo.inExtractBox.width = maxInExtractWidth != null ?
        maxInExtractWidth : 0;
    renderNodeInfo.inExtractBox.height =
        _.reduce(renderNodeInfo.isolatedInExtract, function (height, child, i) {
            /** @type {?} */
            var yOffset = i > 0 ? params.extractYOffset : 0;
            // use width/height here to avoid overlaps between extracts
            child.x = 0;
            child.y = height + yOffset + child.height / 2;
            return height + yOffset + child.height;
        }, 0);
    // Calculate the position of nodes in isolatedOutExtract relative to the
    // top-left corner of outExtractBox (the bounding box for all outExtract
    // nodes) and calculate the size of the outExtractBox.
    /** @type {?} */
    var maxOutExtractWidth = renderNodeInfo.isolatedOutExtract.length ?
        _.maxBy(renderNodeInfo.isolatedOutExtract, function (renderNode) { return renderNode.width; }).width : null;
    renderNodeInfo.outExtractBox.width = maxOutExtractWidth != null ?
        maxOutExtractWidth : 0;
    renderNodeInfo.outExtractBox.height =
        _.reduce(renderNodeInfo.isolatedOutExtract, function (height, child, i) {
            /** @type {?} */
            var yOffset = i > 0 ? params.extractYOffset : 0;
            // use width/height here to avoid overlaps between extracts
            child.x = 0;
            child.y = height + yOffset + child.height / 2;
            return height + yOffset + child.height;
        }, 0);
    // Calculate the position of nodes in libraryFunctionsExtract relative to the
    // top-left corner of libraryFunctionsBox (the bounding box for all library
    // function nodes) and calculate the size of the libraryFunctionsBox.
    // Compute the total padding between the groupCore graph, in-extract and
    // out-extract boxes.
    /** @type {?} */
    var numParts = 0;
    if (renderNodeInfo.isolatedInExtract.length > 0) {
        numParts++;
    }
    if (renderNodeInfo.isolatedOutExtract.length > 0) {
        numParts++;
    }
    if (renderNodeInfo.coreGraph.nodeCount() > 0) {
        numParts++;
    }
    /** @type {?} */
    var offset = PARAMS.subscene.meta.extractXOffset;
    /** @type {?} */
    var padding = numParts <= 1 ? 0 : (numParts * offset);
    // Add the in-extract and out-extract width to the groupCore box width. Do not let
    // the auxiliary width be too small, lest it be smaller than the title.
    /** @type {?} */
    var auxWidth = Math.max(MIN_AUX_WIDTH, renderNodeInfo.inExtractBox.width + renderNodeInfo.outExtractBox.width);
    renderNodeInfo.coreBox.width += auxWidth + padding + padding;
    renderNodeInfo.coreBox.height =
        params.labelHeight +
            Math.max(renderNodeInfo.inExtractBox.height, renderNodeInfo.coreBox.height, renderNodeInfo.outExtractBox.height);
    // Determine the whole metanode's width (from left to right).
    renderNodeInfo.width = renderNodeInfo.coreBox.width +
        params.paddingLeft + params.paddingRight;
    // Determine the whole metanode's height (from top to bottom).
    renderNodeInfo.height =
        renderNodeInfo.paddingTop +
            renderNodeInfo.coreBox.height +
            renderNodeInfo.paddingBottom;
}
/**
 * @param {?} node
 * @param {?} graphComponent
 * @return {?}
 */
export function layoutSeriesNode(node, graphComponent) {
    /** @type {?} */
    var graph = node.coreGraph;
    /** @type {?} */
    var params = PARAMS.subscene.series;
    Object.assign(node, params);
    // Layout the groupCore.
    Object.assign(node.coreBox, dagreLayout(node.coreGraph, PARAMS.graph.series, graphComponent));
    graph.nodes().forEach(function (nodeName) {
        graph.node(nodeName).excluded = false;
    });
    // Series do not have in/outExtractBox so no need to include them here.
    node.width = node.coreBox.width + params.paddingLeft + params.paddingRight;
    node.height = node.coreBox.height + params.paddingTop + params.paddingBottom;
}
/**
 * @param {?} renderInfo
 * @return {?}
 */
function updateTotalWidthOfNode(renderInfo) {
    // Assign the width of the groupCore box (the main shape of the node).
    renderInfo.coreBox.width = renderInfo.width;
    renderInfo.coreBox.height = renderInfo.height;
    // TODO: Account for font width rather than using a magic number.
    /** @type {?} */
    var labelLength = renderInfo.displayName.length;
    /** @type {?} */
    var charWidth = 3;
    // Compute the total width of the node.
    renderInfo.width = Math.max(renderInfo.coreBox.width +
        renderInfo.inboxWidth + renderInfo.outboxWidth, labelLength * charWidth);
}
/**
 * Calculate layout for a graph using dagre
 * @param {?} graph the graph to be laid out
 * @param {?} params layout parameters
 * @param {?} graphComponent
 * @return {?} width and height of the groupCore graph
 */
function dagreLayout(graph, params, graphComponent) {
    Object.assign(graph.graph(), {
        nodesep: params.nodeSep,
        ranksep: params.rankSep,
        edgesep: params.edgeSep
    });
    /** @type {?} */
    var bridgeNodeNames = [];
    /** @type {?} */
    var nonBridgeNodeNames = [];
    // Split out nodes into bridge and non-bridge nodes, and calculate the total
    // width we should use for bridge nodes.
    graph.nodes().forEach(function (nodeName) {
        /** @type {?} */
        var nodeInfo = graph.node(nodeName);
        if (nodeInfo.node.type === NodeType.BRIDGE) {
            bridgeNodeNames.push(nodeName);
        }
        else {
            nonBridgeNodeNames.push(nodeName);
        }
    });
    if (graphComponent.edgesLayoutFunction) {
        graphComponent.edgesLayoutFunction(graph, params);
    }
    // If there are no non-bridge nodes, then the graph has zero size.
    if (!nonBridgeNodeNames.length) {
        return {
            width: 0,
            height: 0
        };
    }
    layout((/** @type {?} */ (graph)));
    // Calculate the true bounding box of the graph by iterating over nodes and
    // edges rather than accepting dagre's word for it. In particular, we should
    // ignore the extra-wide bridge nodes and bridge edges, and allow for
    // annotation boxes and labels.
    /** @type {?} */
    var minX = Infinity;
    /** @type {?} */
    var minY = Infinity;
    /** @type {?} */
    var maxX = -Infinity;
    /** @type {?} */
    var maxY = -Infinity;
    nonBridgeNodeNames.forEach(function (nodeName) {
        /** @type {?} */
        var nodeInfo = graph.node(nodeName);
        /** @type {?} */
        var w = 0.5 * nodeInfo.width;
        /** @type {?} */
        var x1 = nodeInfo.x - w;
        /** @type {?} */
        var x2 = nodeInfo.x + w;
        minX = x1 < minX ? x1 : minX;
        maxX = x2 > maxX ? x2 : maxX;
        // TODO: Account for the height of labels above op nodes here.
        /** @type {?} */
        var h = 0.5 * nodeInfo.height;
        /** @type {?} */
        var y1 = nodeInfo.y - h;
        /** @type {?} */
        var y2 = nodeInfo.y + h;
        minY = y1 < minY ? y1 : minY;
        maxY = y2 > maxY ? y2 : maxY;
    });
    graph.edges().forEach(function (edgeObj) {
        /** @type {?} */
        var edgeInfo = graph.edge(edgeObj);
        if (edgeInfo.structural) {
            return; // Skip structural edges from min/max calculations.
        }
        // Since the node size passed to dagre includes the in and out
        // annotations, the endpoints of the edge produced by dagre may not
        // point to the actual node shape (rectangle, ellipse). We correct the
        // end-points by finding the intersection of a line between the
        // next-to-last (next-to-first) point and the destination (source)
        // rectangle.
        /** @type {?} */
        var sourceNode = graph.node(edgeInfo.metaedge.v);
        /** @type {?} */
        var destNode = graph.node(edgeInfo.metaedge.w);
        // Straight 3-points edges are special case, since they are curved after
        // our default correction. To keep them straight, we remove the mid point
        // and correct the first and the last point to be the center of the
        // source and destination node respectively.
        if (edgeInfo.points.length === 3 && isStraightLine(edgeInfo.points)) {
            if (sourceNode != null) {
                /** @type {?} */
                var cxSource = sourceNode.expanded ?
                    sourceNode.x : computeCXPositionOfNodeShape(sourceNode);
                edgeInfo.points[0].x = cxSource;
            }
            if (destNode != null) {
                /** @type {?} */
                var cxDest = destNode.expanded ?
                    destNode.x : computeCXPositionOfNodeShape(destNode);
                edgeInfo.points[2].x = cxDest;
            }
            // Remove the middle point so the edge doesn't curve.
            edgeInfo.points = [edgeInfo.points[0], edgeInfo.points[1]];
        }
        // Correct the destination endpoint of the edge.
        /** @type {?} */
        var nextToLastPoint = edgeInfo.points[edgeInfo.points.length - 2];
        // The destination node might be null if this is a bridge edge.
        if (destNode != null) {
            edgeInfo.points[edgeInfo.points.length - 1] =
                intersectPointAndNode(nextToLastPoint, destNode);
        }
        // Correct the source endpoint of the edge.
        /** @type {?} */
        var secondPoint = edgeInfo.points[1];
        // The source might be null if this is a bridge edge.
        if (sourceNode != null) {
            edgeInfo.points[0] = intersectPointAndNode(secondPoint, sourceNode);
        }
        edgeInfo.points.forEach(function (point) {
            minX = point.x < minX ? point.x : minX;
            maxX = point.x > maxX ? point.x : maxX;
            minY = point.y < minY ? point.y : minY;
            maxY = point.y > maxY ? point.y : maxY;
        });
    });
    // Shift all nodes and edge points to account for the left-padding amount,
    // and the invisible bridge nodes.
    graph.nodes().forEach(function (nodeName) {
        /** @type {?} */
        var nodeInfo = graph.node(nodeName);
        nodeInfo.x -= minX;
        nodeInfo.y -= minY;
    });
    graph.edges().forEach(function (edgeObj) {
        graph.edge(edgeObj).points.forEach(function (point) {
            point.x -= minX;
            point.y -= minY;
        });
    });
    return {
        width: maxX - minX,
        height: maxY - minY
    };
}
/**
 * Returns if a line going through the specified points is a straight line.
 * @param {?} points
 * @return {?}
 */
function isStraightLine(points) {
    /** @type {?} */
    var angle = angleBetweenTwoPoints(points[0], points[1]);
    for (var i = 1; i < points.length - 1; i++) {
        /** @type {?} */
        var newAngle = angleBetweenTwoPoints(points[i], points[i + 1]);
        // Have a tolerance of 1 degree.
        if (Math.abs(newAngle - angle) > 1) {
            return false;
        }
        angle = newAngle;
    }
    return true;
}
/**
 * Returns the angle (in degrees) between two points.
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function angleBetweenTwoPoints(a, b) {
    /** @type {?} */
    var dx = b.x - a.x;
    /** @type {?} */
    var dy = b.y - a.y;
    return 180 * Math.atan(dy / dx) / Math.PI;
}
/**
 * Determines the center position of the node's shape. The position depends
 * on if the node has in and out-annotations.
 * @param {?} renderInfo
 * @return {?}
 */
export function computeCXPositionOfNodeShape(renderInfo) {
    if (renderInfo.expanded) {
        return renderInfo.x;
    }
    /** @type {?} */
    var dx = 0;
    return renderInfo.x - renderInfo.width / 2 + dx +
        renderInfo.coreBox.width / 2;
}
/**
 * Returns the intersection of a line between the provided point
 * and the provided rectangle.
 * @param {?} point
 * @param {?} node
 * @return {?}
 */
function intersectPointAndNode(point, node) {
    // cx and cy are the center of the rectangle.
    /** @type {?} */
    var cx = node.expanded ?
        node.x : computeCXPositionOfNodeShape(node);
    /** @type {?} */
    var cy = node.y;
    // Calculate the slope
    /** @type {?} */
    var dx = point.x - cx;
    /** @type {?} */
    var dy = point.y - cy;
    /** @type {?} */
    var w = node.expanded ? node.width : node.coreBox.width;
    /** @type {?} */
    var h = node.expanded ? node.height : node.coreBox.height;
    /** @type {?} */
    var deltaX;
    /** @type {?} */
    var deltaY;
    if (Math.abs(dy) * w / 2 > Math.abs(dx) * h / 2) {
        // The intersection is above or below the rectangle.
        if (dy < 0) {
            h = -h;
        }
        deltaX = dy === 0 ? 0 : h / 2 * dx / dy;
        deltaY = h / 2;
    }
    else {
        // The intersection is left or right of the rectangle.
        if (dx < 0) {
            w = -w;
        }
        deltaX = w / 2;
        deltaY = dx === 0 ? 0 : w / 2 * dy / dx;
    }
    return { x: cx + deltaX, y: cy + deltaY };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXpvcnJvL25nLXBsdXMvZ3JhcGgvIiwic291cmNlcyI6WyJjb3JlL2xheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEtBQUssQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDOztBQU12QyxNQUFNLEtBQU8sTUFBTSxHQUFHO0lBQ3BCLFNBQVMsRUFBSzs7OztRQUVaLFFBQVEsRUFBRSxHQUFHO0tBQ2Q7SUFDRCxLQUFLLEVBQVM7Ozs7UUFFWixJQUFJLEVBQUs7Ozs7Ozs7WUFPUCxPQUFPLEVBQUUsRUFBRTs7Ozs7OztZQU9YLE9BQU8sRUFBRSxFQUFFOzs7OztZQUtYLE9BQU8sRUFBRSxDQUFDO1NBQ1g7Ozs7UUFFRCxNQUFNLEVBQUc7Ozs7Ozs7WUFPUCxPQUFPLEVBQUUsQ0FBQzs7Ozs7OztZQU9WLE9BQU8sRUFBRSxFQUFFOzs7OztZQUtYLE9BQU8sRUFBRSxDQUFDO1NBQ1g7Ozs7OztRQU1ELE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRTtLQUM1QztJQUNELFFBQVEsRUFBTTtRQUNaLElBQUksRUFBSTtZQUNOLFVBQVUsRUFBTSxFQUFFO1lBQ2xCLGFBQWEsRUFBRyxFQUFFO1lBQ2xCLFdBQVcsRUFBSyxFQUFFO1lBQ2xCLFlBQVksRUFBSSxFQUFFOzs7OztZQUtsQixXQUFXLEVBQUssRUFBRTs7OztZQUVsQixjQUFjLEVBQUUsQ0FBQzs7OztZQUVqQixjQUFjLEVBQUUsQ0FBQztTQUNsQjtRQUNELE1BQU0sRUFBRTtZQUNOLFVBQVUsRUFBSyxFQUFFO1lBQ2pCLGFBQWEsRUFBRSxFQUFFO1lBQ2pCLFdBQVcsRUFBSSxFQUFFO1lBQ2pC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QUFDLENBQUM7S0FDaEI7U0FBTTtRQUNMLHNEQUFzRDtRQUN0RCxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDVixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDUjtRQUNELE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsTUFBTSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0tBQ3pDO0lBQ0QsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDNUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBUaGlzIHByb2R1Y3QgY29udGFpbnMgYSBtb2RpZmllZCB2ZXJzaW9uIG9mICdUZW5zb3JCb2FyZCBwbHVnaW4gZm9yIGdyYXBocycsXG4gKiBhIEFuZ3VsYXIgaW1wbGVtZW50YXRpb24gb2YgbmVzdC1ncmFwaCB2aXN1YWxpemF0aW9uXG4gKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIG5nLXpvcnJvLXBsdXMgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSAnTGljZW5zZScpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gJ0FTIElTJyBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuLy8gdHNsaW50OmRpc2FibGVcblxuaW1wb3J0IHsgc2NhbGVMaW5lYXIgfSBmcm9tICdkMy1zY2FsZSc7XG5pbXBvcnQgeyBsYXlvdXQgfSBmcm9tICdkYWdyZSc7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBOb2RlVHlwZSB9IGZyb20gJy4vaW50ZXJmYWNlJztcblxuLyoqIFNldCBvZiBwYXJhbWV0ZXJzIHRoYXQgZGVmaW5lIHRoZSBsb29rIGFuZCBmZWVsIG9mIHRoZSBncmFwaC4gKi9cbmltcG9ydCB7IFBvaW50LCBSZW5kZXJHcm91cE5vZGVJbmZvLCBSZW5kZXJNZXRhZWRnZUluZm8sIFJlbmRlck5vZGVJbmZvIH0gZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IHsgTnpHcmFwaENvbXBvbmVudCB9IGZyb20gJy4uL2dyYXBoL2dyYXBoLmNvbXBvbmVudCc7XG5cbmV4cG9ydCBjb25zdCBQQVJBTVMgPSB7XG4gIGFuaW1hdGlvbiAgIDoge1xuICAgIC8qKiBEZWZhdWx0IGR1cmF0aW9uIGZvciBncmFwaCBhbmltYXRpb25zIGluIG1zLiAqL1xuICAgIGR1cmF0aW9uOiAyNTBcbiAgfSxcbiAgZ3JhcGggICAgICAgOiB7XG4gICAgLyoqIEdyYXBoIHBhcmFtZXRlciBmb3IgbWV0YW5vZGUuICovXG4gICAgbWV0YSAgIDoge1xuICAgICAgLyoqXG4gICAgICAgKiBEYWdyZSdzIG5vZGVzZXAgcGFyYW0gLSBudW1iZXIgb2YgcGl4ZWxzIHRoYXRcbiAgICAgICAqIHNlcGFyYXRlIG5vZGVzIGhvcml6b250YWxseSBpbiB0aGUgbGF5b3V0LlxuICAgICAgICpcbiAgICAgICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY3BldHRpdHQvZGFncmUvd2lraSNjb25maWd1cmluZy10aGUtbGF5b3V0XG4gICAgICAgKi9cbiAgICAgIG5vZGVTZXA6IDUwLFxuICAgICAgLyoqXG4gICAgICAgKiBEYWdyZSdzIHJhbmtzZXAgcGFyYW0gLSBudW1iZXIgb2YgcGl4ZWxzXG4gICAgICAgKiBiZXR3ZWVuIGVhY2ggcmFuayBpbiB0aGUgbGF5b3V0LlxuICAgICAgICpcbiAgICAgICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY3BldHRpdHQvZGFncmUvd2lraSNjb25maWd1cmluZy10aGUtbGF5b3V0XG4gICAgICAgKi9cbiAgICAgIHJhbmtTZXA6IDQwLFxuICAgICAgLyoqXG4gICAgICAgKiBEYWdyZSdzIGVkZ2VzZXAgcGFyYW0gLSBudW1iZXIgb2YgcGl4ZWxzIHRoYXQgc2VwYXJhdGVcbiAgICAgICAqIGVkZ2VzIGhvcml6b250YWxseSBpbiB0aGUgbGF5b3V0LlxuICAgICAgICovXG4gICAgICBlZGdlU2VwOiA1XG4gICAgfSxcbiAgICAvKiogR3JhcGggcGFyYW1ldGVyIGZvciBtZXRhbm9kZS4gKi9cbiAgICBzZXJpZXMgOiB7XG4gICAgICAvKipcbiAgICAgICAqIERhZ3JlJ3Mgbm9kZXNlcCBwYXJhbSAtIG51bWJlciBvZiBwaXhlbHMgdGhhdFxuICAgICAgICogc2VwYXJhdGUgbm9kZXMgaG9yaXpvbnRhbGx5IGluIHRoZSBsYXlvdXQuXG4gICAgICAgKlxuICAgICAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jcGV0dGl0dC9kYWdyZS93aWtpI2NvbmZpZ3VyaW5nLXRoZS1sYXlvdXRcbiAgICAgICAqL1xuICAgICAgbm9kZVNlcDogNSxcbiAgICAgIC8qKlxuICAgICAgICogRGFncmUncyByYW5rc2VwIHBhcmFtIC0gbnVtYmVyIG9mIHBpeGVsc1xuICAgICAgICogYmV0d2VlbiBlYWNoIHJhbmsgaW4gdGhlIGxheW91dC5cbiAgICAgICAqXG4gICAgICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2NwZXR0aXR0L2RhZ3JlL3dpa2kjY29uZmlndXJpbmctdGhlLWxheW91dFxuICAgICAgICovXG4gICAgICByYW5rU2VwOiAyNSxcbiAgICAgIC8qKlxuICAgICAgICogRGFncmUncyBlZGdlc2VwIHBhcmFtIC0gbnVtYmVyIG9mIHBpeGVscyB0aGF0IHNlcGFyYXRlXG4gICAgICAgKiBlZGdlcyBob3Jpem9udGFsbHkgaW4gdGhlIGxheW91dC5cbiAgICAgICAqL1xuICAgICAgZWRnZVNlcDogNVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUGFkZGluZyBpcyB1c2VkIHRvIGNvcnJlY3RseSBwb3NpdGlvbiB0aGUgZ3JhcGggU1ZHIGluc2lkZSBvZiBpdHMgcGFyZW50XG4gICAgICogZWxlbWVudC4gVGhlIHBhZGRpbmcgYW1vdW50cyBhcmUgYXBwbGllZCB1c2luZyBhbiBTVkcgdHJhbnNmb3JtIG9mIFggYW5kXG4gICAgICogWSBjb29yZGluYXRlcy5cbiAgICAgKi9cbiAgICBwYWRkaW5nOiB7IHBhZGRpbmdUb3A6IDEwLCBwYWRkaW5nTGVmdDogMCB9XG4gIH0sXG4gIHN1YnNjZW5lICAgIDoge1xuICAgIG1ldGEgIDoge1xuICAgICAgcGFkZGluZ1RvcCAgICA6IDIwLFxuICAgICAgcGFkZGluZ0JvdHRvbSA6IDIwLFxuICAgICAgcGFkZGluZ0xlZnQgICA6IDIwLFxuICAgICAgcGFkZGluZ1JpZ2h0ICA6IDIwLFxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGxlYXZlIHJvb20gZm9yIHRoZSBsYWJlbCBvbiB0b3Agb2YgdGhlIGhpZ2hlc3Qgbm9kZSBpblxuICAgICAgICogdGhlIGdyb3VwQ29yZSBncmFwaC5cbiAgICAgICAqL1xuICAgICAgbGFiZWxIZWlnaHQgICA6IDIwLFxuICAgICAgLyoqIFgtc3BhY2UgYmV0d2VlbiBlYWNoIGV4dHJhY3RlZCBub2RlIGFuZCB0aGUgZ3JvdXBDb3JlIGdyYXBoLiAqL1xuICAgICAgZXh0cmFjdFhPZmZzZXQ6IDAsXG4gICAgICAvKiogWS1zcGFjZSBiZXR3ZWVuIGVhY2ggZXh0cmFjdGVkIG5vZGUuICovXG4gICAgICBleHRyYWN0WU9mZnNldDogMFxuICAgIH0sXG4gICAgc2VyaWVzOiB7XG4gICAgICBwYWRkaW5nVG9wICAgOiAxMCxcbiAgICAgIHBhZGRpbmdCb3R0b206IDEwLFxuICAgICAgcGFkZGluZ0xlZnQgIDogMTAsXG4gICAgICBwYWRkaW5nUmlnaHQgOiAxMCxcbiAgICAgIGxhYmVsSGVpZ2h0ICA6IDEwXG4gICAgfVxuICB9LFxuICBub2RlU2l6ZSAgICA6IHtcbiAgICAvKiogU2l6ZSBvZiBtZXRhIG5vZGVzLiAqL1xuICAgIG1ldGEgIDoge1xuICAgICAgcmFkaXVzICAgICAgICAgICAgOiAyLFxuICAgICAgd2lkdGggICAgICAgICAgICAgOiAyMzAsXG4gICAgICBtYXhMYWJlbFdpZHRoICAgICA6IDAsXG4gICAgICAvKiogQSBzY2FsZSBmb3IgdGhlIG5vZGUncyBoZWlnaHQgYmFzZWQgb24gbnVtYmVyIG9mIG5vZGVzIGluc2lkZSAqL1xuICAgICAgLy8gSGFjayAtIHNldCB0aGlzIGFzIGFuIGFueSB0eXBlIHRvIGF2b2lkIGlzc3VlcyBpbiBleHBvcnRpbmcgYSB0eXBlXG4gICAgICAvLyBmcm9tIGFuIGV4dGVybmFsIG1vZHVsZS5cbiAgICAgIGhlaWdodCAgICAgICAgICAgIDogMTY1LFxuICAgICAgLyoqIFRoZSByYWRpdXMgb2YgdGhlIGNpcmNsZSBkZW5vdGluZyB0aGUgZXhwYW5kIGJ1dHRvbi4gKi9cbiAgICAgIGV4cGFuZEJ1dHRvblJhZGl1czogM1xuICAgIH0sXG4gICAgLyoqIFNpemUgb2Ygb3Agbm9kZXMuICovXG4gICAgb3AgICAgOiB7XG4gICAgICB3aWR0aCAgICAgICAgOiAyMzAsXG4gICAgICBoZWlnaHQgICAgICAgOiAxNjAsXG4gICAgICByYWRpdXMgICAgICAgOiAxLCAgLy8gZm9yIG1ha2luZyBhbm5vdGF0aW9uIHRvdWNoaW5nIGVsbGlwc2VcbiAgICAgIGxhYmVsT2Zmc2V0ICA6IDEwLFxuICAgICAgbWF4TGFiZWxXaWR0aDogNDBcbiAgICB9LFxuICAgIC8qKiBTaXplIG9mIHNlcmllcyBub2Rlcy4gKi9cbiAgICBzZXJpZXM6IHtcbiAgICAgIGV4cGFuZGVkICA6IHtcbiAgICAgICAgLy8gRm9yIGV4cGFuZGVkIHNlcmllcyBub2Rlcywgd2lkdGggYW5kIGhlaWdodCB3aWxsIGJlXG4gICAgICAgIC8vIGNvbXB1dGVkIHRvIGFjY291bnQgZm9yIHRoZSBzdWJzY2VuZS5cbiAgICAgICAgcmFkaXVzICAgICA6IDEwLFxuICAgICAgICBsYWJlbE9mZnNldDogMFxuICAgICAgfSxcbiAgICAgIHZlcnRpY2FsICA6IHtcbiAgICAgICAgLy8gV2hlbiB1bmV4cGFuZGVkLCBzZXJpZXMgd2hvc2UgdW5kZXJseWluZyBtZXRhZ3JhcGhzIGNvbnRhaW5cbiAgICAgICAgLy8gb25lIG9yIG1vcmUgbm9uLWNvbnRyb2wgZWRnZXMgd2lsbCBzaG93IGFzIGEgdmVydGljYWwgc3RhY2tcbiAgICAgICAgLy8gb2YgZWxsaXBzZXMuXG4gICAgICAgIHdpZHRoICAgICAgOiAxNixcbiAgICAgICAgaGVpZ2h0ICAgICA6IDEzLFxuICAgICAgICBsYWJlbE9mZnNldDogLTEzXG4gICAgICB9LFxuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICAvLyBXaGVuIHVuZXhwYW5kZWQsIHNlcmllcyB3aG9zZSB1bmRlcmx5aW5nIG1ldGFncmFwaHMgY29udGFpblxuICAgICAgICAvLyBubyBub24tY29udHJvbCBlZGdlcyB3aWxsIHNob3cgYXMgYSBob3Jpem9udGFsIHN0YWNrIG9mXG4gICAgICAgIC8vIGVsbGlwc2VzLlxuICAgICAgICB3aWR0aCAgICAgIDogMjQsXG4gICAgICAgIGhlaWdodCAgICAgOiA4LFxuICAgICAgICByYWRpdXMgICAgIDogMTAsICAvLyBGb3JjZXMgYW5ub3RhdGlvbnMgdG8gY2VudGVyIGxpbmUuXG4gICAgICAgIGxhYmVsT2Zmc2V0OiAtMTBcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKiBTaXplIG9mIGJyaWRnZSBub2Rlcy4gKi9cbiAgICBicmlkZ2U6IHtcbiAgICAgIC8vIE5PVEU6IGJyaWRnZSBub2RlcyB3aWxsIG5vcm1hbGx5IGJlIGludmlzaWJsZSwgYnV0IHRoZXkgbXVzdFxuICAgICAgLy8gdGFrZSB1cCBzb21lIHNwYWNlIHNvIHRoYXQgdGhlIGxheW91dCBzdGVwIGxlYXZlcyByb29tIGZvclxuICAgICAgLy8gdGhlaXIgZWRnZXMuXG4gICAgICB3aWR0aCAgICAgIDogMjAsXG4gICAgICBoZWlnaHQgICAgIDogMjAsXG4gICAgICByYWRpdXMgICAgIDogMixcbiAgICAgIGxhYmVsT2Zmc2V0OiAwXG4gICAgfVxuICB9LFxuICBzaG9ydGN1dFNpemU6IHtcbiAgICAvKiogU2l6ZSBvZiBzaG9ydGN1dHMgZm9yIG9wIG5vZGVzICovXG4gICAgb3AgICAgOiB7IHdpZHRoOiAxMCwgaGVpZ2h0OiA0IH0sXG4gICAgLyoqIFNpemUgb2Ygc2hvcnRjdXRzIGZvciBtZXRhIG5vZGVzICovXG4gICAgbWV0YSAgOiB7IHdpZHRoOiAxMiwgaGVpZ2h0OiA0LCByYWRpdXM6IDEgfSxcbiAgICAvKiogU2l6ZSBvZiBzaG9ydGN1dHMgZm9yIHNlcmllcyBub2RlcyAqL1xuICAgIHNlcmllczoge1xuICAgICAgd2lkdGggOiAxNCxcbiAgICAgIGhlaWdodDogNFxuICAgIH1cbiAgfSxcbiAgYW5ub3RhdGlvbnMgOiB7XG4gICAgLyoqIE1heGltdW0gcG9zc2libGUgd2lkdGggb2YgdGhlIGJvdW5kaW5nIGJveCBmb3IgaW4gYW5ub3RhdGlvbnMgKi9cbiAgICBpbmJveFdpZHRoICAgOiA1MCxcbiAgICAvKiogTWF4aW11bSBwb3NzaWJsZSB3aWR0aCBvZiB0aGUgYm91bmRpbmcgYm94IGZvciBvdXQgYW5ub3RhdGlvbnMgKi9cbiAgICBvdXRib3hXaWR0aCAgOiA1MCxcbiAgICAvKiogWC1zcGFjZSBiZXR3ZWVuIHRoZSBzaGFwZSBhbmQgZWFjaCBhbm5vdGF0aW9uLW5vZGUuICovXG4gICAgeE9mZnNldCAgICAgIDogMTAsXG4gICAgLyoqIFktc3BhY2UgYmV0d2VlbiBlYWNoIGFubm90YXRpb24tbm9kZS4gKi9cbiAgICB5T2Zmc2V0ICAgICAgOiAzLFxuICAgIC8qKiBYLXNwYWNlIGJldHdlZW4gZWFjaCBhbm5vdGF0aW9uLW5vZGUgYW5kIGl0cyBsYWJlbC4gKi9cbiAgICBsYWJlbE9mZnNldCAgOiAyLFxuICAgIC8qKiBEZWZpbmVzIHRoZSBtYXggd2lkdGggZm9yIGFubm90YXRpb24gbGFiZWwgKi9cbiAgICBtYXhMYWJlbFdpZHRoOiAxMjBcbiAgfSxcbiAgY29uc3RhbnQgICAgOiB7IHNpemU6IHsgd2lkdGg6IDQsIGhlaWdodDogNCB9IH0sXG4gIHNlcmllcyAgICAgIDoge1xuICAgIC8qKiBNYXhpbXVtIG51bWJlciBvZiByZXBlYXRlZCBpdGVtIGZvciB1bmV4cGFuZGVkIHNlcmllcyBub2RlLiAqL1xuICAgIG1heFN0YWNrQ291bnQgICAgICAgICAgIDogMyxcbiAgICAvKipcbiAgICAgKiBQb3NpdGlvbmluZyBvZmZzZXQgcmF0aW8gZm9yIGNvbGxhcHNlZCBzdGFja1xuICAgICAqIG9mIHBhcmFsbGVsIHNlcmllcyAoc2VyaWVzIHdpdGhvdXQgZWRnZXMgYmV0d2VlbiBpdHMgbWVtYmVycykuXG4gICAgICovXG4gICAgcGFyYWxsZWxTdGFja09mZnNldFJhdGlvOiAwLjIsXG4gICAgLyoqXG4gICAgICogUG9zaXRpb25pbmcgb2Zmc2V0IHJhdGlvIGZvciBjb2xsYXBzZWQgc3RhY2tcbiAgICAgKiBvZiB0b3dlciBzZXJpZXMgKHNlcmllcyB3aXRoIGVkZ2VzIGJldHdlZW4gaXRzIG1lbWJlcnMpLlxuICAgICAqL1xuICAgIHRvd2VyU3RhY2tPZmZzZXRSYXRpbyAgIDogMC41XG4gIH0sXG4gIG1pbmltYXAgICAgIDoge1xuICAgIC8qKiBUaGUgbWF4aW11bSB3aWR0aC9oZWlnaHQgdGhlIG1pbmltYXAgY2FuIGhhdmUuICovXG4gICAgc2l6ZTogMTUwXG4gIH1cbn07XG5cbi8qKlxuICogVGhlIG1pbmltdW0gd2lkdGggd2UgY29uZmVyIHVwb24gdGhlIGF1eGlsaWFyeSBub2RlcyBzZWN0aW9uIGlmIGZ1bmN0aW9uc1xuICogYWxzbyBhcHBlYXIuIFdpdGhvdXQgZW5mb3JjaW5nIHRoaXMgbWluaW11bSwgbWV0YW5vZGVzIGluIHRoZSBmdW5jdGlvblxuICogbGlicmFyeSBzZWN0aW9uIGNvdWxkIGp1dCBpbnRvIHRoZSBhdXhpbGlhcnkgbm9kZXMgc2VjdGlvbiBiZWNhdXNlIHRoZVxuICogdGl0bGUgXCJBdXhpbGlhcnkgTm9kZXNcIiBpcyBsb25nZXIgdGhhbiB0aGUgd2lkdGggb2YgdGhlIGF1eGlsaWFyeSBub2Rlc1xuICogc2VjdGlvbiBpdHNlbGYuXG4gKi9cbmV4cG9ydCBjb25zdCBNSU5fQVVYX1dJRFRIID0gMDtcblxuLyoqIENhbGN1bGF0ZSBsYXlvdXQgZm9yIGEgc2NlbmUgb2YgYSBncm91cCBub2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheW91dFNjZW5lKHJlbmRlck5vZGVJbmZvOiBSZW5kZXJHcm91cE5vZGVJbmZvLCBncmFwaENvbXBvbmVudDogTnpHcmFwaENvbXBvbmVudCk6IHZvaWQge1xuICAvLyBVcGRhdGUgbGF5b3V0LCBzaXplLCBhbmQgYW5ub3RhdGlvbnMgb2YgaXRzIGNoaWxkcmVuIG5vZGVzIGFuZCBlZGdlcy5cbiAgaWYgKHJlbmRlck5vZGVJbmZvLm5vZGUuaXNHcm91cE5vZGUpIHtcbiAgICBsYXlvdXRDaGlsZHJlbihyZW5kZXJOb2RlSW5mbywgZ3JhcGhDb21wb25lbnQpO1xuICB9XG5cbiAgLy8gVXBkYXRlIHBvc2l0aW9uIG9mIGl0cyBjaGlsZHJlbiBub2RlcyBhbmQgZWRnZXNcbiAgaWYgKHJlbmRlck5vZGVJbmZvLm5vZGUudHlwZSA9PT0gTm9kZVR5cGUuTUVUQSkge1xuICAgIGxheW91dE1ldGFub2RlKHJlbmRlck5vZGVJbmZvLCBncmFwaENvbXBvbmVudCk7XG4gIH0gZWxzZSBpZiAocmVuZGVyTm9kZUluZm8ubm9kZS50eXBlID09PSBOb2RlVHlwZS5TRVJJRVMpIHtcbiAgICBsYXlvdXRTZXJpZXNOb2RlKHJlbmRlck5vZGVJbmZvLCBncmFwaENvbXBvbmVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiDmm7TmlrDlhbblrZDoioLngrnkuI4gZWRnZXMg55qE5biD5bGA5ZKM5aSn5bCPXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXlvdXRDaGlsZHJlbihyZW5kZXJOb2RlSW5mbzogUmVuZGVyR3JvdXBOb2RlSW5mbywgZ3JhcGhDb21wb25lbnQ6IE56R3JhcGhDb21wb25lbnQpOiB2b2lkIHtcblxuICBjb25zdCBjaGlsZHJlbiA9IHJlbmRlck5vZGVJbmZvLmNvcmVHcmFwaC5ub2RlcygpLm1hcChuID0+IHtcbiAgICByZXR1cm4gcmVuZGVyTm9kZUluZm8uY29yZUdyYXBoLm5vZGUobik7XG4gIH0pLmNvbmNhdChyZW5kZXJOb2RlSW5mby5pc29sYXRlZEluRXh0cmFjdCxcbiAgICByZW5kZXJOb2RlSW5mby5pc29sYXRlZE91dEV4dHJhY3QpO1xuXG4gIGNoaWxkcmVuLmZvckVhY2goY2hpbGROb2RlSW5mbyA9PiB7XG4gICAgLy8gU2V0IHNpemUgb2YgZWFjaCBjaGlsZFxuICAgIHN3aXRjaCAoY2hpbGROb2RlSW5mby5ub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgTm9kZVR5cGUuT1A6XG4gICAgICAgIE9iamVjdC5hc3NpZ24oY2hpbGROb2RlSW5mbywgUEFSQU1TLm5vZGVTaXplLm9wKTtcbiAgICAgICAgaWYgKGdyYXBoQ29tcG9uZW50Lm9wTm9kZUhlaWdodEZ1bmN0aW9uKSB7XG4gICAgICAgICAgY2hpbGROb2RlSW5mby5oZWlnaHQgPSBncmFwaENvbXBvbmVudC5vcE5vZGVIZWlnaHRGdW5jdGlvbihjaGlsZE5vZGVJbmZvKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoaWxkTm9kZUluZm8uaGVpZ2h0ID0gUEFSQU1TLm5vZGVTaXplLm9wLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChncmFwaENvbXBvbmVudC5vcE5vZGVXaWR0aEZ1bmN0aW9uKSB7XG4gICAgICAgICAgY2hpbGROb2RlSW5mby5oZWlnaHQgPSBncmFwaENvbXBvbmVudC5vcE5vZGVXaWR0aEZ1bmN0aW9uKGNoaWxkTm9kZUluZm8pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGROb2RlSW5mby53aWR0aCA9IFBBUkFNUy5ub2RlU2l6ZS5vcC53aWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBOb2RlVHlwZS5CUklER0U6XG4gICAgICAgIE9iamVjdC5hc3NpZ24oY2hpbGROb2RlSW5mbywgUEFSQU1TLm5vZGVTaXplLmJyaWRnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBOb2RlVHlwZS5NRVRBOlxuICAgICAgICBpZiAoIWNoaWxkTm9kZUluZm8uZXhwYW5kZWQpIHtcbiAgICAgICAgICAvLyBTZXQgZml4ZWQgd2lkdGggYW5kIHNjYWxhYmxlIGhlaWdodCBiYXNlZCBvbiBjYXJkaW5hbGl0eVxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oY2hpbGROb2RlSW5mbywgUEFSQU1TLm5vZGVTaXplLm1ldGEpO1xuXG4gICAgICAgICAgaWYgKGdyYXBoQ29tcG9uZW50Lmdyb3VwTm9kZUhlaWdodEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVJbmZvLmhlaWdodCA9IGdyYXBoQ29tcG9uZW50Lmdyb3VwTm9kZUhlaWdodEZ1bmN0aW9uKGNoaWxkTm9kZUluZm8pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZUluZm8uaGVpZ2h0ID0gUEFSQU1TLm5vZGVTaXplLm1ldGEuaGVpZ2h0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChncmFwaENvbXBvbmVudC5ncm91cE5vZGVXaWR0aEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBjaGlsZE5vZGVJbmZvLmhlaWdodCA9IGdyYXBoQ29tcG9uZW50Lmdyb3VwTm9kZVdpZHRoRnVuY3Rpb24oY2hpbGROb2RlSW5mbylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hpbGROb2RlSW5mby53aWR0aCA9IFBBUkFNUy5ub2RlU2l6ZS5tZXRhLndpZHRoO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGNoaWxkR3JvdXBOb2RlSW5mbyA9XG4gICAgICAgICAgICAgICAgICA8UmVuZGVyR3JvdXBOb2RlSW5mbz5jaGlsZE5vZGVJbmZvO1xuICAgICAgICAgIGxheW91dFNjZW5lKGNoaWxkR3JvdXBOb2RlSW5mbywgZ3JhcGhDb21wb25lbnQpOyAvLyBSZWN1cnNpdmVseSBsYXlvdXQgaXRzIHN1YnNjZW5lLlxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBOb2RlVHlwZS5TRVJJRVM6XG4gICAgICAgIGlmIChjaGlsZE5vZGVJbmZvLmV4cGFuZGVkKSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihjaGlsZE5vZGVJbmZvLCBQQVJBTVMubm9kZVNpemUuc2VyaWVzLmV4cGFuZGVkKTtcbiAgICAgICAgICBjb25zdCBjaGlsZEdyb3VwTm9kZUluZm8gPVxuICAgICAgICAgICAgICAgICAgPFJlbmRlckdyb3VwTm9kZUluZm8+Y2hpbGROb2RlSW5mbztcbiAgICAgICAgICBsYXlvdXRTY2VuZShjaGlsZEdyb3VwTm9kZUluZm8sIGdyYXBoQ29tcG9uZW50KTsgLy8gUmVjdXJzaXZlbHkgbGF5b3V0IGl0cyBzdWJzY2VuZS5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBjaGlsZEdyb3VwTm9kZUluZm8gPVxuICAgICAgICAgICAgICAgICAgPFJlbmRlckdyb3VwTm9kZUluZm8+Y2hpbGROb2RlSW5mbztcbiAgICAgICAgICBjb25zdCBzZXJpZXNQYXJhbXMgPVxuICAgICAgICAgICAgICAgICAgY2hpbGRHcm91cE5vZGVJbmZvLm5vZGUuaGFzTm9uQ29udHJvbEVkZ2VzID9cbiAgICAgICAgICAgICAgICAgICAgUEFSQU1TLm5vZGVTaXplLnNlcmllcy52ZXJ0aWNhbCA6XG4gICAgICAgICAgICAgICAgICAgIFBBUkFNUy5ub2RlU2l6ZS5zZXJpZXMuaG9yaXpvbnRhbDtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGNoaWxkTm9kZUluZm8sIHNlcmllc1BhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcignVW5yZWNvZ25pemVkIG5vZGUgdHlwZTogJyArIGNoaWxkTm9kZUluZm8ubm9kZS50eXBlKTtcbiAgICB9XG4gICAgLy8gQ29tcHV0ZSB0b3RhbCB3aWR0aCBvZiB1bi1leHBhbmRlZCBub2Rlcy4gV2lkdGggb2YgZXhwYW5kZWQgbm9kZXNcbiAgICAvLyBoYXMgYWxyZWFkeSBiZWVuIGNvbXB1dGVkLlxuICAgIGlmICghY2hpbGROb2RlSW5mby5leHBhbmRlZCkge1xuICAgICAgdXBkYXRlVG90YWxXaWR0aE9mTm9kZShjaGlsZE5vZGVJbmZvKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF5b3V0TWV0YW5vZGUocmVuZGVyTm9kZUluZm86IFJlbmRlckdyb3VwTm9kZUluZm8sIGdyYXBoQ29tcG9uZW50OiBOekdyYXBoQ29tcG9uZW50KTogdm9pZCB7XG4gIC8vIEZpcnN0LCBjb3B5IHBhcmFtcyBzcGVjaWZpYyB0byBtZXRhIG5vZGVzIG9udG8gdGhpcyByZW5kZXIgaW5mbyBvYmplY3QuXG4gIGNvbnN0IHBhcmFtcyA9IFBBUkFNUy5zdWJzY2VuZS5tZXRhO1xuICBPYmplY3QuYXNzaWduKHJlbmRlck5vZGVJbmZvLCBwYXJhbXMpO1xuICAvLyBJbnZva2UgZGFncmUubGF5b3V0KCkgb24gdGhlIGdyb3VwQ29yZSBncmFwaCBhbmQgcmVjb3JkIHRoZSBib3VuZGluZyBib3hcbiAgLy8gZGltZW5zaW9ucy5cbiAgT2JqZWN0LmFzc2lnbihyZW5kZXJOb2RlSW5mby5jb3JlQm94LFxuICAgIGRhZ3JlTGF5b3V0KHJlbmRlck5vZGVJbmZvLmNvcmVHcmFwaCwgUEFSQU1TLmdyYXBoLm1ldGEsIGdyYXBoQ29tcG9uZW50KSk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBvZiBub2RlcyBpbiBpc29sYXRlZEluRXh0cmFjdCByZWxhdGl2ZSB0byB0aGVcbiAgLy8gdG9wLWxlZnQgY29ybmVyIG9mIGluRXh0cmFjdEJveCAodGhlIGJvdW5kaW5nIGJveCBmb3IgYWxsIGluRXh0cmFjdCBub2RlcylcbiAgLy8gYW5kIGNhbGN1bGF0ZSB0aGUgc2l6ZSBvZiB0aGUgaW5FeHRyYWN0Qm94LlxuICBjb25zdCBtYXhJbkV4dHJhY3RXaWR0aCA9IHJlbmRlck5vZGVJbmZvLmlzb2xhdGVkSW5FeHRyYWN0Lmxlbmd0aCA/XG4gICAgXy5tYXhCeShcbiAgICAgIHJlbmRlck5vZGVJbmZvLmlzb2xhdGVkSW5FeHRyYWN0LFxuICAgICAgcmVuZGVyTm9kZSA9PiByZW5kZXJOb2RlLndpZHRoXG4gICAgKS53aWR0aCA6IG51bGw7XG4gIHJlbmRlck5vZGVJbmZvLmluRXh0cmFjdEJveC53aWR0aCA9IG1heEluRXh0cmFjdFdpZHRoICE9IG51bGwgP1xuICAgIG1heEluRXh0cmFjdFdpZHRoIDogMDtcblxuICByZW5kZXJOb2RlSW5mby5pbkV4dHJhY3RCb3guaGVpZ2h0ID1cbiAgICBfLnJlZHVjZShyZW5kZXJOb2RlSW5mby5pc29sYXRlZEluRXh0cmFjdCwgKGhlaWdodCwgY2hpbGQsIGkpID0+IHtcbiAgICAgIGNvbnN0IHlPZmZzZXQgPSBpID4gMCA/IHBhcmFtcy5leHRyYWN0WU9mZnNldCA6IDA7XG4gICAgICAvLyB1c2Ugd2lkdGgvaGVpZ2h0IGhlcmUgdG8gYXZvaWQgb3ZlcmxhcHMgYmV0d2VlbiBleHRyYWN0c1xuICAgICAgY2hpbGQueCA9IDA7XG4gICAgICBjaGlsZC55ID0gaGVpZ2h0ICsgeU9mZnNldCArIGNoaWxkLmhlaWdodCAvIDI7XG4gICAgICByZXR1cm4gaGVpZ2h0ICsgeU9mZnNldCArIGNoaWxkLmhlaWdodDtcbiAgICB9LCAwKTtcblxuICAvLyBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIG9mIG5vZGVzIGluIGlzb2xhdGVkT3V0RXh0cmFjdCByZWxhdGl2ZSB0byB0aGVcbiAgLy8gdG9wLWxlZnQgY29ybmVyIG9mIG91dEV4dHJhY3RCb3ggKHRoZSBib3VuZGluZyBib3ggZm9yIGFsbCBvdXRFeHRyYWN0XG4gIC8vIG5vZGVzKSBhbmQgY2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBvdXRFeHRyYWN0Qm94LlxuICBjb25zdCBtYXhPdXRFeHRyYWN0V2lkdGggPSByZW5kZXJOb2RlSW5mby5pc29sYXRlZE91dEV4dHJhY3QubGVuZ3RoID9cbiAgICBfLm1heEJ5KFxuICAgICAgcmVuZGVyTm9kZUluZm8uaXNvbGF0ZWRPdXRFeHRyYWN0LFxuICAgICAgcmVuZGVyTm9kZSA9PiByZW5kZXJOb2RlLndpZHRoXG4gICAgKS53aWR0aCA6IG51bGw7XG4gIHJlbmRlck5vZGVJbmZvLm91dEV4dHJhY3RCb3gud2lkdGggPSBtYXhPdXRFeHRyYWN0V2lkdGggIT0gbnVsbCA/XG4gICAgbWF4T3V0RXh0cmFjdFdpZHRoIDogMDtcblxuICByZW5kZXJOb2RlSW5mby5vdXRFeHRyYWN0Qm94LmhlaWdodCA9XG4gICAgXy5yZWR1Y2UocmVuZGVyTm9kZUluZm8uaXNvbGF0ZWRPdXRFeHRyYWN0LCAoaGVpZ2h0LCBjaGlsZCwgaSkgPT4ge1xuICAgICAgY29uc3QgeU9mZnNldCA9IGkgPiAwID8gcGFyYW1zLmV4dHJhY3RZT2Zmc2V0IDogMDtcbiAgICAgIC8vIHVzZSB3aWR0aC9oZWlnaHQgaGVyZSB0byBhdm9pZCBvdmVybGFwcyBiZXR3ZWVuIGV4dHJhY3RzXG4gICAgICBjaGlsZC54ID0gMDtcbiAgICAgIGNoaWxkLnkgPSBoZWlnaHQgKyB5T2Zmc2V0ICsgY2hpbGQuaGVpZ2h0IC8gMjtcbiAgICAgIHJldHVybiBoZWlnaHQgKyB5T2Zmc2V0ICsgY2hpbGQuaGVpZ2h0O1xuICAgIH0sIDApO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2Ygbm9kZXMgaW4gbGlicmFyeUZ1bmN0aW9uc0V4dHJhY3QgcmVsYXRpdmUgdG8gdGhlXG4gIC8vIHRvcC1sZWZ0IGNvcm5lciBvZiBsaWJyYXJ5RnVuY3Rpb25zQm94ICh0aGUgYm91bmRpbmcgYm94IGZvciBhbGwgbGlicmFyeVxuICAvLyBmdW5jdGlvbiBub2RlcykgYW5kIGNhbGN1bGF0ZSB0aGUgc2l6ZSBvZiB0aGUgbGlicmFyeUZ1bmN0aW9uc0JveC5cblxuXG4gIC8vIENvbXB1dGUgdGhlIHRvdGFsIHBhZGRpbmcgYmV0d2VlbiB0aGUgZ3JvdXBDb3JlIGdyYXBoLCBpbi1leHRyYWN0IGFuZFxuICAvLyBvdXQtZXh0cmFjdCBib3hlcy5cbiAgbGV0IG51bVBhcnRzID0gMDtcbiAgaWYgKHJlbmRlck5vZGVJbmZvLmlzb2xhdGVkSW5FeHRyYWN0Lmxlbmd0aCA+IDApIHtcbiAgICBudW1QYXJ0cysrO1xuICB9XG4gIGlmIChyZW5kZXJOb2RlSW5mby5pc29sYXRlZE91dEV4dHJhY3QubGVuZ3RoID4gMCkge1xuICAgIG51bVBhcnRzKys7XG4gIH1cblxuICBpZiAocmVuZGVyTm9kZUluZm8uY29yZUdyYXBoLm5vZGVDb3VudCgpID4gMCkge1xuICAgIG51bVBhcnRzKys7XG4gIH1cbiAgY29uc3Qgb2Zmc2V0ID0gUEFSQU1TLnN1YnNjZW5lLm1ldGEuZXh0cmFjdFhPZmZzZXQ7XG4gIGNvbnN0IHBhZGRpbmcgPSBudW1QYXJ0cyA8PSAxID8gMCA6IChudW1QYXJ0cyAqIG9mZnNldCk7XG5cbiAgLy8gQWRkIHRoZSBpbi1leHRyYWN0IGFuZCBvdXQtZXh0cmFjdCB3aWR0aCB0byB0aGUgZ3JvdXBDb3JlIGJveCB3aWR0aC4gRG8gbm90IGxldFxuICAvLyB0aGUgYXV4aWxpYXJ5IHdpZHRoIGJlIHRvbyBzbWFsbCwgbGVzdCBpdCBiZSBzbWFsbGVyIHRoYW4gdGhlIHRpdGxlLlxuICBjb25zdCBhdXhXaWR0aCA9IE1hdGgubWF4KFxuICAgIE1JTl9BVVhfV0lEVEgsXG4gICAgcmVuZGVyTm9kZUluZm8uaW5FeHRyYWN0Qm94LndpZHRoICsgcmVuZGVyTm9kZUluZm8ub3V0RXh0cmFjdEJveC53aWR0aCk7XG5cbiAgcmVuZGVyTm9kZUluZm8uY29yZUJveC53aWR0aCArPSBhdXhXaWR0aCArIHBhZGRpbmcgKyBwYWRkaW5nO1xuICByZW5kZXJOb2RlSW5mby5jb3JlQm94LmhlaWdodCA9XG4gICAgcGFyYW1zLmxhYmVsSGVpZ2h0ICtcbiAgICBNYXRoLm1heChcbiAgICAgIHJlbmRlck5vZGVJbmZvLmluRXh0cmFjdEJveC5oZWlnaHQsXG4gICAgICByZW5kZXJOb2RlSW5mby5jb3JlQm94LmhlaWdodCxcbiAgICAgIHJlbmRlck5vZGVJbmZvLm91dEV4dHJhY3RCb3guaGVpZ2h0XG4gICAgKTtcbiAgLy8gRGV0ZXJtaW5lIHRoZSB3aG9sZSBtZXRhbm9kZSdzIHdpZHRoIChmcm9tIGxlZnQgdG8gcmlnaHQpLlxuXG4gIHJlbmRlck5vZGVJbmZvLndpZHRoID0gcmVuZGVyTm9kZUluZm8uY29yZUJveC53aWR0aCArXG4gICAgcGFyYW1zLnBhZGRpbmdMZWZ0ICsgcGFyYW1zLnBhZGRpbmdSaWdodDtcblxuICAvLyBEZXRlcm1pbmUgdGhlIHdob2xlIG1ldGFub2RlJ3MgaGVpZ2h0IChmcm9tIHRvcCB0byBib3R0b20pLlxuICByZW5kZXJOb2RlSW5mby5oZWlnaHQgPVxuICAgIHJlbmRlck5vZGVJbmZvLnBhZGRpbmdUb3AgK1xuICAgIHJlbmRlck5vZGVJbmZvLmNvcmVCb3guaGVpZ2h0ICtcbiAgICByZW5kZXJOb2RlSW5mby5wYWRkaW5nQm90dG9tO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF5b3V0U2VyaWVzTm9kZShub2RlOiBSZW5kZXJHcm91cE5vZGVJbmZvLCBncmFwaENvbXBvbmVudDogTnpHcmFwaENvbXBvbmVudCk6IHZvaWQge1xuICBjb25zdCBncmFwaCA9IG5vZGUuY29yZUdyYXBoO1xuXG4gIGNvbnN0IHBhcmFtcyA9IFBBUkFNUy5zdWJzY2VuZS5zZXJpZXM7XG4gIE9iamVjdC5hc3NpZ24obm9kZSwgcGFyYW1zKTtcblxuICAvLyBMYXlvdXQgdGhlIGdyb3VwQ29yZS5cbiAgT2JqZWN0LmFzc2lnbihub2RlLmNvcmVCb3gsIGRhZ3JlTGF5b3V0KG5vZGUuY29yZUdyYXBoLCBQQVJBTVMuZ3JhcGguc2VyaWVzLCBncmFwaENvbXBvbmVudCkpO1xuXG4gIGdyYXBoLm5vZGVzKCkuZm9yRWFjaChub2RlTmFtZSA9PiB7XG4gICAgZ3JhcGgubm9kZShub2RlTmFtZSkuZXhjbHVkZWQgPSBmYWxzZTtcbiAgfSk7XG5cbiAgLy8gU2VyaWVzIGRvIG5vdCBoYXZlIGluL291dEV4dHJhY3RCb3ggc28gbm8gbmVlZCB0byBpbmNsdWRlIHRoZW0gaGVyZS5cbiAgbm9kZS53aWR0aCA9IG5vZGUuY29yZUJveC53aWR0aCArIHBhcmFtcy5wYWRkaW5nTGVmdCArIHBhcmFtcy5wYWRkaW5nUmlnaHQ7XG4gIG5vZGUuaGVpZ2h0ID0gbm9kZS5jb3JlQm94LmhlaWdodCArIHBhcmFtcy5wYWRkaW5nVG9wICsgcGFyYW1zLnBhZGRpbmdCb3R0b207XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRvdGFsV2lkdGhPZk5vZGUocmVuZGVySW5mbzogUmVuZGVyTm9kZUluZm8pOiB2b2lkIHtcbiAgLy8gQXNzaWduIHRoZSB3aWR0aCBvZiB0aGUgZ3JvdXBDb3JlIGJveCAodGhlIG1haW4gc2hhcGUgb2YgdGhlIG5vZGUpLlxuICByZW5kZXJJbmZvLmNvcmVCb3gud2lkdGggPSByZW5kZXJJbmZvLndpZHRoO1xuICByZW5kZXJJbmZvLmNvcmVCb3guaGVpZ2h0ID0gcmVuZGVySW5mby5oZWlnaHQ7XG4gIC8vIFRPRE86IEFjY291bnQgZm9yIGZvbnQgd2lkdGggcmF0aGVyIHRoYW4gdXNpbmcgYSBtYWdpYyBudW1iZXIuXG4gIGNvbnN0IGxhYmVsTGVuZ3RoID0gcmVuZGVySW5mby5kaXNwbGF5TmFtZS5sZW5ndGg7XG4gIGNvbnN0IGNoYXJXaWR0aCA9IDM7IC8vIDMgcGl4ZWxzIHBlciBjaGFyYWN0ZXIuXG4gIC8vIENvbXB1dGUgdGhlIHRvdGFsIHdpZHRoIG9mIHRoZSBub2RlLlxuICByZW5kZXJJbmZvLndpZHRoID0gTWF0aC5tYXgocmVuZGVySW5mby5jb3JlQm94LndpZHRoICtcbiAgICByZW5kZXJJbmZvLmluYm94V2lkdGggKyByZW5kZXJJbmZvLm91dGJveFdpZHRoLFxuICAgIGxhYmVsTGVuZ3RoICogY2hhcldpZHRoKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgbGF5b3V0IGZvciBhIGdyYXBoIHVzaW5nIGRhZ3JlXG4gKiBAcGFyYW0gZ3JhcGggdGhlIGdyYXBoIHRvIGJlIGxhaWQgb3V0XG4gKiBAcGFyYW0gcGFyYW1zIGxheW91dCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gZ3JhcGhDb21wb25lbnRcbiAqIEByZXR1cm4gd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgZ3JvdXBDb3JlIGdyYXBoXG4gKi9cbmZ1bmN0aW9uIGRhZ3JlTGF5b3V0KFxuICBncmFwaDogZ3JhcGhsaWIuR3JhcGg8UmVuZGVyTm9kZUluZm8sIFJlbmRlck1ldGFlZGdlSW5mbz4sXG4gIHBhcmFtcyxcbiAgZ3JhcGhDb21wb25lbnQ6IE56R3JhcGhDb21wb25lbnQpOiB7IGhlaWdodDogbnVtYmVyLCB3aWR0aDogbnVtYmVyIH0ge1xuICBPYmplY3QuYXNzaWduKGdyYXBoLmdyYXBoKCksIHtcbiAgICBub2Rlc2VwOiBwYXJhbXMubm9kZVNlcCxcbiAgICByYW5rc2VwOiBwYXJhbXMucmFua1NlcCxcbiAgICBlZGdlc2VwOiBwYXJhbXMuZWRnZVNlcFxuICB9KTtcbiAgY29uc3QgYnJpZGdlTm9kZU5hbWVzID0gW107XG4gIGNvbnN0IG5vbkJyaWRnZU5vZGVOYW1lcyA9IFtdO1xuXG4gIC8vIFNwbGl0IG91dCBub2RlcyBpbnRvIGJyaWRnZSBhbmQgbm9uLWJyaWRnZSBub2RlcywgYW5kIGNhbGN1bGF0ZSB0aGUgdG90YWxcbiAgLy8gd2lkdGggd2Ugc2hvdWxkIHVzZSBmb3IgYnJpZGdlIG5vZGVzLlxuICBncmFwaC5ub2RlcygpLmZvckVhY2gobm9kZU5hbWUgPT4ge1xuICAgIGNvbnN0IG5vZGVJbmZvID0gZ3JhcGgubm9kZShub2RlTmFtZSk7XG4gICAgaWYgKG5vZGVJbmZvLm5vZGUudHlwZSA9PT0gTm9kZVR5cGUuQlJJREdFKSB7XG4gICAgICBicmlkZ2VOb2RlTmFtZXMucHVzaChub2RlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vbkJyaWRnZU5vZGVOYW1lcy5wdXNoKG5vZGVOYW1lKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChncmFwaENvbXBvbmVudC5lZGdlc0xheW91dEZ1bmN0aW9uKSB7XG4gICAgZ3JhcGhDb21wb25lbnQuZWRnZXNMYXlvdXRGdW5jdGlvbihcbiAgICAgIGdyYXBoLFxuICAgICAgcGFyYW1zXG4gICAgKTtcbiAgfVxuXG4gIC8vIElmIHRoZXJlIGFyZSBubyBub24tYnJpZGdlIG5vZGVzLCB0aGVuIHRoZSBncmFwaCBoYXMgemVybyBzaXplLlxuICBpZiAoIW5vbkJyaWRnZU5vZGVOYW1lcy5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGggOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcbiAgfVxuICBsYXlvdXQoZ3JhcGggYXMgYW55KTtcblxuICAvLyBDYWxjdWxhdGUgdGhlIHRydWUgYm91bmRpbmcgYm94IG9mIHRoZSBncmFwaCBieSBpdGVyYXRpbmcgb3ZlciBub2RlcyBhbmRcbiAgLy8gZWRnZXMgcmF0aGVyIHRoYW4gYWNjZXB0aW5nIGRhZ3JlJ3Mgd29yZCBmb3IgaXQuIEluIHBhcnRpY3VsYXIsIHdlIHNob3VsZFxuICAvLyBpZ25vcmUgdGhlIGV4dHJhLXdpZGUgYnJpZGdlIG5vZGVzIGFuZCBicmlkZ2UgZWRnZXMsIGFuZCBhbGxvdyBmb3JcbiAgLy8gYW5ub3RhdGlvbiBib3hlcyBhbmQgbGFiZWxzLlxuICBsZXQgbWluWCA9IEluZmluaXR5O1xuICBsZXQgbWluWSA9IEluZmluaXR5O1xuICBsZXQgbWF4WCA9IC1JbmZpbml0eTtcbiAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG4gIG5vbkJyaWRnZU5vZGVOYW1lcy5mb3JFYWNoKG5vZGVOYW1lID0+IHtcbiAgICBjb25zdCBub2RlSW5mbyA9IGdyYXBoLm5vZGUobm9kZU5hbWUpO1xuICAgIGNvbnN0IHcgPSAwLjUgKiBub2RlSW5mby53aWR0aDtcbiAgICBjb25zdCB4MSA9IG5vZGVJbmZvLnggLSB3O1xuICAgIGNvbnN0IHgyID0gbm9kZUluZm8ueCArIHc7XG4gICAgbWluWCA9IHgxIDwgbWluWCA/IHgxIDogbWluWDtcbiAgICBtYXhYID0geDIgPiBtYXhYID8geDIgOiBtYXhYO1xuICAgIC8vIFRPRE86IEFjY291bnQgZm9yIHRoZSBoZWlnaHQgb2YgbGFiZWxzIGFib3ZlIG9wIG5vZGVzIGhlcmUuXG4gICAgY29uc3QgaCA9IDAuNSAqIG5vZGVJbmZvLmhlaWdodDtcbiAgICBjb25zdCB5MSA9IG5vZGVJbmZvLnkgLSBoO1xuICAgIGNvbnN0IHkyID0gbm9kZUluZm8ueSArIGg7XG4gICAgbWluWSA9IHkxIDwgbWluWSA/IHkxIDogbWluWTtcbiAgICBtYXhZID0geTIgPiBtYXhZID8geTIgOiBtYXhZO1xuICB9KTtcblxuICBncmFwaC5lZGdlcygpLmZvckVhY2goZWRnZU9iaiA9PiB7XG4gICAgY29uc3QgZWRnZUluZm8gPSBncmFwaC5lZGdlKGVkZ2VPYmopO1xuICAgIGlmIChlZGdlSW5mby5zdHJ1Y3R1cmFsKSB7XG4gICAgICByZXR1cm47IC8vIFNraXAgc3RydWN0dXJhbCBlZGdlcyBmcm9tIG1pbi9tYXggY2FsY3VsYXRpb25zLlxuICAgIH1cblxuICAgIC8vIFNpbmNlIHRoZSBub2RlIHNpemUgcGFzc2VkIHRvIGRhZ3JlIGluY2x1ZGVzIHRoZSBpbiBhbmQgb3V0XG4gICAgLy8gYW5ub3RhdGlvbnMsIHRoZSBlbmRwb2ludHMgb2YgdGhlIGVkZ2UgcHJvZHVjZWQgYnkgZGFncmUgbWF5IG5vdFxuICAgIC8vIHBvaW50IHRvIHRoZSBhY3R1YWwgbm9kZSBzaGFwZSAocmVjdGFuZ2xlLCBlbGxpcHNlKS4gV2UgY29ycmVjdCB0aGVcbiAgICAvLyBlbmQtcG9pbnRzIGJ5IGZpbmRpbmcgdGhlIGludGVyc2VjdGlvbiBvZiBhIGxpbmUgYmV0d2VlbiB0aGVcbiAgICAvLyBuZXh0LXRvLWxhc3QgKG5leHQtdG8tZmlyc3QpIHBvaW50IGFuZCB0aGUgZGVzdGluYXRpb24gKHNvdXJjZSlcbiAgICAvLyByZWN0YW5nbGUuXG4gICAgY29uc3Qgc291cmNlTm9kZSA9IGdyYXBoLm5vZGUoZWRnZUluZm8ubWV0YWVkZ2Uudik7XG4gICAgY29uc3QgZGVzdE5vZGUgPSBncmFwaC5ub2RlKGVkZ2VJbmZvLm1ldGFlZGdlLncpO1xuXG4gICAgLy8gU3RyYWlnaHQgMy1wb2ludHMgZWRnZXMgYXJlIHNwZWNpYWwgY2FzZSwgc2luY2UgdGhleSBhcmUgY3VydmVkIGFmdGVyXG4gICAgLy8gb3VyIGRlZmF1bHQgY29ycmVjdGlvbi4gVG8ga2VlcCB0aGVtIHN0cmFpZ2h0LCB3ZSByZW1vdmUgdGhlIG1pZCBwb2ludFxuICAgIC8vIGFuZCBjb3JyZWN0IHRoZSBmaXJzdCBhbmQgdGhlIGxhc3QgcG9pbnQgdG8gYmUgdGhlIGNlbnRlciBvZiB0aGVcbiAgICAvLyBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIG5vZGUgcmVzcGVjdGl2ZWx5LlxuICAgIGlmIChlZGdlSW5mby5wb2ludHMubGVuZ3RoID09PSAzICYmIGlzU3RyYWlnaHRMaW5lKGVkZ2VJbmZvLnBvaW50cykpIHtcbiAgICAgIGlmIChzb3VyY2VOb2RlICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgY3hTb3VyY2UgPSBzb3VyY2VOb2RlLmV4cGFuZGVkID9cbiAgICAgICAgICBzb3VyY2VOb2RlLnggOiBjb21wdXRlQ1hQb3NpdGlvbk9mTm9kZVNoYXBlKHNvdXJjZU5vZGUpO1xuICAgICAgICBlZGdlSW5mby5wb2ludHNbIDAgXS54ID0gY3hTb3VyY2U7XG4gICAgICB9XG4gICAgICBpZiAoZGVzdE5vZGUgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBjeERlc3QgPSBkZXN0Tm9kZS5leHBhbmRlZCA/XG4gICAgICAgICAgZGVzdE5vZGUueCA6IGNvbXB1dGVDWFBvc2l0aW9uT2ZOb2RlU2hhcGUoZGVzdE5vZGUpO1xuICAgICAgICBlZGdlSW5mby5wb2ludHNbIDIgXS54ID0gY3hEZXN0O1xuICAgICAgfVxuICAgICAgLy8gUmVtb3ZlIHRoZSBtaWRkbGUgcG9pbnQgc28gdGhlIGVkZ2UgZG9lc24ndCBjdXJ2ZS5cbiAgICAgIGVkZ2VJbmZvLnBvaW50cyA9IFsgZWRnZUluZm8ucG9pbnRzWyAwIF0sIGVkZ2VJbmZvLnBvaW50c1sgMSBdIF07XG4gICAgfVxuICAgIC8vIENvcnJlY3QgdGhlIGRlc3RpbmF0aW9uIGVuZHBvaW50IG9mIHRoZSBlZGdlLlxuICAgIGNvbnN0IG5leHRUb0xhc3RQb2ludCA9IGVkZ2VJbmZvLnBvaW50c1sgZWRnZUluZm8ucG9pbnRzLmxlbmd0aCAtIDIgXTtcbiAgICAvLyBUaGUgZGVzdGluYXRpb24gbm9kZSBtaWdodCBiZSBudWxsIGlmIHRoaXMgaXMgYSBicmlkZ2UgZWRnZS5cbiAgICBpZiAoZGVzdE5vZGUgIT0gbnVsbCkge1xuICAgICAgZWRnZUluZm8ucG9pbnRzWyBlZGdlSW5mby5wb2ludHMubGVuZ3RoIC0gMSBdID1cbiAgICAgICAgaW50ZXJzZWN0UG9pbnRBbmROb2RlKG5leHRUb0xhc3RQb2ludCwgZGVzdE5vZGUpO1xuICAgIH1cbiAgICAvLyBDb3JyZWN0IHRoZSBzb3VyY2UgZW5kcG9pbnQgb2YgdGhlIGVkZ2UuXG4gICAgY29uc3Qgc2Vjb25kUG9pbnQgPSBlZGdlSW5mby5wb2ludHNbIDEgXTtcbiAgICAvLyBUaGUgc291cmNlIG1pZ2h0IGJlIG51bGwgaWYgdGhpcyBpcyBhIGJyaWRnZSBlZGdlLlxuICAgIGlmIChzb3VyY2VOb2RlICE9IG51bGwpIHtcbiAgICAgIGVkZ2VJbmZvLnBvaW50c1sgMCBdID0gaW50ZXJzZWN0UG9pbnRBbmROb2RlKHNlY29uZFBvaW50LCBzb3VyY2VOb2RlKTtcbiAgICB9XG5cbiAgICBlZGdlSW5mby5wb2ludHMuZm9yRWFjaCgocG9pbnQ6IFBvaW50KSA9PiB7XG4gICAgICBtaW5YID0gcG9pbnQueCA8IG1pblggPyBwb2ludC54IDogbWluWDtcbiAgICAgIG1heFggPSBwb2ludC54ID4gbWF4WCA/IHBvaW50LnggOiBtYXhYO1xuICAgICAgbWluWSA9IHBvaW50LnkgPCBtaW5ZID8gcG9pbnQueSA6IG1pblk7XG4gICAgICBtYXhZID0gcG9pbnQueSA+IG1heFkgPyBwb2ludC55IDogbWF4WTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gU2hpZnQgYWxsIG5vZGVzIGFuZCBlZGdlIHBvaW50cyB0byBhY2NvdW50IGZvciB0aGUgbGVmdC1wYWRkaW5nIGFtb3VudCxcbiAgLy8gYW5kIHRoZSBpbnZpc2libGUgYnJpZGdlIG5vZGVzLlxuICBncmFwaC5ub2RlcygpLmZvckVhY2gobm9kZU5hbWUgPT4ge1xuICAgIGNvbnN0IG5vZGVJbmZvID0gZ3JhcGgubm9kZShub2RlTmFtZSk7XG4gICAgbm9kZUluZm8ueCAtPSBtaW5YO1xuICAgIG5vZGVJbmZvLnkgLT0gbWluWTtcbiAgfSk7XG5cbiAgZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGVkZ2VPYmogPT4ge1xuICAgIGdyYXBoLmVkZ2UoZWRnZU9iaikucG9pbnRzLmZvckVhY2goKHBvaW50OiBQb2ludCkgPT4ge1xuICAgICAgcG9pbnQueCAtPSBtaW5YO1xuICAgICAgcG9pbnQueSAtPSBtaW5ZO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoIDogbWF4WCAtIG1pblgsXG4gICAgaGVpZ2h0OiBtYXhZIC0gbWluWVxuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgaWYgYSBsaW5lIGdvaW5nIHRocm91Z2ggdGhlIHNwZWNpZmllZCBwb2ludHMgaXMgYSBzdHJhaWdodCBsaW5lLlxuICovXG5mdW5jdGlvbiBpc1N0cmFpZ2h0TGluZShwb2ludHM6IFBvaW50W10pIHtcbiAgbGV0IGFuZ2xlID0gYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHBvaW50c1sgMCBdLCBwb2ludHNbIDEgXSk7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IG5ld0FuZ2xlID0gYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHBvaW50c1sgaSBdLCBwb2ludHNbIGkgKyAxIF0pO1xuICAgIC8vIEhhdmUgYSB0b2xlcmFuY2Ugb2YgMSBkZWdyZWUuXG4gICAgaWYgKE1hdGguYWJzKG5ld0FuZ2xlIC0gYW5nbGUpID4gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhbmdsZSA9IG5ld0FuZ2xlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5cbi8qKiBSZXR1cm5zIHRoZSBhbmdsZSAoaW4gZGVncmVlcykgYmV0d2VlbiB0d28gcG9pbnRzLiAqL1xuZnVuY3Rpb24gYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKGE6IFBvaW50LCBiOiBQb2ludCk6IG51bWJlciB7XG4gIGNvbnN0IGR4ID0gYi54IC0gYS54O1xuICBjb25zdCBkeSA9IGIueSAtIGEueTtcbiAgcmV0dXJuIDE4MCAqIE1hdGguYXRhbihkeSAvIGR4KSAvIE1hdGguUEk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgY2VudGVyIHBvc2l0aW9uIG9mIHRoZSBub2RlJ3Mgc2hhcGUuIFRoZSBwb3NpdGlvbiBkZXBlbmRzXG4gKiBvbiBpZiB0aGUgbm9kZSBoYXMgaW4gYW5kIG91dC1hbm5vdGF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVDWFBvc2l0aW9uT2ZOb2RlU2hhcGUocmVuZGVySW5mbzogUmVuZGVyTm9kZUluZm8pOlxuICBudW1iZXIge1xuICBpZiAocmVuZGVySW5mby5leHBhbmRlZCkge1xuICAgIHJldHVybiByZW5kZXJJbmZvLng7XG4gIH1cbiAgY29uc3QgZHggPSAwO1xuICByZXR1cm4gcmVuZGVySW5mby54IC0gcmVuZGVySW5mby53aWR0aCAvIDIgKyBkeCArXG4gICAgcmVuZGVySW5mby5jb3JlQm94LndpZHRoIC8gMjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb24gb2YgYSBsaW5lIGJldHdlZW4gdGhlIHByb3ZpZGVkIHBvaW50XG4gKiBhbmQgdGhlIHByb3ZpZGVkIHJlY3RhbmdsZS5cbiAqL1xuZnVuY3Rpb24gaW50ZXJzZWN0UG9pbnRBbmROb2RlKFxuICBwb2ludDogUG9pbnQsIG5vZGU6IFJlbmRlck5vZGVJbmZvKTogUG9pbnQge1xuICAvLyBjeCBhbmQgY3kgYXJlIHRoZSBjZW50ZXIgb2YgdGhlIHJlY3RhbmdsZS5cbiAgY29uc3QgY3ggPSBub2RlLmV4cGFuZGVkID9cbiAgICBub2RlLnggOiBjb21wdXRlQ1hQb3NpdGlvbk9mTm9kZVNoYXBlKG5vZGUpO1xuICBjb25zdCBjeSA9IG5vZGUueTtcbiAgLy8gQ2FsY3VsYXRlIHRoZSBzbG9wZVxuICBjb25zdCBkeCA9IHBvaW50LnggLSBjeDtcbiAgY29uc3QgZHkgPSBwb2ludC55IC0gY3k7XG4gIGxldCB3ID0gbm9kZS5leHBhbmRlZCA/IG5vZGUud2lkdGggOiBub2RlLmNvcmVCb3gud2lkdGg7XG4gIGxldCBoID0gbm9kZS5leHBhbmRlZCA/IG5vZGUuaGVpZ2h0IDogbm9kZS5jb3JlQm94LmhlaWdodDtcbiAgbGV0IGRlbHRhWCwgZGVsdGFZO1xuICBpZiAoTWF0aC5hYnMoZHkpICogdyAvIDIgPiBNYXRoLmFicyhkeCkgKiBoIC8gMikge1xuICAgIC8vIFRoZSBpbnRlcnNlY3Rpb24gaXMgYWJvdmUgb3IgYmVsb3cgdGhlIHJlY3RhbmdsZS5cbiAgICBpZiAoZHkgPCAwKSB7XG4gICAgICBoID0gLWg7XG4gICAgfVxuICAgIGRlbHRhWCA9IGR5ID09PSAwID8gMCA6IGggLyAyICogZHggLyBkeTtcbiAgICBkZWx0YVkgPSBoIC8gMjtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgaW50ZXJzZWN0aW9uIGlzIGxlZnQgb3IgcmlnaHQgb2YgdGhlIHJlY3RhbmdsZS5cbiAgICBpZiAoZHggPCAwKSB7XG4gICAgICB3ID0gLXc7XG4gICAgfVxuICAgIGRlbHRhWCA9IHcgLyAyO1xuICAgIGRlbHRhWSA9IGR4ID09PSAwID8gMCA6IHcgLyAyICogZHkgLyBkeDtcbiAgfVxuICByZXR1cm4geyB4OiBjeCArIGRlbHRhWCwgeTogY3kgKyBkZWx0YVkgfTtcbn1cbiJdfQ==