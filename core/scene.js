/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * ==============================================================================
 * This product contains a modified version of 'TensorBoard plugin for
 * graphs', a Angular implementation of nest-graph visualization
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
import { select } from 'd3-selection';
import * as _ from 'lodash';
import { buildGroupEdge } from './edge';
import { NodeType, ROOT_NAME } from './interface';
import { computeCXPositionOfNodeShape, MIN_AUX_WIDTH, PARAMS as LAYOUT_PARAMS } from './layout';
import { buildGroupNode } from './node';
/** @type {?} */
export var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
/** @type {?} */
export var Class = {
    Node: {
        // <g> element that contains nodes.
        CONTAINER: 'nodes',
        // <g> element that contains detail about a node.
        GROUP: 'node',
        // <g> element that contains visual elements (like rect, ellipse).
        SHAPE: 'nodeshape',
        // <*> element(s) under SHAPE that should receive color updates.
        COLOR_TARGET: 'nodecolortarget',
        // <text> element showing the node's label.
        LABEL: 'nodelabel',
        SUB_TITLE: 'node-groupSubtitle',
        // <g> element that contains all visuals for the expand/collapse
        // button for expandable group nodes.
        BUTTON_CONTAINER: 'buttoncontainer',
        // <circle> element that surrounds expand/collapse buttons.
        BUTTON_CIRCLE: 'buttoncircle',
        // <path> element of the expand button.
        EXPAND_BUTTON: 'expandbutton',
        // <path> element of the collapse button.
        COLLAPSE_BUTTON: 'collapsebutton'
    },
    Edge: {
        CONTAINER: 'edges',
        GROUP: 'edge',
        LINE: 'edgeline',
        REFERENCE_EDGE: 'referenceedge',
        REF_LINE: 'refline',
        SELECTABLE: 'selectableedge',
        SELECTED: 'selectededge',
        STRUCTURAL: 'structural'
    },
    Annotation: {
        OUTBOX: 'out-annotations',
        INBOX: 'in-annotations',
        GROUP: 'annotation',
        NODE: 'annotation-node',
        EDGE: 'annotation-edge',
        CONTROL_EDGE: 'annotation-control-edge',
        LABEL: 'annotation-label',
        ELLIPSIS: 'annotation-ellipsis'
    },
    Scene: {
        GROUP: 'scene',
        CORE: 'core',
        FUNCTION_LIBRARY: 'function-library',
        INEXTRACT: 'in-extract',
        OUTEXTRACT: 'out-extract'
    },
    Subscene: { GROUP: 'subscene' },
    OPNODE: 'op',
    METANODE: 'meta',
    SERIESNODE: 'series',
    BRIDGENODE: 'bridge',
    ELLIPSISNODE: 'ellipsis'
};
/**
 * @param {?} container
 * @param {?} renderNode
 * @param {?} sceneElement
 * @param {?=} sceneClass
 * @return {?}
 */
export function buildGroupScene(container, renderNode, sceneElement, sceneClass) {
    if (sceneClass === void 0) { sceneClass = Class.Scene.GROUP; }
    /** @type {?} */
    var isNewSceneGroup = selectChild(container, 'g', sceneClass).empty();
    /** @type {?} */
    var sceneGroup = selectOrCreateChild(container, 'g', [sceneClass, 'nz-graph']);
    // groupCore
    /** @type {?} */
    var coreGroup = selectOrCreateChild(sceneGroup, 'g', Class.Scene.CORE);
    /** @type {?} */
    var coreNodes = _.reduce(renderNode.coreGraph.nodes(), function (nodes, name) {
        /** @type {?} */
        var node = renderNode.coreGraph.node(name);
        if (!node.excluded) {
            nodes.push(node);
        }
        return nodes;
    }, []);
    if (renderNode.node.type === NodeType.SERIES) {
        // For series, we want the first item on top, so reverse the array so
        // the first item in the series becomes last item in the top, and thus
        // is rendered on the top.
        coreNodes.reverse();
    }
    // requestAnimationFrame 避免多节点时掉帧
    // Create the layer of edges for this scene (paths).
    requestAnimationFrame(function () {
        buildGroupEdge(coreGroup, renderNode.coreGraph, sceneElement);
    });
    // Create the layer of nodes for this scene (ellipses, rects etc).
    requestAnimationFrame(function () {
        buildGroupNode(coreGroup, coreNodes, sceneElement);
    });
    // In-extract
    selectChild(sceneGroup, 'g', Class.Scene.INEXTRACT).remove();
    // Out-extract
    selectChild(sceneGroup, 'g', Class.Scene.OUTEXTRACT).remove();
    selectChild(sceneGroup, 'g', Class.Scene.FUNCTION_LIBRARY).remove();
    position(sceneGroup, renderNode);
    // Fade in the scene group if it didn't already exist.
    if (isNewSceneGroup) {
        sceneGroup.attr('opacity', 0).transition().attr('opacity', 1);
    }
    return sceneGroup;
}
/**
 * @param {?} container
 * @param {?} tagName
 * @param {?=} className
 * @return {?}
 */
export function selectChild(container, tagName, className) {
    var e_1, _a, e_2, _b;
    /** @type {?} */
    var children = container.node().childNodes;
    try {
        for (var children_1 = children, children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
            var child = children_1_1.value;
            if (child.tagName === tagName) {
                if (className instanceof Array) {
                    /** @type {?} */
                    var hasAllClasses = true;
                    try {
                        for (var className_1 = className, className_1_1 = className_1.next(); !className_1_1.done; className_1_1 = className_1.next()) {
                            var j = className_1_1.value;
                            hasAllClasses =
                                hasAllClasses && child.classList.contains(j);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (className_1_1 && !className_1_1.done && (_b = className_1.return)) _b.call(className_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    if (hasAllClasses) {
                        return select(child);
                    }
                }
                else if ((!className || child.classList.contains(className))) {
                    return select(child);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return select(null);
}
/**
 * @param {?} container
 * @param {?} tagName
 * @param {?=} className
 * @param {?=} before
 * @return {?}
 */
export function selectOrCreateChild(container, tagName, className, before) {
    /** @type {?} */
    var child = selectChild(container, tagName, className);
    if (!child.empty()) {
        return child;
    }
    /** @type {?} */
    var newElement = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    if (className instanceof Array) {
        for (var i = 0; i < className.length; i++) {
            newElement.classList.add(className[i]);
        }
    }
    else {
        newElement.classList.add(className);
    }
    if (before) { // if before exists, insert
        container.node().insertBefore(newElement, before);
    }
    else { // otherwise, append
        container.node().appendChild(newElement);
    }
    return select(newElement)
        // need to bind data to emulate d3_selection.append
        .datum(container.datum());
}
/**
 * @param {?} sceneGroup
 * @param {?} renderNode
 * @return {?}
 */
function position(sceneGroup, renderNode) {
    // Translate scenes down by the label height so that when showing graphs in
    // expanded metanodes, the graphs are below the labels.  Do not shift them
    // down for series nodes as series nodes don't have labels inside of their
    // bounding boxes.
    /** @type {?} */
    var yTranslate = renderNode.node.type === NodeType.SERIES ?
        0 : LAYOUT_PARAMS.subscene.meta.labelHeight;
    // groupCore
    if (renderNode.node.name !== ROOT_NAME) {
        translate(selectChild(sceneGroup, 'g', Class.Scene.CORE), 0, yTranslate);
    }
    // in-extract
    /** @type {?} */
    var hasInExtract = renderNode.isolatedInExtract.length > 0;
    /** @type {?} */
    var hasOutExtract = renderNode.isolatedOutExtract.length > 0;
    /** @type {?} */
    var offset = LAYOUT_PARAMS.subscene.meta.extractXOffset;
    /** @type {?} */
    var auxWidth = 0;
    if (hasInExtract) {
        auxWidth += renderNode.outExtractBox.width;
    }
    if (hasOutExtract) {
        auxWidth += renderNode.outExtractBox.width;
    }
    if (hasInExtract) {
        /** @type {?} */
        var inExtractX = renderNode.coreBox.width;
        if (auxWidth < MIN_AUX_WIDTH) {
            inExtractX = inExtractX - MIN_AUX_WIDTH +
                renderNode.inExtractBox.width / 2;
        }
        else {
            inExtractX = inExtractX -
                renderNode.inExtractBox.width / 2 - renderNode.outExtractBox.width -
                (hasOutExtract ? offset : 0);
        }
        translate(selectChild(sceneGroup, 'g', Class.Scene.INEXTRACT), inExtractX, yTranslate);
    }
    // out-extract
    if (hasOutExtract) {
        /** @type {?} */
        var outExtractX = renderNode.coreBox.width;
        if (auxWidth < MIN_AUX_WIDTH) {
            outExtractX = outExtractX - MIN_AUX_WIDTH +
                renderNode.outExtractBox.width / 2;
        }
        else {
            outExtractX -= renderNode.outExtractBox.width / 2;
        }
        translate(selectChild(sceneGroup, 'g', Class.Scene.OUTEXTRACT), outExtractX, yTranslate);
    }
}
/**
 * @param {?} selection
 * @param {?} x0
 * @param {?} y0
 * @return {?}
 */
export function translate(selection, x0, y0) {
    // If it is already placed on the screen, make it a transition.
    if (selection.attr('transform') != null) {
        selection = selection.transition('position');
    }
    selection.attr('transform', 'translate(' + x0 + ',' + y0 + ')');
}
/**
 * Helper for setting position of a svg expand/collapse button
 * @param {?} button container group
 * @param {?} renderNode the render node of the group node to position
 *        the button on.
 * @return {?}
 */
export function positionButton(button, renderNode) {
    /** @type {?} */
    var cx = computeCXPositionOfNodeShape(renderNode);
    // Position the button in the top-right corner of the group node,
    // with space given the draw the button inside of the corner.
    /** @type {?} */
    var width = renderNode.expanded ?
        renderNode.width : renderNode.coreBox.width;
    /** @type {?} */
    var height = renderNode.expanded ?
        renderNode.height : renderNode.coreBox.height;
    /** @type {?} */
    var x = cx + width / 2 - 6;
    /** @type {?} */
    var y = renderNode.y - height / 2 + 6;
    // For unexpanded series nodes, the button has special placement due
    // to the unique visuals of this group node.
    if (renderNode.node.type === NodeType.SERIES && !renderNode.expanded) {
        x += 10;
        y -= 2;
    }
    /** @type {?} */
    var translateStr = 'translate(' + x + ',' + y + ')';
    button.selectAll('path').transition().attr('transform', translateStr);
    button.select('circle').transition().attr({ cx: x, cy: y, r: LAYOUT_PARAMS.nodeSize.meta.expandButtonRadius });
}
/**
 * Helper for setting position of a svg ellipse
 * @param {?} ellipse ellipse to set position of.
 * @param {?} cx Center x.
 * @param {?} cy Center x.
 * @param {?} width Width to set.
 * @param {?} height Height to set.
 * @return {?}
 */
export function positionEllipse(ellipse, cx, cy, width, height) {
    ellipse.transition()
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', width / 2)
        .attr('ry', height / 2);
}
/**
 * Helper for setting position of a svg rect
 * @param {?} rect A d3 selection of rect(s) to set position of.
 * @param {?} cx Center x.
 * @param {?} cy Center x.
 * @param {?} width Width to set.
 * @param {?} height Height to set.
 * @param {?=} scale scale
 * @return {?}
 */
export function positionRect(rect, cx, cy, width, height, scale) {
    if (scale === void 0) { scale = 1; }
    rect.transition()
        .attr('style', "transform: scale(" + 1 / scale + ")")
        .attr('x', (cx - width / 2) * scale)
        .attr('y', (cy - height / 2) * scale)
        .attr('width', width * scale)
        .attr('height', height * scale);
}
/**
 * @param {?} nodeName
 * @return {?}
 */
export function getNodeElementByName(nodeName) {
    return select('[data-name="' + nodeName + '"].' + Class.Node.GROUP).node();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Abmctem9ycm8vbmctcGx1cy9ncmFwaC8iLCJzb3VyY2VzIjpbImNvcmUvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQSxPQUFPLEVBQUUsTUFBTSxFQUFhLE1BQU0sY0FBYyxDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbEQsT0FBTyxFQUFFLDRCQUE0QixFQUFFLGFBQWEsRUFBRSxNQUFNLElBQUksYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7O0FBR3hDLE1BQU0sS0FBTyxhQUFhLEdBQUcsNEJBQTRCOztBQUV6RCxNQUFNLEtBQUssS0FBSyxHQUFHO0lBQ2pCLElBQUksRUFBVTs7UUFFWixTQUFTLEVBQVMsT0FBTzs7UUFFekIsS0FBSyxFQUFhLE1BQU07O1FBRXhCLEtBQUssRUFBYSxXQUFXOztRQUU3QixZQUFZLEVBQU0saUJBQWlCOztRQUVuQyxLQUFLLEVBQWEsV0FBVztRQUM3QixTQUFTLEVBQVMsb0JBQW9COzs7UUFHdEMsZ0JBQWdCLEVBQUUsaUJBQWlCOztRQUVuQyxhQUFhLEVBQUssY0FBYzs7UUFFaEMsYUFBYSxFQUFLLGNBQWM7O1FBRWhDLGVBQWUsRUFBRyxnQkFBZ0I7S0FDbkM7SUFDRCxJQUFJLEVBQVU7UUFDWixTQUFTLEVBQU8sT0FBTztRQUN2QixLQUFLLEVBQVcsTUFBTTtRQUN0QixJQUFJLEVBQVksVUFBVTtRQUMxQixjQUFjLEVBQUUsZUFBZTtRQUMvQixRQUFRLEVBQVEsU0FBUztRQUN6QixVQUFVLEVBQU0sZ0JBQWdCO1FBQ2hDLFFBQVEs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QUNuQixJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztTQUNkLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1NBQ2QsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFCLENBQUM7Ozs7Ozs7Ozs7O0FBV0QsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxLQUFhLEVBQzNDLE1BQWMsRUFBRSxLQUFTO0lBQVQsc0JBQUEsRUFBQSxTQUFTO0lBQ3BELElBQUksQ0FBQyxVQUFVLEVBQUU7U0FDaEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBb0IsQ0FBQyxHQUFHLEtBQUssTUFBRyxDQUFDO1NBQy9DLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQzVCLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLFFBQWdCO0lBQ25ELE9BQU8sTUFBTSxDQUFDLGNBQWMsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0UsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBUaGlzIHByb2R1Y3QgY29udGFpbnMgYSBtb2RpZmllZCB2ZXJzaW9uIG9mICdUZW5zb3JCb2FyZCBwbHVnaW4gZm9yXG4gKiBncmFwaHMnLCBhIEFuZ3VsYXIgaW1wbGVtZW50YXRpb24gb2YgbmVzdC1ncmFwaCB2aXN1YWxpemF0aW9uXG4gKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIG5nLXpvcnJvLXBsdXMgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSAnTGljZW5zZScpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gJ0FTIElTJyBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuaW1wb3J0IHsgc2VsZWN0LCBTZWxlY3Rpb24gfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgTnpHcmFwaENvbXBvbmVudCB9IGZyb20gJy4uL2dyYXBoL2dyYXBoLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBidWlsZEdyb3VwRWRnZSB9IGZyb20gJy4vZWRnZSc7XG5pbXBvcnQgeyBOb2RlVHlwZSwgUk9PVF9OQU1FIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgY29tcHV0ZUNYUG9zaXRpb25PZk5vZGVTaGFwZSwgTUlOX0FVWF9XSURUSCwgUEFSQU1TIGFzIExBWU9VVF9QQVJBTVMgfSBmcm9tICcuL2xheW91dCc7XG5pbXBvcnQgeyBidWlsZEdyb3VwTm9kZSB9IGZyb20gJy4vbm9kZSc7XG5pbXBvcnQgeyBSZW5kZXJHcm91cE5vZGVJbmZvLCBSZW5kZXJOb2RlSW5mbyB9IGZyb20gJy4vcmVuZGVyJztcblxuZXhwb3J0IGNvbnN0IFNWR19OQU1FU1BBQ0UgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG5leHBvcnQgbGV0IENsYXNzID0ge1xuICBOb2RlICAgICAgICA6IHtcbiAgICAvLyA8Zz4gZWxlbWVudCB0aGF0IGNvbnRhaW5zIG5vZGVzLlxuICAgIENPTlRBSU5FUiAgICAgICA6ICdub2RlcycsXG4gICAgLy8gPGc+IGVsZW1lbnQgdGhhdCBjb250YWlucyBkZXRhaWwgYWJvdXQgYSBub2RlLlxuICAgIEdST1VQICAgICAgICAgICA6ICdub2RlJyxcbiAgICAvLyA8Zz4gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHZpc3VhbCBlbGVtZW50cyAobGlrZSByZWN0LCBlbGxpcHNlKS5cbiAgICBTSEFQRSAgICAgICAgICAgOiAnbm9kZXNoYXBlJyxcbiAgICAvLyA8Kj4gZWxlbWVudChzKSB1bmRlciBTSEFQRSB0aGF0IHNob3VsZCByZWNlaXZlIGNvbG9yIHVwZGF0ZXMuXG4gICAgQ09MT1JfVEFSR0VUICAgIDogJ25vZGVjb2xvcnRhcmdldCcsXG4gICAgLy8gPHRleHQ+IGVsZW1lbnQgc2hvd2luZyB0aGUgbm9kZSdzIGxhYmVsLlxuICAgIExBQkVMICAgICAgICAgICA6ICdub2RlbGFiZWwnLFxuICAgIFNVQl9USVRMRSAgICAgICA6ICdub2RlLWdyb3VwU3VidGl0bGUnLFxuICAgIC8vIDxnPiBlbGVtZW50IHRoYXQgY29udGFpbnMgYWxsIHZpc3VhbHMgZm9yIHRoZSBleHBhbmQvY29sbGFwc2VcbiAgICAvLyBidXR0b24gZm9yIGV4cGFuZGFibGUgZ3JvdXAgbm9kZXMuXG4gICAgQlVUVE9OX0NPTlRBSU5FUjogJ2J1dHRvbmNvbnRhaW5lcicsXG4gICAgLy8gPGNpcmNsZT4gZWxlbWVudCB0aGF0IHN1cnJvdW5kcyBleHBhbmQvY29sbGFwc2UgYnV0dG9ucy5cbiAgICBCVVRUT05fQ0lSQ0xFICAgOiAnYnV0dG9uY2lyY2xlJyxcbiAgICAvLyA8cGF0aD4gZWxlbWVudCBvZiB0aGUgZXhwYW5kIGJ1dHRvbi5cbiAgICBFWFBBTkRfQlVUVE9OICAgOiAnZXhwYW5kYnV0dG9uJyxcbiAgICAvLyA8cGF0aD4gZWxlbWVudCBvZiB0aGUgY29sbGFwc2UgYnV0dG9uLlxuICAgIENPTExBUFNFX0JVVFRPTiA6ICdjb2xsYXBzZWJ1dHRvbidcbiAgfSxcbiAgRWRnZSAgICAgICAgOiB7XG4gICAgQ09OVEFJTkVSICAgICA6ICdlZGdlcycsXG4gICAgR1JPVVAgICAgICAgICA6ICdlZGdlJyxcbiAgICBMSU5FICAgICAgICAgIDogJ2VkZ2VsaW5lJyxcbiAgICBSRUZFUkVOQ0VfRURHRTogJ3JlZmVyZW5jZWVkZ2UnLFxuICAgIFJFRl9MSU5FICAgICAgOiAncmVmbGluZScsXG4gICAgU0VMRUNUQUJMRSAgICA6ICdzZWxlY3RhYmxlZWRnZScsXG4gICAgU0VMRUNURUQgICAgICA6ICdzZWxlY3RlZGVkZ2UnLFxuICAgIFNUUlVDVFVSQUwgICAgOiAnc3RydWN0dXJhbCdcbiAgfSxcbiAgQW5ub3RhdGlvbiAgOiB7XG4gICAgT1VUQk9YICAgICAgOiAnb3V0LWFubm90YXRpb25zJyxcbiAgICBJTkJPWCAgICAgICA6ICdpbi1hbm5vdGF0aW9ucycsXG4gICAgR1JPVVAgICAgICAgOiAnYW5ub3RhdGlvbicsXG4gICAgTk9ERSAgICAgICAgOiAnYW5ub3RhdGlvbi1ub2RlJyxcbiAgICBFREdFICAgICAgICA6ICdhbm5vdGF0aW9uLWVkZ2UnLFxuICAgIENPTlRST0xfRURHRTogJ2Fubm90YXRpb24tY29udHJvbC1lZGdlJyxcbiAgICBMQUJFTCAgICAgICA6ICdhbm5vdGF0aW9uLWxhYmVsJyxcbiAgICBFTExJUFNJUyAgICA6ICdhbm5vdGF0aW9uLWVsbGlwc2lzJ1xuICB9LFxuICBTY2VuZSAgICAgICA6IHtcbiAgICBHUk9VUCAgICAgICAgICAgOiAnc2NlbmUnLFxuICAgIENPUkUgICAgICAgICAgICA6ICdjb3JlJyxcbiAgICBGVU5DVElPTl9MSUJSQVJZOiAnZnVuY3Rpb24tbGlicmFyeScsXG4gICAgSU5FWFRSQUNUICAgICAgIDogJ2luLWV4dHJhY3QnLFxuICAgIE9VVEVYVFJBQ1QgICAgICA6ICdvdXQtZXh0cmFjdCdcbiAgfSxcbiAgU3Vic2NlbmUgICAgOiB7IEdST1VQOiAnc3Vic2NlbmUnIH0sXG4gIE9QTk9ERSAgICAgIDogJ29wJyxcbiAgTUVUQU5PREUgICAgOiAnbWV0YScsXG4gIFNFUklFU05PREUgIDogJ3NlcmllcycsXG4gIEJSSURHRU5PREUgIDogJ2JyaWRnZScsXG4gIEVMTElQU0lTTk9ERTogJ2VsbGlwc2lzJ1xufTtcblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lIG5vLWFueVxuZXhwb3J0IHR5cGUgQ29udGFpbmVyU2VsZWN0aW9uVHlwZSA9IFNlbGVjdGlvbjxhbnksIGFueSwgYW55LCBhbnk+O1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRHcm91cFNjZW5lKGNvbnRhaW5lcjogQ29udGFpbmVyU2VsZWN0aW9uVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogUmVuZGVyR3JvdXBOb2RlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmVFbGVtZW50OiBOekdyYXBoQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZUNsYXNzOiBzdHJpbmcgPSBDbGFzcy5TY2VuZS5HUk9VUCk6IENvbnRhaW5lclNlbGVjdGlvblR5cGUge1xuICBjb25zdCBpc05ld1NjZW5lR3JvdXAgPSBzZWxlY3RDaGlsZChjb250YWluZXIsICdnJywgc2NlbmVDbGFzcykuZW1wdHkoKTtcbiAgY29uc3Qgc2NlbmVHcm91cCA9IHNlbGVjdE9yQ3JlYXRlQ2hpbGQoY29udGFpbmVyLCAnZycsIFtzY2VuZUNsYXNzLCAnbnotZ3JhcGgnXSk7XG4gIC8vIGdyb3VwQ29yZVxuICBjb25zdCBjb3JlR3JvdXAgPSBzZWxlY3RPckNyZWF0ZUNoaWxkKHNjZW5lR3JvdXAsICdnJywgQ2xhc3MuU2NlbmUuQ09SRSk7XG4gIGNvbnN0IGNvcmVOb2RlcyA9IF8ucmVkdWNlKHJlbmRlck5vZGUuY29yZUdyYXBoLm5vZGVzKCksIChub2RlcywgbmFtZSkgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSByZW5kZXJOb2RlLmNvcmVHcmFwaC5ub2RlKG5hbWUpO1xuICAgIGlmICghbm9kZS5leGNsdWRlZCkge1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LCBbXSk7XG5cbiAgaWYgKHJlbmRlck5vZGUubm9kZS50eXBlID09PSBOb2RlVHlwZS5TRVJJRVMpIHtcbiAgICAvLyBGb3Igc2VyaWVzLCB3ZSB3YW50IHRoZSBmaXJzdCBpdGVtIG9uIHRvcCwgc28gcmV2ZXJzZSB0aGUgYXJyYXkgc29cbiAgICAvLyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgc2VyaWVzIGJlY29tZXMgbGFzdCBpdGVtIGluIHRoZSB0b3AsIGFuZCB0aHVzXG4gICAgLy8gaXMgcmVuZGVyZWQgb24gdGhlIHRvcC5cbiAgICBjb3JlTm9kZXMucmV2ZXJzZSgpO1xuICB9XG5cbiAgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIOmBv+WFjeWkmuiKgueCueaXtuaOieW4p1xuXG4gIC8vIENyZWF0ZSB0aGUgbGF5ZXIgb2YgZWRnZXMgZm9yIHRoaXMgc2NlbmUgKHBhdGhzKS5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBidWlsZEdyb3VwRWRnZShjb3JlR3JvdXAsIHJlbmRlck5vZGUuY29yZUdyYXBoLCBzY2VuZUVsZW1lbnQpO1xuICB9KTtcblxuICAvLyBDcmVhdGUgdGhlIGxheWVyIG9mIG5vZGVzIGZvciB0aGlzIHNjZW5lIChlbGxpcHNlcywgcmVjdHMgZXRjKS5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBidWlsZEdyb3VwTm9kZShjb3JlR3JvdXAsIGNvcmVOb2Rlcywgc2NlbmVFbGVtZW50KTtcbiAgfSk7XG5cbiAgLy8gSW4tZXh0cmFjdFxuICBzZWxlY3RDaGlsZChzY2VuZUdyb3VwLCAnZycsIENsYXNzLlNjZW5lLklORVhUUkFDVCkucmVtb3ZlKCk7XG4gIC8vIE91dC1leHRyYWN0XG4gIHNlbGVjdENoaWxkKHNjZW5lR3JvdXAsICdnJywgQ2xhc3MuU2NlbmUuT1VURVhUUkFDVCkucmVtb3ZlKCk7XG5cbiAgc2VsZWN0Q2hpbGQoc2NlbmVHcm91cCwgJ2cnLCBDbGFzcy5TY2VuZS5GVU5DVElPTl9MSUJSQVJZKS5yZW1vdmUoKTtcblxuICBwb3NpdGlvbihzY2VuZUdyb3VwLCByZW5kZXJOb2RlKTtcblxuICAvLyBGYWRlIGluIHRoZSBzY2VuZSBncm91cCBpZiBpdCBkaWRuJ3QgYWxyZWFkeSBleGlzdC5cbiAgaWYgKGlzTmV3U2NlbmVHcm91cCkge1xuICAgIHNjZW5lR3JvdXAuYXR0cignb3BhY2l0eScsIDApLnRyYW5zaXRpb24oKS5hdHRyKCdvcGFjaXR5JywgMSk7XG4gIH1cblxuICByZXR1cm4gc2NlbmVHcm91cDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdENoaWxkKFxuICBjb250YWluZXI6IENvbnRhaW5lclNlbGVjdGlvblR5cGUsIHRhZ05hbWU6IHN0cmluZywgY2xhc3NOYW1lPzogc3RyaW5nIHwgc3RyaW5nW10pOiBDb250YWluZXJTZWxlY3Rpb25UeXBlIHtcbiAgY29uc3QgY2hpbGRyZW4gPSBjb250YWluZXIubm9kZSgpLmNoaWxkTm9kZXM7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICBpZiAoY2hpbGQudGFnTmFtZSA9PT0gdGFnTmFtZSkge1xuICAgICAgaWYgKGNsYXNzTmFtZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGxldCBoYXNBbGxDbGFzc2VzID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBqIG9mIGNsYXNzTmFtZSkge1xuICAgICAgICAgIGhhc0FsbENsYXNzZXMgPVxuICAgICAgICAgICAgaGFzQWxsQ2xhc3NlcyAmJiBjaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoaik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc0FsbENsYXNzZXMpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZWN0KGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICgoIWNsYXNzTmFtZSB8fCBjaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNlbGVjdChudWxsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdE9yQ3JlYXRlQ2hpbGQoXG4gIGNvbnRhaW5lcjogQ29udGFpbmVyU2VsZWN0aW9uVHlwZSwgdGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcgfCBzdHJpbmdbXSwgYmVmb3JlPyk6IENvbnRhaW5lclNlbGVjdGlvblR5cGUge1xuICBjb25zdCBjaGlsZCA9IHNlbGVjdENoaWxkKGNvbnRhaW5lciwgdGFnTmFtZSwgY2xhc3NOYW1lKTtcbiAgaWYgKCFjaGlsZC5lbXB0eSgpKSB7XG4gICAgcmV0dXJuIGNoaWxkO1xuICB9XG4gIGNvbnN0IG5ld0VsZW1lbnQgPVxuICAgICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcblxuICBpZiAoY2xhc3NOYW1lIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzTmFtZS5sZW5ndGg7IGkrKykge1xuICAgICAgbmV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZVsgaSBdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbmV3RWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gIH1cblxuICBpZiAoYmVmb3JlKSB7IC8vIGlmIGJlZm9yZSBleGlzdHMsIGluc2VydFxuICAgIGNvbnRhaW5lci5ub2RlKCkuaW5zZXJ0QmVmb3JlKG5ld0VsZW1lbnQsIGJlZm9yZSk7XG4gIH0gZWxzZSB7IC8vIG90aGVyd2lzZSwgYXBwZW5kXG4gICAgY29udGFpbmVyLm5vZGUoKS5hcHBlbmRDaGlsZChuZXdFbGVtZW50KTtcbiAgfVxuICByZXR1cm4gc2VsZWN0KG5ld0VsZW1lbnQpXG4gIC8vIG5lZWQgdG8gYmluZCBkYXRhIHRvIGVtdWxhdGUgZDNfc2VsZWN0aW9uLmFwcGVuZFxuICAuZGF0dW0oY29udGFpbmVyLmRhdHVtKCkpO1xufVxuXG5mdW5jdGlvbiBwb3NpdGlvbihzY2VuZUdyb3VwLCByZW5kZXJOb2RlOiBSZW5kZXJHcm91cE5vZGVJbmZvKSB7XG4gIC8vIFRyYW5zbGF0ZSBzY2VuZXMgZG93biBieSB0aGUgbGFiZWwgaGVpZ2h0IHNvIHRoYXQgd2hlbiBzaG93aW5nIGdyYXBocyBpblxuICAvLyBleHBhbmRlZCBtZXRhbm9kZXMsIHRoZSBncmFwaHMgYXJlIGJlbG93IHRoZSBsYWJlbHMuICBEbyBub3Qgc2hpZnQgdGhlbVxuICAvLyBkb3duIGZvciBzZXJpZXMgbm9kZXMgYXMgc2VyaWVzIG5vZGVzIGRvbid0IGhhdmUgbGFiZWxzIGluc2lkZSBvZiB0aGVpclxuICAvLyBib3VuZGluZyBib3hlcy5cbiAgY29uc3QgeVRyYW5zbGF0ZSA9IHJlbmRlck5vZGUubm9kZS50eXBlID09PSBOb2RlVHlwZS5TRVJJRVMgP1xuICAgIDAgOiBMQVlPVVRfUEFSQU1TLnN1YnNjZW5lLm1ldGEubGFiZWxIZWlnaHQ7XG5cbiAgLy8gZ3JvdXBDb3JlXG4gIGlmIChyZW5kZXJOb2RlLm5vZGUubmFtZSAhPT0gUk9PVF9OQU1FKSB7XG4gICAgdHJhbnNsYXRlKHNlbGVjdENoaWxkKHNjZW5lR3JvdXAsICdnJywgQ2xhc3MuU2NlbmUuQ09SRSksIDAsIHlUcmFuc2xhdGUpO1xuICB9XG5cbiAgLy8gaW4tZXh0cmFjdFxuICBjb25zdCBoYXNJbkV4dHJhY3QgPSByZW5kZXJOb2RlLmlzb2xhdGVkSW5FeHRyYWN0Lmxlbmd0aCA+IDA7XG4gIGNvbnN0IGhhc091dEV4dHJhY3QgPSByZW5kZXJOb2RlLmlzb2xhdGVkT3V0RXh0cmFjdC5sZW5ndGggPiAwO1xuXG4gIGNvbnN0IG9mZnNldCA9IExBWU9VVF9QQVJBTVMuc3Vic2NlbmUubWV0YS5leHRyYWN0WE9mZnNldDtcblxuICBsZXQgYXV4V2lkdGggPSAwO1xuICBpZiAoaGFzSW5FeHRyYWN0KSB7XG4gICAgYXV4V2lkdGggKz0gcmVuZGVyTm9kZS5vdXRFeHRyYWN0Qm94LndpZHRoO1xuICB9XG4gIGlmIChoYXNPdXRFeHRyYWN0KSB7XG4gICAgYXV4V2lkdGggKz0gcmVuZGVyTm9kZS5vdXRFeHRyYWN0Qm94LndpZHRoO1xuICB9XG5cbiAgaWYgKGhhc0luRXh0cmFjdCkge1xuICAgIGxldCBpbkV4dHJhY3RYID0gcmVuZGVyTm9kZS5jb3JlQm94LndpZHRoO1xuICAgIGlmIChhdXhXaWR0aCA8IE1JTl9BVVhfV0lEVEgpIHtcbiAgICAgIGluRXh0cmFjdFggPSBpbkV4dHJhY3RYIC0gTUlOX0FVWF9XSURUSCArXG4gICAgICAgIHJlbmRlck5vZGUuaW5FeHRyYWN0Qm94LndpZHRoIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5FeHRyYWN0WCA9IGluRXh0cmFjdFggLVxuICAgICAgICByZW5kZXJOb2RlLmluRXh0cmFjdEJveC53aWR0aCAvIDIgLSByZW5kZXJOb2RlLm91dEV4dHJhY3RCb3gud2lkdGggLVxuICAgICAgICAoaGFzT3V0RXh0cmFjdCA/IG9mZnNldCA6IDApO1xuICAgIH1cbiAgICB0cmFuc2xhdGUoXG4gICAgICBzZWxlY3RDaGlsZChzY2VuZUdyb3VwLCAnZycsIENsYXNzLlNjZW5lLklORVhUUkFDVCksIGluRXh0cmFjdFgsXG4gICAgICB5VHJhbnNsYXRlKTtcbiAgfVxuXG4gIC8vIG91dC1leHRyYWN0XG4gIGlmIChoYXNPdXRFeHRyYWN0KSB7XG4gICAgbGV0IG91dEV4dHJhY3RYID0gcmVuZGVyTm9kZS5jb3JlQm94LndpZHRoO1xuICAgIGlmIChhdXhXaWR0aCA8IE1JTl9BVVhfV0lEVEgpIHtcbiAgICAgIG91dEV4dHJhY3RYID0gb3V0RXh0cmFjdFggLSBNSU5fQVVYX1dJRFRIICtcbiAgICAgICAgcmVuZGVyTm9kZS5vdXRFeHRyYWN0Qm94LndpZHRoIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0RXh0cmFjdFggLT0gcmVuZGVyTm9kZS5vdXRFeHRyYWN0Qm94LndpZHRoIC8gMjtcbiAgICB9XG5cbiAgICB0cmFuc2xhdGUoXG4gICAgICBzZWxlY3RDaGlsZChzY2VuZUdyb3VwLCAnZycsIENsYXNzLlNjZW5lLk9VVEVYVFJBQ1QpLCBvdXRFeHRyYWN0WCxcbiAgICAgIHlUcmFuc2xhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUoc2VsZWN0aW9uLCB4MDogbnVtYmVyLCB5MDogbnVtYmVyKSB7XG4gIC8vIElmIGl0IGlzIGFscmVhZHkgcGxhY2VkIG9uIHRoZSBzY3JlZW4sIG1ha2UgaXQgYSB0cmFuc2l0aW9uLlxuICBpZiAoc2VsZWN0aW9uLmF0dHIoJ3RyYW5zZm9ybScpICE9IG51bGwpIHtcbiAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24udHJhbnNpdGlvbigncG9zaXRpb24nKTtcbiAgfVxuICBzZWxlY3Rpb24uYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgeDAgKyAnLCcgKyB5MCArICcpJyk7XG59XG5cbi8qKlxuICogSGVscGVyIGZvciBzZXR0aW5nIHBvc2l0aW9uIG9mIGEgc3ZnIGV4cGFuZC9jb2xsYXBzZSBidXR0b25cbiAqIEBwYXJhbSBidXR0b24gY29udGFpbmVyIGdyb3VwXG4gKiBAcGFyYW0gcmVuZGVyTm9kZSB0aGUgcmVuZGVyIG5vZGUgb2YgdGhlIGdyb3VwIG5vZGUgdG8gcG9zaXRpb25cbiAqICAgICAgICB0aGUgYnV0dG9uIG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25CdXR0b24oYnV0dG9uLCByZW5kZXJOb2RlOiBSZW5kZXJOb2RlSW5mbykge1xuICBjb25zdCBjeCA9IGNvbXB1dGVDWFBvc2l0aW9uT2ZOb2RlU2hhcGUocmVuZGVyTm9kZSk7XG4gIC8vIFBvc2l0aW9uIHRoZSBidXR0b24gaW4gdGhlIHRvcC1yaWdodCBjb3JuZXIgb2YgdGhlIGdyb3VwIG5vZGUsXG4gIC8vIHdpdGggc3BhY2UgZ2l2ZW4gdGhlIGRyYXcgdGhlIGJ1dHRvbiBpbnNpZGUgb2YgdGhlIGNvcm5lci5cbiAgY29uc3Qgd2lkdGggPSByZW5kZXJOb2RlLmV4cGFuZGVkID9cbiAgICByZW5kZXJOb2RlLndpZHRoIDogcmVuZGVyTm9kZS5jb3JlQm94LndpZHRoO1xuICBjb25zdCBoZWlnaHQgPSByZW5kZXJOb2RlLmV4cGFuZGVkID9cbiAgICByZW5kZXJOb2RlLmhlaWdodCA6IHJlbmRlck5vZGUuY29yZUJveC5oZWlnaHQ7XG4gIGxldCB4ID0gY3ggKyB3aWR0aCAvIDIgLSA2O1xuICBsZXQgeSA9IHJlbmRlck5vZGUueSAtIGhlaWdodCAvIDIgKyA2O1xuXG4gIC8vIEZvciB1bmV4cGFuZGVkIHNlcmllcyBub2RlcywgdGhlIGJ1dHRvbiBoYXMgc3BlY2lhbCBwbGFjZW1lbnQgZHVlXG4gIC8vIHRvIHRoZSB1bmlxdWUgdmlzdWFscyBvZiB0aGlzIGdyb3VwIG5vZGUuXG4gIGlmIChyZW5kZXJOb2RlLm5vZGUudHlwZSA9PT0gTm9kZVR5cGUuU0VSSUVTICYmICFyZW5kZXJOb2RlLmV4cGFuZGVkKSB7XG4gICAgeCArPSAxMDtcbiAgICB5IC09IDI7XG4gIH1cbiAgY29uc3QgdHJhbnNsYXRlU3RyID0gJ3RyYW5zbGF0ZSgnICsgeCArICcsJyArIHkgKyAnKSc7XG4gIGJ1dHRvbi5zZWxlY3RBbGwoJ3BhdGgnKS50cmFuc2l0aW9uKCkuYXR0cigndHJhbnNmb3JtJywgdHJhbnNsYXRlU3RyKTtcbiAgYnV0dG9uLnNlbGVjdCgnY2lyY2xlJykudHJhbnNpdGlvbigpLmF0dHIoXG4gICAgeyBjeDogeCwgY3k6IHksIHI6IExBWU9VVF9QQVJBTVMubm9kZVNpemUubWV0YS5leHBhbmRCdXR0b25SYWRpdXMgfSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZvciBzZXR0aW5nIHBvc2l0aW9uIG9mIGEgc3ZnIGVsbGlwc2VcbiAqIEBwYXJhbSBlbGxpcHNlIGVsbGlwc2UgdG8gc2V0IHBvc2l0aW9uIG9mLlxuICogQHBhcmFtIGN4IENlbnRlciB4LlxuICogQHBhcmFtIGN5IENlbnRlciB4LlxuICogQHBhcmFtIHdpZHRoIFdpZHRoIHRvIHNldC5cbiAqIEBwYXJhbSBoZWlnaHQgSGVpZ2h0IHRvIHNldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aW9uRWxsaXBzZShlbGxpcHNlLCBjeDogbnVtYmVyLCBjeTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICBlbGxpcHNlLnRyYW5zaXRpb24oKVxuICAuYXR0cignY3gnLCBjeClcbiAgLmF0dHIoJ2N5JywgY3kpXG4gIC5hdHRyKCdyeCcsIHdpZHRoIC8gMilcbiAgLmF0dHIoJ3J5JywgaGVpZ2h0IC8gMik7XG59XG5cbi8qKlxuICogSGVscGVyIGZvciBzZXR0aW5nIHBvc2l0aW9uIG9mIGEgc3ZnIHJlY3RcbiAqIEBwYXJhbSByZWN0IEEgZDMgc2VsZWN0aW9uIG9mIHJlY3QocykgdG8gc2V0IHBvc2l0aW9uIG9mLlxuICogQHBhcmFtIGN4IENlbnRlciB4LlxuICogQHBhcmFtIGN5IENlbnRlciB4LlxuICogQHBhcmFtIHdpZHRoIFdpZHRoIHRvIHNldC5cbiAqIEBwYXJhbSBoZWlnaHQgSGVpZ2h0IHRvIHNldC5cbiAqIEBwYXJhbSBzY2FsZSBzY2FsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25SZWN0KHJlY3QsIGN4OiBudW1iZXIsIGN5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogbnVtYmVyLCBzY2FsZSA9IDEpIHtcbiAgcmVjdC50cmFuc2l0aW9uKClcbiAgLmF0dHIoJ3N0eWxlJywgYHRyYW5zZm9ybTogc2NhbGUoJHsxIC8gc2NhbGV9KWApXG4gIC5hdHRyKCd4JywgKGN4IC0gd2lkdGggLyAyKSAqIHNjYWxlKVxuICAuYXR0cigneScsIChjeSAtIGhlaWdodCAvIDIpICogc2NhbGUpXG4gIC5hdHRyKCd3aWR0aCcsIHdpZHRoICogc2NhbGUpXG4gIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKiBzY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb2RlRWxlbWVudEJ5TmFtZShub2RlTmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBzZWxlY3QoJ1tkYXRhLW5hbWU9XCInICsgbm9kZU5hbWUgKyAnXCJdLicgKyBDbGFzcy5Ob2RlLkdST1VQKS5ub2RlKCk7XG59XG4iXX0=
