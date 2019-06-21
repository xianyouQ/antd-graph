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
import { NodeType, ROOT_NAME } from './interface';
import { computeCXPositionOfNodeShape } from './layout';
import { buildGroupScene, positionButton, positionRect, selectChild, selectOrCreateChild, translate, Class } from './scene';
import * as d3 from 'd3';
import * as _ from 'lodash';
/**
 * @param {?} sceneGroup
 * @param {?} nodeData
 * @param {?} sceneElement
 * @return {?}
 */
export function buildGroupNode(sceneGroup, nodeData, sceneElement) {
    /** @type {?} */
    var container = selectOrCreateChild(sceneGroup, 'g', Class.Node.CONTAINER);
    // Select all children and join with data.
    // (Note that all children of g.nodes are g.node)
    /** @type {?} */
    var nodeGroups = ((/** @type {?} */ (container))).selectAll(function () {
        return this.childNodes;
    })
        .data(nodeData, function (d) {
        // make sure that we don't have to swap shape type
        return d.node.name + ':' + d.node.type;
    });
    // ENTER
    nodeGroups.enter()
        .append('g')
        .attr('data-name', function (d) { return d.node.name; })
        .each(function (d) {
        /** @type {?} */
        var nodeGroup = d3.select(this);
        // index node group for quick stylizing
        sceneElement.addNodeGroup(d.node.name, nodeGroup);
    })
        .merge(nodeGroups)
        // ENTER + UPDATE
        .attr('class', function (d) { return Class.Node.GROUP + ' ' + nodeClass(d); })
        .each(function (d) {
        /** @type {?} */
        var nodeGroup = d3.select(this);
        // Build .shape first (background of the node).
        /** @type {?} */
        var shape = buildShape(nodeGroup, d, Class.Node.SHAPE, sceneElement);
        if (d.node.isGroupNode) {
            // addButton(shape, d, sceneElement);
            // const label = labelBuild(nodeGroup, d, sceneElement);
            // addInteraction(label, d, sceneElement, d.node.type === NodeType.META);
            // const groupSubtitle = subtitleBuild(nodeGroup, d);
            // addInteraction(groupSubtitle, d, sceneElement);
        }
        sceneElement.addNodePortal(shape, d);
        addInteraction(shape, d, sceneElement);
        // Build subscene on the top.
        subsceneBuild(nodeGroup, (/** @type {?} */ (d)), sceneElement);
        // Build label last. Should be on top of everything else.
        // Do not add interaction to metanode labels as they live inside the
        // metanode shape which already has the same interactions.
        stylize(nodeGroup, d, sceneElement);
        position(nodeGroup, d);
    });
    // EXIT
    nodeGroups.exit()
        .each(function (d) {
        // remove all indices on remove
        sceneElement.removeNodeGroup(d.node.name);
        sceneElement.removeNodeGroupPortal(d);
    })
        .remove();
    return nodeGroups;
}
/**
 * @param {?} d
 * @return {?}
 */
export function nodeClass(d) {
    switch (d.node.type) {
        case NodeType.OP:
            return Class.OPNODE;
        case NodeType.META:
            return Class.METANODE;
        case NodeType.SERIES:
            return Class.SERIESNODE;
        case NodeType.BRIDGE:
            return Class.BRIDGENODE;
        case NodeType.ELLIPSIS:
            return Class.ELLIPSISNODE;
    }
    throw Error('Unrecognized node type: ' + d.node.type);
}
/**
 * Select or append/insert shape for a node and assign renderNode
 * as the shape's data.
 * @param {?} nodeGroup
 * @param {?} d
 * @param {?} className
 * @param {?} sceneElement
 * @return {?}
 */
export function buildShape(nodeGroup, d, className, sceneElement) {
    // Create a group to house the underlying visual elements.
    /** @type {?} */
    var shapeGroup = selectOrCreateChild(nodeGroup, 'g', className);
    // TODO: DOM structure should be templated in HTML somewhere, not JS.
    switch (d.node.type) {
        case NodeType.OP:
            selectOrCreateChild(shapeGroup, 'foreignObject', Class.Node.COLOR_TARGET)
                .attr('rx', d.radius).attr('ry', d.radius);
            break;
        case NodeType.BRIDGE:
            selectOrCreateChild(shapeGroup, 'rect', Class.Node.COLOR_TARGET)
                .attr('rx', d.radius).attr('ry', d.radius);
            break;
        case NodeType.META:
            selectOrCreateChild(shapeGroup, 'foreignObject', Class.Node.COLOR_TARGET)
                .attr('rx', d.radius).attr('ry', d.radius);
            break;
        default:
            throw Error('Unrecognized node type: ' + d.node.type);
    }
    return shapeGroup;
}
/**
 * Add an expand/collapse button to a group node
 *
 * @param {?} selection The group node selection.
 * @param {?} d Info about the node being rendered.
 * @param {?} sceneElement <tf-graph-scene> polymer element.
 * @return {?}
 */
function addButton(selection, d, sceneElement) {
    /** @type {?} */
    var group = selectOrCreateChild(selection, 'g', Class.Node.BUTTON_CONTAINER);
    selectOrCreateChild(group, 'circle', Class.Node.BUTTON_CIRCLE);
    selectOrCreateChild(group, 'path', Class.Node.EXPAND_BUTTON)
        .attr('d', 'M0,-2.2 V2.2 M-2.2,0 H2.2');
    selectOrCreateChild(group, 'path', Class.Node.COLLAPSE_BUTTON)
        .attr('d', 'M-2.2,0 H2.2');
    ((/** @type {?} */ (group))).on('click', function (_d) {
        // Stop this event's propagation so that it isn't also considered a
        // node-select.
        ((/** @type {?} */ (d3.event))).stopPropagation();
        sceneElement.fire('node-toggle-expand', { name: _d.node.name });
    });
    positionButton(group, d);
}
/**
 * Fire node-* events when the selection is interacted.
 *
 * @param {?} selection
 * @param {?} d
 * @param {?} sceneElement
 * @param {?=} disableInteraction When true, have the provided selection
 * ignore all pointer events. Used for text labels inside of metanodes, which
 * don't need interaction as their surrounding shape has interaction, and if
 * given interaction would cause conflicts with the expand/collapse button.
 * @return {?}
 */
function addInteraction(selection, d, sceneElement, disableInteraction) {
    if (disableInteraction) {
        selection.attr('pointer-events', 'none');
        return;
    }
    /** @type {?} */
    var clickWait = null;
    selection
        .on('dblclick', function (_d) {
        sceneElement.fire('node-toggle-expand', { name: _d.node.name });
    })
        .on('mouseover', function (_d) {
        // don't send mouseover over expanded group,
        // otherwise it is causing too much glitches
        if (sceneElement.isNodeExpanded(_d)) {
            return;
        }
        sceneElement.fire('node-highlight', { name: _d.node.name });
    })
        .on('mouseout', function (_d) {
        // don't send mouseover over expanded group,
        // otherwise it is causing too much glitches
        if (sceneElement.isNodeExpanded(_d)) {
            return;
        }
        sceneElement.fire('node-unhighlight', { name: _d.node.name });
    })
        .on('click', function (_d) {
        // Stop this event's propagation so that it isn't also considered
        // a graph-select.
        ((/** @type {?} */ (d3.event))).stopPropagation();
        if (clickWait) {
            clearTimeout(clickWait);
            clickWait = null;
        }
        else {
            clickWait = setTimeout(function () {
                sceneElement.fire('node-select', { name: _d.node.name });
                clickWait = null;
            }, 300);
        }
    });
}
/**
 * Update or remove the subscene of a render group node depending on whether it
 * is a expanded. If the node is not a group node, this method has no effect.
 *
 * @param {?} nodeGroup selection of the container
 * @param {?} renderNodeInfo the render information for the node.
 * @param {?} sceneElement <tf-graph-scene> polymer element.
 * @return {?} Selection of the subscene group, or null if node group does not have
 *        a subscene. Op nodes, bridge nodes and unexpanded group nodes will
 *        not have a subscene.
 */
function subsceneBuild(nodeGroup, renderNodeInfo, sceneElement) {
    if (renderNodeInfo.node.isGroupNode) {
        if (renderNodeInfo.expanded) {
            // Recursively buildDef the subscene.
            return buildGroupScene(nodeGroup, renderNodeInfo, sceneElement, Class.Subscene.GROUP);
        }
        // Clean out existing subscene if the node is not expanded.
        selectChild(nodeGroup, 'g', Class.Subscene.GROUP).remove();
    }
    return null;
}
/**
 * Set label position of a given node group
 * @param {?} nodeGroup
 * @param {?} cx
 * @param {?} cy
 * @param {?} yOffset
 * @return {?}
 */
function labelPosition(nodeGroup, cx, cy, yOffset) {
    selectChild(nodeGroup, 'text', Class.Node.LABEL)
        .transition()
        .attr('x', cx)
        .attr('y', cy + yOffset);
}
/**
 * @param {?} nodeGroup
 * @param {?} cx
 * @param {?} cy
 * @param {?} yOffset
 * @return {?}
 */
function labelSubtitlePosition(nodeGroup, cx, cy, yOffset) {
    selectChild(nodeGroup, 'text', Class.Node.SUB_TITLE)
        .transition()
        .attr('x', cx)
        .attr('y', cy + yOffset);
}
/**
 * Modify node style by toggling class and assign attributes (only for things
 * that can't be done in css).
 * @param {?} nodeGroup
 * @param {?} renderInfo
 * @param {?} sceneElement
 * @param {?=} className
 * @return {?}
 */
export function stylize(nodeGroup, renderInfo, sceneElement, className) {
    className = className || Class.Node.SHAPE;
    /** @type {?} */
    var isHighlighted = sceneElement.isNodeHighlighted(renderInfo.node.name);
    /** @type {?} */
    var isSelected = sceneElement.isNodeSelected(renderInfo.node.name);
    /** @type {?} */
    var isExtract = renderInfo.isInExtract ||
        renderInfo.isOutExtract;
    /** @type {?} */
    var isExpanded = renderInfo.expanded && className !== Class.Annotation.NODE;
    /** @type {?} */
    var isFadedOut = renderInfo.isFadedOut;
    nodeGroup.classed('highlighted', isHighlighted);
    nodeGroup.classed('selected', isSelected);
    nodeGroup.classed('extract', isExtract);
    nodeGroup.classed('expanded', isExpanded);
    nodeGroup.classed('faded', isFadedOut);
    // Main node always exists here and it will be reached before subscene,
    // so d3 selection is fine here.
    /** @type {?} */
    var node = nodeGroup.select('.' + className + ' .' + Class.Node.COLOR_TARGET);
    // TODO set color
    // const fillColor = getFillForNode(sceneElement.templateIndex,
    //   ColorBy[sceneElement.colorBy.toUpperCase()],
    //   renderInfo, isExpanded);
    // node.style('fill', fillColor);
    //
    // // Choose outline to be darker version of node color if the node is a single
    // // color and is not selected.
    // node.style('stroke', isSelected ? null : getStrokeForFill(fillColor));
}
/**
 * Modify node and its subscene and its label's positional attributes
 * @param {?} nodeGroup
 * @param {?} d
 * @return {?}
 */
function position(nodeGroup, d) {
    /** @type {?} */
    var shapeGroup = selectChild(nodeGroup, 'g', Class.Node.SHAPE);
    /** @type {?} */
    var cx = computeCXPositionOfNodeShape(d);
    switch (d.node.type) {
        case NodeType.OP: {
            /** @type {?} */
            var shape = selectChild(shapeGroup, 'foreignObject');
            positionRect(shape, cx, d.y, d.coreBox.width, d.coreBox.height);
            labelPosition(nodeGroup, cx, d.y, d.labelOffset);
            break;
        }
        case NodeType.META: {
            // position shape
            /** @type {?} */
            var shapes = shapeGroup.selectAll('foreignObject');
            if (d.expanded) {
                positionRect(shapes, d.x, d.y, d.width, d.height);
                subscenePosition(nodeGroup, d);
            }
            else {
                positionRect(shapes, cx, d.y, d.coreBox.width, d.coreBox.height);
                labelSubtitlePosition(nodeGroup, cx - d.width / 2 + 4, d.y, -d.height / 2 + 24);
            }
            labelPosition(nodeGroup, cx - d.width / 2 + 4, d.y, -d.height / 2 + 8);
            break;
        }
        case NodeType.SERIES: {
            /** @type {?} */
            var shape = selectChild(shapeGroup, 'use');
            if (d.expanded) {
                positionRect(shape, d.x, d.y, d.width, d.height);
                subscenePosition(nodeGroup, d);
                // put label on top
                labelPosition(nodeGroup, cx, d.y, -d.height / 2 + d.labelHeight / 2);
            }
            else {
                positionRect(shape, cx, d.y, d.coreBox.width, d.coreBox.height);
                labelPosition(nodeGroup, cx, d.y, d.labelOffset);
            }
            break;
        }
        case NodeType.BRIDGE: {
            // position shape
            // NOTE: In reality, these will not be visible, but it helps to put them
            // in the correct position for debugging purposes.
            /** @type {?} */
            var shape = selectChild(shapeGroup, 'rect');
            positionRect(shape, d.x, d.y, d.width, d.height);
            break;
        }
        default: {
            throw Error('Unrecognized node type: ' + d.node.type);
        }
    }
}
/**
 * Translate the subscene of the given node group
 * @param {?} nodeGroup
 * @param {?} d
 * @return {?}
 */
function subscenePosition(nodeGroup, d) {
    /** @type {?} */
    var x0 = d.x - d.width / 2.0 + d.paddingLeft;
    /** @type {?} */
    var y0 = d.y - d.height / 2.0 + d.paddingTop;
    /** @type {?} */
    var subscene = selectChild(nodeGroup, 'g', Class.Subscene.GROUP);
    translate(subscene, x0, y0);
}
/**
 * @param {?} renderGraphInfo
 * @return {?}
 */
export function traceInputs(renderGraphInfo) {
    d3.selectAll('.input-highlight').classed('input-highlight', false);
    d3.selectAll('.start-output-edge').classed('start-output-edge', false);
    d3.selectAll('.output-edge-highlight').classed('output-edge-highlight', false);
    d3.selectAll('.non-input').classed('non-input', false);
    d3.selectAll('.input-parent').classed('input-parent', false);
    d3.selectAll('.input-child').classed('input-child', false);
    d3.selectAll('.input-edge-highlight').classed('input-edge-highlight', false);
    d3.selectAll('.non-input-edge-highlight')
        .classed('non-input-edge-highlight', false);
    d3.selectAll('.input-highlight-selected')
        .classed('input-highlight-selected', false);
    // 获取当前选择的节点，如果没有或 traceInputs 被禁用则返回
    /** @type {?} */
    var selectedNodeSelectorString = 'g.node.selected,g.op.selected';
    /** @type {?} */
    var nodeSelection = d3.select(selectedNodeSelectorString);
    /** @type {?} */
    var currentNode;
    if (renderGraphInfo && renderGraphInfo.traceInputs &&
        nodeSelection.nodes().length) {
        currentNode = nodeSelection.nodes()[0];
    }
    else {
        return;
    }
    /** @type {?} */
    var nodeName = currentNode.getAttribute('data-name');
    /** @type {?} */
    var opNodes = _getAllContainedOpNodes(nodeName, renderGraphInfo);
    /** @type {?} */
    var allTracedNodes = {};
    _.each(opNodes, function (nodeInstance) {
        allTracedNodes =
            traceAllInputsOfOpNode(renderGraphInfo, nodeInstance, allTracedNodes);
    });
    d3.selectAll(selectedNodeSelectorString)
        // Remove the input-highlight from the selected node.
        .classed('input-highlight', false)
        // Add input-highlight-selected class to selected node, which allows
        // treating the selected not as a special case of an input node.
        .classed('input-highlight-selected', true);
    // Highlight all parent nodes of each OpNode as input parent to allow
    // specific highlighting.
    /** @type {?} */
    var highlightedNodes = Object.keys(allTracedNodes);
    /** @type {?} */
    var visibleNodes = _findVisibleParentsFromOpNodes(renderGraphInfo, highlightedNodes);
    _markParentsOfNodes(visibleNodes);
    // Attach class to all non-input nodes and edges for styling.
    d3.selectAll('g.node:not(.selected):not(.input-highlight)' +
        ':not(.input-parent):not(.input-children)')
        .classed('non-input', true)
        .each(function (d) {
        // Mark all nodes with the specified name as non-inputs. This
        // results in Annotation nodes which are attached to inputs to be
        // tagged as well.
        if (d) {
            d3.selectAll("[data-name=\"" + d.node.name + "\"]").classed('non-input', true);
        }
    });
    d3.selectAll('g.edge:not(.input-edge-highlight)')
        .classed('non-input-edge-highlight', true);
}
/**
 * @param {?} renderGraphInfo
 * @param {?} node
 * @param {?} edgesSelector
 * @return {?}
 */
export function traceFirstOutputsOfOpNode(renderGraphInfo, node, edgesSelector) {
    console.log(node);
    edgesSelector.each(function (d) {
        if (d.v === node.name) {
            /** @type {?} */
            var edge = d3.select(this);
            edge.classed('start-output-edge', true);
            edge.classed('output-edge-highlight', true);
            /** @type {?} */
            var nextOpNode = renderGraphInfo.getRenderNodeByName(d.w);
            // console.log(nextOpNode);
            // if (nextOpNode) {
            //   _traceNextOutputOfNode(renderGraphInfo, nextOpNode.node, edgesSelector);
            // }
        }
    });
}
/**
 * Recursively find all op nodes contained by the node identified by the
 * provided name.
 * @param {?} nodeName The meta or op node of which the OpNode instances are
 * required.
 * @param {?} renderGraphInfo The rendered graph information object.
 * @return {?}
 */
export function _getAllContainedOpNodes(nodeName, renderGraphInfo) {
    /** @type {?} */
    var opNodes = [];
    // Get current node.
    /** @type {?} */
    var node = (/** @type {?} */ (renderGraphInfo.getNodeByName(nodeName)));
    if (node.isGroupNode) {
        // Otherwise, make recursive call for each node contained by the GroupNode.
        /** @type {?} */
        var childNodeNames = ((/** @type {?} */ (node))).metagraph.nodes();
        _.each(childNodeNames, function (childNodeName) {
            opNodes =
                opNodes.concat(_getAllContainedOpNodes(childNodeName, renderGraphInfo));
        });
    }
    else {
        opNodes.push(node);
    }
    return opNodes;
}
/**
 * @record
 */
function VisibleParent() { }
if (false) {
    /** @type {?} */
    VisibleParent.prototype.visibleParent;
    /** @type {?} */
    VisibleParent.prototype.opNodes;
}
/**
 * @param {?} renderGraphInfo
 * @param {?} startNode
 * @param {?} allTracedNodes
 * @return {?}
 */
export function traceAllInputsOfOpNode(renderGraphInfo, startNode, allTracedNodes) {
    // To prevent infinite loops due to cyclical relationships and improving
    // performance by tracing OpNode which is input to 2+ nodes only once.
    if (allTracedNodes[startNode.name]) {
        return allTracedNodes;
    }
    else {
        allTracedNodes[startNode.name] = true;
    }
    // Extract the inputs.
    /** @type {?} */
    var inputs = startNode.inputs;
    // Get visible parent.
    /** @type {?} */
    var currentVisibleParent = getVisibleParent(renderGraphInfo, startNode);
    // Mark as input node.
    d3.select(".node[data-name=\"" + currentVisibleParent.name + "\"]")
        .classed('input-highlight', true);
    // Find the visible parent of each input.
    /** @type {?} */
    var visibleInputs = {};
    _.each(inputs, function (nodeInstance) {
        /** @type {?} */
        var resolvedNode = renderGraphInfo.getNodeByName(nodeInstance.name);
        if (resolvedNode === undefined) {
            // Node could not be found in rendered Hierarchy, which happens when
            // tracing inputs of a SummaryNode.
            return;
        }
        /** @type {?} */
        var visibleParent = getVisibleParent(renderGraphInfo, resolvedNode);
        // Append OpNode to visible parent entry.
        /** @type {?} */
        var visibleInputsEntry = visibleInputs[visibleParent.name];
        if (visibleInputsEntry) {
            visibleInputsEntry.opNodes.push(resolvedNode);
        }
        else { // Create new entry.
            visibleInputs[visibleParent.name] = (/** @type {?} */ ({
                visibleParent: visibleParent,
                opNodes: [resolvedNode]
            }));
        }
    });
    // Find all parents of the start node.
    /** @type {?} */
    var startNodeParents = {};
    /** @type {?} */
    var indexedStartNodeParents = [currentVisibleParent];
    startNodeParents[currentVisibleParent.name] = {
        traced: false,
        index: 0,
        connectionEndpoints: []
    };
    /** @type {?} */
    var currentNode = (/** @type {?} */ (currentVisibleParent));
    for (var index = 1; currentNode.name !== ROOT_NAME; index++) {
        currentNode = currentNode.parentNode;
        startNodeParents[currentNode.name] = {
            traced: false,
            index: index,
            connectionEndpoints: []
        };
        indexedStartNodeParents[index] = currentNode;
    }
    // Find first mutual parent of each input node and highlight connection.
    _.forOwn(visibleInputs, function (visibleParentInfo, key) {
        /** @type {?} */
        var nodeInstance = visibleParentInfo.visibleParent;
        // Make recursive call for each input-OpNode contained by the visible
        // parent.
        _.each(visibleParentInfo.opNodes, function (opNode) {
            allTracedNodes =
                traceAllInputsOfOpNode(renderGraphInfo, opNode, allTracedNodes);
        });
        if (nodeInstance.name !== currentVisibleParent.name) {
            _createVisibleTrace(nodeInstance, startNodeParents, indexedStartNodeParents);
        }
    });
    return allTracedNodes;
}
/**
 * Find the parent of the passed in op node which is expanded. This is done
 * by going through all parents until the parent's parent is expanded, thus
 * finding the first unexpanded parent which is rendered on the screen.
 * @param {?} renderGraphInfo The graph info object used to gain access to the
 * render info of the parents.
 * @param {?} currentNode The node whose parent is to be found.
 * @return {?} Node
 */
export function getVisibleParent(renderGraphInfo, currentNode) {
    /** @type {?} */
    var found = false;
    /** @type {?} */
    var currentParent = currentNode;
    while (!found) {
        // Get parent element, to extract name.
        currentNode = currentParent;
        currentParent = currentNode.parentNode;
        if (currentParent === undefined) {
            found = true;
        }
        else {
            /** @type {?} */
            var renderNode = renderGraphInfo.getRenderNodeByName(currentParent.name);
            // Found if node is rendered on the screen (renderNode truthy), and
            // the parent is either expanded (i.e. it is a metanode or seriesnode)
            // or the parent is an OpNode in which case currentNode is an embedded
            // node which has another OpNode as parent.
            if (renderNode &&
                (renderNode.expanded)) {
                found = true;
            }
        }
    } // Close while loop.
    return currentNode;
}
/**
 * Creates map { [name: string] -> Node } of all visible / rendered parents
 * of the nodes identified by the node names passed in.
 *
 * @param {?} renderGraphInfo The information on the rendered graph.
 * @param {?} nodeNames String array of node names.
 * @return {?}
 */
function _findVisibleParentsFromOpNodes(renderGraphInfo, nodeNames) {
    /** @type {?} */
    var visibleParents = {};
    _.each(nodeNames, function (nodeName) {
        /** @type {?} */
        var currentNode = renderGraphInfo.getNodeByName(nodeName);
        /** @type {?} */
        var visibleParent = getVisibleParent(renderGraphInfo, currentNode);
        visibleParents[visibleParent.name] = visibleParent;
    });
    return visibleParents;
}
/**
 * Traverse through the parents of all nodes in the list and mark each
 * encountered node as input-parent.
 * @param {?} visibleNodes Map of input nodes, have to be visible/rendered when
 * called.
 * @return {?}
 */
function _markParentsOfNodes(visibleNodes) {
    _.forOwn(visibleNodes, function (nodeInstance) {
        // Mark all parents of the node as input-parents.
        /** @type {?} */
        var currentNode = nodeInstance;
        while (currentNode.name !== ROOT_NAME) {
            /** @type {?} */
            var renderedElementSelection = d3.select(".node[data-name=\"" + currentNode.name + "\"]");
            // Only mark the element as a parent node to an input if it is not
            // marked as input node itself.
            if (renderedElementSelection.nodes().length &&
                !renderedElementSelection.classed('input-highlight') &&
                !renderedElementSelection.classed('selected') &&
                // OpNode only parent if start node is embedded node, in which case
                // the OpNode should be faded as well.
                !renderedElementSelection.classed('op')) {
                renderedElementSelection.classed('input-parent', true);
            }
            currentNode = currentNode.parentNode;
        }
    });
}
/**
 * Colors the edges to connect the passed node to the start node. This is
 * done by:
 *
 * a) Finding the first (visible) common parent in the rendered
 * hierarchy.
 * NB: There are 2 types of connections:
 * 1) Direct connections between node A
 * and B, marked below as II,
 * 2) Connections from any node A to its parent, A'. Marked below as I and III.
 * For type 2 connection you need to know the inner-nested node, the
 * direct parent, and the ultimate destination of the connection.
 *
 *  A_parent      B_parent
 * +--------+    +---------+
 * |        |    |         |
 * |  +--+ I| II |III+--+  |
 * |  |A +---------->+B |  |
 * |  +--+  |    |   +--+  |
 * |        |    |         |
 * +--------+    +---------+
 *
 *
 * b) Highlighting the direct connection between the parents of A and B,
 * called A_parent and B_parent, s.t. A_parent and B_parent are children of the
 * mutual parent of A and B found in a), marked above as II.
 *
 * c) Highlighting the connection from A to A_parent and B to B_parent
 * (through all layers of parents between A and A_parent and B and B_parent,
 * respectively). Marked above as I and III.
 *
 * @param {?} nodeInstance The instance of the node to use as destination node, B.
 * @param {?} startNodeParents Map of startNodeParent names to information objects
 * about the parent.
 * @param {?} indexedStartNodeParents An array of all parents of the start node.
 * This is required to find the child of the mutual parent which is a parent
 * of the start node.
 * @return {?}
 */
function _createVisibleTrace(nodeInstance, startNodeParents, indexedStartNodeParents) {
    /** @type {?} */
    var currentNode = nodeInstance;
    /** @type {?} */
    var previousNode = nodeInstance;
    // Ascend through parents until a mutual parent is found with the start
    // node.
    /** @type {?} */
    var destinationParentPairs = [];
    while (!startNodeParents[currentNode.name]) {
        if (previousNode.name !== currentNode.name) {
            destinationParentPairs.push([previousNode, currentNode]);
        }
        previousNode = currentNode;
        currentNode = currentNode.parentNode;
    }
    // Connection between nodes is drawn between the parents of each
    // respective node, both of which share the mutual parent.
    /** @type {?} */
    var startNodeIndex = startNodeParents[currentNode.name].index;
    /** @type {?} */
    var startNodeName = indexedStartNodeParents[Math.max(startNodeIndex - 1, 0)].name;
    /** @type {?} */
    var startNodeTopParentName = startNodeName;
    /** @type {?} */
    var targetNodeTopParentName = previousNode.name;
    /** @type {?} */
    var endNodeName = previousNode.name;
    d3.selectAll("[data-edge=\"" + endNodeName + "--" + startNodeName + "\"]")
        .classed('input-edge-highlight', true);
    // Trace up the parents of the input.
    _.each(destinationParentPairs, function (value) {
        /** @type {?} */
        var inner = value[0];
        /** @type {?} */
        var outer = value[1];
        /** @type {?} */
        var edgeSelector = "[data-edge=\"" + inner.name + "--" + startNodeTopParentName +
            ("~~" + outer.name + "~~OUT\"]");
        d3.selectAll(edgeSelector).classed('input-edge-highlight', true);
    });
    // Trace up the parents of the start node.
    for (var index = 1; index < startNodeIndex; index++) {
        /** @type {?} */
        var inner = indexedStartNodeParents[index - 1];
        /** @type {?} */
        var outer = indexedStartNodeParents[index];
        /** @type {?} */
        var edgeSelector = "[data-edge=\"" + targetNodeTopParentName + "~~" + outer.name +
            ("~~IN--" + inner.name + "\"]");
        d3.selectAll(edgeSelector).classed('input-edge-highlight', true);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BuZy16b3Jyby9uZy1wbHVzL2dyYXBoLyIsInNvdXJjZXMiOlsiY29yZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxPQUFPLEVBQW1CLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbkUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXhELE9BQU8sRUFDTCxlQUFlLEVBQ2YsY0FBYyxFQUNkLFlBQVksRUFDWixXQUFXLEVBQ1gsbUJBQW1CLEVBQ25CLFNBQVMsRUFDVCxLQUFLLEVBQ04sTUFBTSxTQUFTLENBQUM7QUFFakIsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7QUFFNUIsTUFBTSxVQUFVLGNBQWMsQ0FBQyxVQUFVLEVBQUUsUUFBMEIsRUFBRSxZQUFZOztRQUMzRSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzs7OztRQUl0RSxVQUFVLEdBQ1IsQ0FBQyxtQkFBQSxTQUFTLEVBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFDLENBQUM7UUFDaEIsa0RBQWtEO1FBQ2xELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3pDLENBQUMsQ0FBQztJQUVWLFFBQVE7SUFDUixVQUFVLENBQUMsS0FBSyxFQUFFO1NBQ2pCLE1BQU0sQ0FBQyxHQUFHLENBQUM7U0FDWCxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQUEs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QWMsRUFBRSxLQUFLLEVBQUUsRUFBRTs7WUFDN0MsS0FBSyxHQUFHLHVCQUF1QixDQUFFLEtBQUssR0FBRyxDQUFDLENBQUU7O1lBQzVDLEtBQUssR0FBRyx1QkFBdUIsQ0FBRSxLQUFLLENBQUU7O1lBQ3hDLFlBQVksR0FBRyxrQkFBZSx1QkFBdUIsVUFBSyxLQUFLLENBQUMsSUFBTTthQUMxRSxXQUFTLEtBQUssQ0FBQyxJQUFJLFFBQUksQ0FBQTtRQUN6QixFQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNsRTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogVGhpcyBwcm9kdWN0IGNvbnRhaW5zIGEgbW9kaWZpZWQgdmVyc2lvbiBvZiAnVGVuc29yQm9hcmQgcGx1Z2luIGZvciBncmFwaHMnLFxuICogYSBBbmd1bGFyIGltcGxlbWVudGF0aW9uIG9mIG5lc3QtZ3JhcGggdmlzdWFsaXphdGlvblxuICpcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBuZy16b3Jyby1wbHVzIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgJ0xpY2Vuc2UnKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuICdBUyBJUycgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbi8vIHRzbGludDpkaXNhYmxlXG5cbmltcG9ydCB7IEJhc2VOb2RlIH0gZnJvbSAnLi9ncmFwaCc7XG5pbXBvcnQgeyBHcm91cE5vZGUsIE5vZGUsIE5vZGVUeXBlLCBST09UX05BTUUgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBjb21wdXRlQ1hQb3NpdGlvbk9mTm9kZVNoYXBlIH0gZnJvbSAnLi9sYXlvdXQnO1xuaW1wb3J0IHsgUmVuZGVyR3JhcGhJbmZvLCBSZW5kZXJHcm91cE5vZGVJbmZvLCBSZW5kZXJOb2RlSW5mbyB9IGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCB7XG4gIGJ1aWxkR3JvdXBTY2VuZSxcbiAgcG9zaXRpb25CdXR0b24sXG4gIHBvc2l0aW9uUmVjdCxcbiAgc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdE9yQ3JlYXRlQ2hpbGQsXG4gIHRyYW5zbGF0ZSxcbiAgQ2xhc3Ncbn0gZnJvbSAnLi9zY2VuZSc7XG5cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkR3JvdXBOb2RlKHNjZW5lR3JvdXAsIG5vZGVEYXRhOiBSZW5kZXJOb2RlSW5mb1tdLCBzY2VuZUVsZW1lbnQpIHtcbiAgY29uc3QgY29udGFpbmVyID0gc2VsZWN0T3JDcmVhdGVDaGlsZChzY2VuZUdyb3VwLCAnZycsIENsYXNzLk5vZGUuQ09OVEFJTkVSKTtcblxuICAvLyBTZWxlY3QgYWxsIGNoaWxkcmVuIGFuZCBqb2luIHdpdGggZGF0YS5cbiAgLy8gKE5vdGUgdGhhdCBhbGwgY2hpbGRyZW4gb2YgZy5ub2RlcyBhcmUgZy5ub2RlKVxuICBjb25zdCBub2RlR3JvdXBzID1cbiAgICAgICAgICAoY29udGFpbmVyIGFzIGFueSkuc2VsZWN0QWxsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoaWxkTm9kZXM7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZGF0YShub2RlRGF0YSwgKGQpID0+IHtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGRvbid0IGhhdmUgdG8gc3dhcCBzaGFwZSB0eXBlXG4gICAgICAgICAgICByZXR1cm4gZC5ub2RlLm5hbWUgKyAnOicgKyBkLm5vZGUudHlwZTtcbiAgICAgICAgICB9KTtcblxuICAvLyBFTlRFUlxuICBub2RlR3JvdXBzLmVudGVyKClcbiAgLmFwcGVuZCgnZycpXG4gIC5hdHRyKCdkYXRhLW5hbWUnLCBkID0+IGQubm9kZS5uYW1lKVxuICAuZWFjaChmdW5jdGlvbiAoZCkge1xuICAgIGNvbnN0IG5vZGVHcm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAvLyBpbmRleCBub2RlIGdyb3VwIGZvciBxdWljayBzdHlsaXppbmdcbiAgICBzY2VuZUVsZW1lbnQuYWRkTm9kZUdyb3VwKGQubm9kZS5uYW1lLCBub2RlR3JvdXApO1xuICB9KVxuICAubWVyZ2Uobm9kZUdyb3VwcylcbiAgLy8gRU5URVIgKyBVUERBVEVcbiAgLmF0dHIoJ2NsYXNzJywgZCA9PiBDbGFzcy5Ob2RlLkdST1VQICsgJyAnICsgbm9kZUNsYXNzKGQpKVxuICAuZWFjaChmdW5jdGlvbiAoZCkge1xuICAgIGNvbnN0IG5vZGVHcm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcblxuICAgIC8vIEJ1aWxkIC5zaGFwZSBmaXJzdCAoYmFja2dyb3VuZCBvZiB0aGUgbm9kZSkuXG4gICAgY29uc3Qgc2hhcGUgPSBidWlsZFNoYXBlKG5vZGVHcm91cCwgZCwgQ2xhc3MuTm9kZS5TSEFQRSwgc2NlbmVFbGVtZW50KTtcbiAgICBpZiAoZC5ub2RlLmlzR3JvdXBOb2RlKSB7XG4gICAgICAvLyBhZGRCdXR0b24oc2hhcGUsIGQsIHNjZW5lRWxlbWVudCk7XG4gICAgICAvLyBjb25zdCBsYWJlbCA9IGxhYmVsQnVpbGQobm9kZUdyb3VwLCBkLCBzY2VuZUVsZW1lbnQpO1xuICAgICAgLy8gYWRkSW50ZXJhY3Rpb24obGFiZWwsIGQsIHNjZW5lRWxlbWVudCwgZC5ub2RlLnR5cGUgPT09IE5vZGVUeXBlLk1FVEEpO1xuICAgICAgLy8gY29uc3QgZ3JvdXBTdWJ0aXRsZSA9IHN1YnRpdGxlQnVpbGQobm9kZUdyb3VwLCBkKTtcbiAgICAgIC8vIGFkZEludGVyYWN0aW9uKGdyb3VwU3VidGl0bGUsIGQsIHNjZW5lRWxlbWVudCk7XG5cbiAgICB9XG5cbiAgICBzY2VuZUVsZW1lbnQuYWRkTm9kZVBvcnRhbChzaGFwZSwgZCk7XG5cbiAgICBhZGRJbnRlcmFjdGlvbihzaGFwZSwgZCwgc2NlbmVFbGVtZW50KTtcblxuICAgIC8vIEJ1aWxkIHN1YnNjZW5lIG9uIHRoZSB0b3AuXG4gICAgc3Vic2NlbmVCdWlsZChub2RlR3JvdXAsIDxSZW5kZXJHcm91cE5vZGVJbmZvPmQsIHNjZW5lRWxlbWVudCk7XG5cbiAgICAvLyBCdWlsZCBsYWJlbCBsYXN0LiBTaG91bGQgYmUgb24gdG9wIG9mIGV2ZXJ5dGhpbmcgZWxzZS5cbiAgICAvLyBEbyBub3QgYWRkIGludGVyYWN0aW9uIHRvIG1ldGFub2RlIGxhYmVscyBhcyB0aGV5IGxpdmUgaW5zaWRlIHRoZVxuICAgIC8vIG1ldGFub2RlIHNoYXBlIHdoaWNoIGFscmVhZHkgaGFzIHRoZSBzYW1lIGludGVyYWN0aW9ucy5cblxuICAgIHN0eWxpemUobm9kZUdyb3VwLCBkLCBzY2VuZUVsZW1lbnQpO1xuICAgIHBvc2l0aW9uKG5vZGVHcm91cCwgZCk7XG4gIH0pO1xuXG4gIC8vIEVYSVRcbiAgbm9kZUdyb3Vwcy5leGl0KClcbiAgLmVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAvLyByZW1vdmUgYWxsIGluZGljZXMgb24gcmVtb3ZlXG4gICAgc2NlbmVFbGVtZW50LnJlbW92ZU5vZGVHcm91cChkLm5vZGUubmFtZSk7XG4gICAgc2NlbmVFbGVtZW50LnJlbW92ZU5vZGVHcm91cFBvcnRhbChkKTtcbiAgfSlcbiAgLnJlbW92ZSgpO1xuICByZXR1cm4gbm9kZUdyb3Vwcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVDbGFzcyhkOiBSZW5kZXJOb2RlSW5mbykge1xuICBzd2l0Y2ggKGQubm9kZS50eXBlKSB7XG4gICAgY2FzZSBOb2RlVHlwZS5PUDpcbiAgICAgIHJldHVybiBDbGFzcy5PUE5PREU7XG4gICAgY2FzZSBOb2RlVHlwZS5NRVRBOlxuICAgICAgcmV0dXJuIENsYXNzLk1FVEFOT0RFO1xuICAgIGNhc2UgTm9kZVR5cGUuU0VSSUVTOlxuICAgICAgcmV0dXJuIENsYXNzLlNFUklFU05PREU7XG4gICAgY2FzZSBOb2RlVHlwZS5CUklER0U6XG4gICAgICByZXR1cm4gQ2xhc3MuQlJJREdFTk9ERTtcbiAgICBjYXNlIE5vZGVUeXBlLkVMTElQU0lTOlxuICAgICAgcmV0dXJuIENsYXNzLkVMTElQU0lTTk9ERTtcbiAgfVxuICB0aHJvdyBFcnJvcignVW5yZWNvZ25pemVkIG5vZGUgdHlwZTogJyArIGQubm9kZS50eXBlKTtcbn1cblxuLyoqXG4gKiBTZWxlY3Qgb3IgYXBwZW5kL2luc2VydCBzaGFwZSBmb3IgYSBub2RlIGFuZCBhc3NpZ24gcmVuZGVyTm9kZVxuICogYXMgdGhlIHNoYXBlJ3MgZGF0YS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU2hhcGUobm9kZUdyb3VwLCBkLCBjbGFzc05hbWU6IHN0cmluZywgc2NlbmVFbGVtZW50KTogZDMuU2VsZWN0aW9uPGFueSwgYW55LCBhbnksIGFueT4ge1xuICAvLyBDcmVhdGUgYSBncm91cCB0byBob3VzZSB0aGUgdW5kZXJseWluZyB2aXN1YWwgZWxlbWVudHMuXG4gIGNvbnN0IHNoYXBlR3JvdXAgPSBzZWxlY3RPckNyZWF0ZUNoaWxkKG5vZGVHcm91cCwgJ2cnLCBjbGFzc05hbWUpO1xuICAvLyBUT0RPOiBET00gc3RydWN0dXJlIHNob3VsZCBiZSB0ZW1wbGF0ZWQgaW4gSFRNTCBzb21ld2hlcmUsIG5vdCBKUy5cbiAgc3dpdGNoIChkLm5vZGUudHlwZSkge1xuICAgIGNhc2UgTm9kZVR5cGUuT1A6XG4gICAgICBzZWxlY3RPckNyZWF0ZUNoaWxkKHNoYXBlR3JvdXAsICdmb3JlaWduT2JqZWN0JywgQ2xhc3MuTm9kZS5DT0xPUl9UQVJHRVQpXG4gICAgICAuYXR0cigncngnLCBkLnJhZGl1cykuYXR0cigncnknLCBkLnJhZGl1cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIE5vZGVUeXBlLkJSSURHRTpcbiAgICAgIHNlbGVjdE9yQ3JlYXRlQ2hpbGQoc2hhcGVHcm91cCwgJ3JlY3QnLCBDbGFzcy5Ob2RlLkNPTE9SX1RBUkdFVClcbiAgICAgIC5hdHRyKCdyeCcsIGQucmFkaXVzKS5hdHRyKCdyeScsIGQucmFkaXVzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgTm9kZVR5cGUuTUVUQTpcbiAgICAgIHNlbGVjdE9yQ3JlYXRlQ2hpbGQoc2hhcGVHcm91cCwgJ2ZvcmVpZ25PYmplY3QnLCBDbGFzcy5Ob2RlLkNPTE9SX1RBUkdFVClcbiAgICAgIC5hdHRyKCdyeCcsIGQucmFkaXVzKS5hdHRyKCdyeScsIGQucmFkaXVzKTtcblxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IEVycm9yKCdVbnJlY29nbml6ZWQgbm9kZSB0eXBlOiAnICsgZC5ub2RlLnR5cGUpO1xuICB9XG4gIHJldHVybiBzaGFwZUdyb3VwO1xufVxuXG4vKipcbiAqIEFkZCBhbiBleHBhbmQvY29sbGFwc2UgYnV0dG9uIHRvIGEgZ3JvdXAgbm9kZVxuICpcbiAqIEBwYXJhbSBzZWxlY3Rpb24gVGhlIGdyb3VwIG5vZGUgc2VsZWN0aW9uLlxuICogQHBhcmFtIGQgSW5mbyBhYm91dCB0aGUgbm9kZSBiZWluZyByZW5kZXJlZC5cbiAqIEBwYXJhbSBzY2VuZUVsZW1lbnQgPHRmLWdyYXBoLXNjZW5lPiBwb2x5bWVyIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFkZEJ1dHRvbihzZWxlY3Rpb24sIGQ6IFJlbmRlck5vZGVJbmZvLCBzY2VuZUVsZW1lbnQpIHtcbiAgY29uc3QgZ3JvdXAgPVxuICAgICAgICAgIHNlbGVjdE9yQ3JlYXRlQ2hpbGQoc2VsZWN0aW9uLCAnZycsIENsYXNzLk5vZGUuQlVUVE9OX0NPTlRBSU5FUik7XG4gIHNlbGVjdE9yQ3JlYXRlQ2hpbGQoZ3JvdXAsICdjaXJjbGUnLCBDbGFzcy5Ob2RlLkJVVFRPTl9DSVJDTEUpO1xuICBzZWxlY3RPckNyZWF0ZUNoaWxkKGdyb3VwLCAncGF0aCcsIENsYXNzLk5vZGUuRVhQQU5EX0JVVFRPTilcbiAgLmF0dHIoJ2QnLCAnTTAsLTIuMiBWMi4yIE0tMi4yLDAgSDIuMicpO1xuICBzZWxlY3RPckNyZWF0ZUNoaWxkKGdyb3VwLCAncGF0aCcsIENsYXNzLk5vZGUuQ09MTEFQU0VfQlVUVE9OKVxuICAuYXR0cignZCcsICdNLTIuMiwwIEgyLjInKTtcbiAgKGdyb3VwIGFzIGFueSkub24oJ2NsaWNrJywgKF9kOiBhbnkpID0+IHtcbiAgICAvLyBTdG9wIHRoaXMgZXZlbnQncyBwcm9wYWdhdGlvbiBzbyB0aGF0IGl0IGlzbid0IGFsc28gY29uc2lkZXJlZCBhXG4gICAgLy8gbm9kZS1zZWxlY3QuXG4gICAgKDxFdmVudD5kMy5ldmVudCkuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgc2NlbmVFbGVtZW50LmZpcmUoJ25vZGUtdG9nZ2xlLWV4cGFuZCcsIHsgbmFtZTogX2Qubm9kZS5uYW1lIH0pO1xuICB9KTtcbiAgcG9zaXRpb25CdXR0b24oZ3JvdXAsIGQpO1xufVxuXG5cbi8qKlxuICogRmlyZSBub2RlLSogZXZlbnRzIHdoZW4gdGhlIHNlbGVjdGlvbiBpcyBpbnRlcmFjdGVkLlxuICpcbiAqIEBwYXJhbSBkaXNhYmxlSW50ZXJhY3Rpb24gV2hlbiB0cnVlLCBoYXZlIHRoZSBwcm92aWRlZCBzZWxlY3Rpb25cbiAqIGlnbm9yZSBhbGwgcG9pbnRlciBldmVudHMuIFVzZWQgZm9yIHRleHQgbGFiZWxzIGluc2lkZSBvZiBtZXRhbm9kZXMsIHdoaWNoXG4gKiBkb24ndCBuZWVkIGludGVyYWN0aW9uIGFzIHRoZWlyIHN1cnJvdW5kaW5nIHNoYXBlIGhhcyBpbnRlcmFjdGlvbiwgYW5kIGlmXG4gKiBnaXZlbiBpbnRlcmFjdGlvbiB3b3VsZCBjYXVzZSBjb25mbGljdHMgd2l0aCB0aGUgZXhwYW5kL2NvbGxhcHNlIGJ1dHRvbi5cbiAqL1xuZnVuY3Rpb24gYWRkSW50ZXJhY3Rpb24oc2VsZWN0aW9uLCBkOiBSZW5kZXJOb2RlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lRWxlbWVudCwgZGlzYWJsZUludGVyYWN0aW9uPzogYm9vbGVhbikge1xuICBpZiAoZGlzYWJsZUludGVyYWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgY2xpY2tXYWl0ID0gbnVsbDtcbiAgc2VsZWN0aW9uXG4gIC5vbignZGJsY2xpY2snLFxuICAgIF9kID0+IHtcbiAgICAgIHNjZW5lRWxlbWVudC5maXJlKCdub2RlLXRvZ2dsZS1leHBhbmQnLCB7IG5hbWU6IF9kLm5vZGUubmFtZSB9KTtcbiAgICB9KVxuICAub24oJ21vdXNlb3ZlcicsXG4gICAgX2QgPT4ge1xuICAgICAgLy8gZG9uJ3Qgc2VuZCBtb3VzZW92ZXIgb3ZlciBleHBhbmRlZCBncm91cCxcbiAgICAgIC8vIG90aGVyd2lzZSBpdCBpcyBjYXVzaW5nIHRvbyBtdWNoIGdsaXRjaGVzXG4gICAgICBpZiAoc2NlbmVFbGVtZW50LmlzTm9kZUV4cGFuZGVkKF9kKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNjZW5lRWxlbWVudC5maXJlKCdub2RlLWhpZ2hsaWdodCcsIHsgbmFtZTogX2Qubm9kZS5uYW1lIH0pO1xuICAgIH0pXG4gIC5vbignbW91c2VvdXQnLFxuICAgIF9kID0+IHtcbiAgICAgIC8vIGRvbid0IHNlbmQgbW91c2VvdmVyIG92ZXIgZXhwYW5kZWQgZ3JvdXAsXG4gICAgICAvLyBvdGhlcndpc2UgaXQgaXMgY2F1c2luZyB0b28gbXVjaCBnbGl0Y2hlc1xuICAgICAgaWYgKHNjZW5lRWxlbWVudC5pc05vZGVFeHBhbmRlZChfZCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzY2VuZUVsZW1lbnQuZmlyZSgnbm9kZS11bmhpZ2hsaWdodCcsIHsgbmFtZTogX2Qubm9kZS5uYW1lIH0pO1xuICAgIH0pXG4gIC5vbignY2xpY2snLFxuICAgIF9kID0+IHtcbiAgICAgIC8vIFN0b3AgdGhpcyBldmVudCdzIHByb3BhZ2F0aW9uIHNvIHRoYXQgaXQgaXNuJ3QgYWxzbyBjb25zaWRlcmVkXG4gICAgICAvLyBhIGdyYXBoLXNlbGVjdC5cbiAgICAgICg8RXZlbnQ+ZDMuZXZlbnQpLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBpZiAoY2xpY2tXYWl0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChjbGlja1dhaXQpO1xuICAgICAgICBjbGlja1dhaXQgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xpY2tXYWl0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgc2NlbmVFbGVtZW50LmZpcmUoJ25vZGUtc2VsZWN0JywgeyBuYW1lOiBfZC5ub2RlLm5hbWUgfSk7XG4gICAgICAgICAgY2xpY2tXYWl0ID0gbnVsbDtcbiAgICAgICAgfSwgMzAwKTtcbiAgICAgIH1cblxuICAgIH0pO1xufVxuXG5cbi8qKlxuICogVXBkYXRlIG9yIHJlbW92ZSB0aGUgc3Vic2NlbmUgb2YgYSByZW5kZXIgZ3JvdXAgbm9kZSBkZXBlbmRpbmcgb24gd2hldGhlciBpdFxuICogaXMgYSBleHBhbmRlZC4gSWYgdGhlIG5vZGUgaXMgbm90IGEgZ3JvdXAgbm9kZSwgdGhpcyBtZXRob2QgaGFzIG5vIGVmZmVjdC5cbiAqXG4gKiBAcGFyYW0gbm9kZUdyb3VwIHNlbGVjdGlvbiBvZiB0aGUgY29udGFpbmVyXG4gKiBAcGFyYW0gcmVuZGVyTm9kZUluZm8gdGhlIHJlbmRlciBpbmZvcm1hdGlvbiBmb3IgdGhlIG5vZGUuXG4gKiBAcGFyYW0gc2NlbmVFbGVtZW50IDx0Zi1ncmFwaC1zY2VuZT4gcG9seW1lciBlbGVtZW50LlxuICogQHJldHVybiBTZWxlY3Rpb24gb2YgdGhlIHN1YnNjZW5lIGdyb3VwLCBvciBudWxsIGlmIG5vZGUgZ3JvdXAgZG9lcyBub3QgaGF2ZVxuICogICAgICAgIGEgc3Vic2NlbmUuIE9wIG5vZGVzLCBicmlkZ2Ugbm9kZXMgYW5kIHVuZXhwYW5kZWQgZ3JvdXAgbm9kZXMgd2lsbFxuICogICAgICAgIG5vdCBoYXZlIGEgc3Vic2NlbmUuXG4gKi9cbmZ1bmN0aW9uIHN1YnNjZW5lQnVpbGQobm9kZUdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJOb2RlSW5mbzogUmVuZGVyR3JvdXBOb2RlSW5mbywgc2NlbmVFbGVtZW50KSB7XG4gIGlmIChyZW5kZXJOb2RlSW5mby5ub2RlLmlzR3JvdXBOb2RlKSB7XG4gICAgaWYgKHJlbmRlck5vZGVJbmZvLmV4cGFuZGVkKSB7XG4gICAgICAvLyBSZWN1cnNpdmVseSBidWlsZERlZiB0aGUgc3Vic2NlbmUuXG4gICAgICByZXR1cm4gYnVpbGRHcm91cFNjZW5lKG5vZGVHcm91cCwgcmVuZGVyTm9kZUluZm8sIHNjZW5lRWxlbWVudCxcbiAgICAgICAgQ2xhc3MuU3Vic2NlbmUuR1JPVVApO1xuICAgIH1cbiAgICAvLyBDbGVhbiBvdXQgZXhpc3Rpbmcgc3Vic2NlbmUgaWYgdGhlIG5vZGUgaXMgbm90IGV4cGFuZGVkLlxuICAgIHNlbGVjdENoaWxkKG5vZGVHcm91cCwgJ2cnLCBDbGFzcy5TdWJzY2VuZS5HUk9VUCkucmVtb3ZlKCk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogU2V0IGxhYmVsIHBvc2l0aW9uIG9mIGEgZ2l2ZW4gbm9kZSBncm91cFxuICovXG5mdW5jdGlvbiBsYWJlbFBvc2l0aW9uKG5vZGVHcm91cCwgY3g6IG51bWJlciwgY3k6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgeU9mZnNldDogbnVtYmVyKSB7XG4gIHNlbGVjdENoaWxkKG5vZGVHcm91cCwgJ3RleHQnLCBDbGFzcy5Ob2RlLkxBQkVMKVxuICAudHJhbnNpdGlvbigpXG4gIC5hdHRyKCd4JywgY3gpXG4gIC5hdHRyKCd5JywgY3kgKyB5T2Zmc2V0KTtcbn1cblxuZnVuY3Rpb24gbGFiZWxTdWJ0aXRsZVBvc2l0aW9uKG5vZGVHcm91cCwgY3g6IG51bWJlciwgY3k6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5T2Zmc2V0OiBudW1iZXIpIHtcbiAgc2VsZWN0Q2hpbGQobm9kZUdyb3VwLCAndGV4dCcsIENsYXNzLk5vZGUuU1VCX1RJVExFKVxuICAudHJhbnNpdGlvbigpXG4gIC5hdHRyKCd4JywgY3gpXG4gIC5hdHRyKCd5JywgY3kgKyB5T2Zmc2V0KTtcbn1cblxuXG4vKipcbiAqIE1vZGlmeSBub2RlIHN0eWxlIGJ5IHRvZ2dsaW5nIGNsYXNzIGFuZCBhc3NpZ24gYXR0cmlidXRlcyAob25seSBmb3IgdGhpbmdzXG4gKiB0aGF0IGNhbid0IGJlIGRvbmUgaW4gY3NzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0eWxpemUobm9kZUdyb3VwLCByZW5kZXJJbmZvOiBSZW5kZXJOb2RlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lRWxlbWVudCwgY2xhc3NOYW1lPykge1xuICBjbGFzc05hbWUgPSBjbGFzc05hbWUgfHwgQ2xhc3MuTm9kZS5TSEFQRTtcbiAgY29uc3QgaXNIaWdobGlnaHRlZCA9IHNjZW5lRWxlbWVudC5pc05vZGVIaWdobGlnaHRlZChyZW5kZXJJbmZvLm5vZGUubmFtZSk7XG4gIGNvbnN0IGlzU2VsZWN0ZWQgPSBzY2VuZUVsZW1lbnQuaXNOb2RlU2VsZWN0ZWQocmVuZGVySW5mby5ub2RlLm5hbWUpO1xuICBjb25zdCBpc0V4dHJhY3QgPSByZW5kZXJJbmZvLmlzSW5FeHRyYWN0IHx8XG4gICAgcmVuZGVySW5mby5pc091dEV4dHJhY3Q7XG4gIGNvbnN0IGlzRXhwYW5kZWQgPSByZW5kZXJJbmZvLmV4cGFuZGVkICYmIGNsYXNzTmFtZSAhPT0gQ2xhc3MuQW5ub3RhdGlvbi5OT0RFO1xuICBjb25zdCBpc0ZhZGVkT3V0ID0gcmVuZGVySW5mby5pc0ZhZGVkT3V0O1xuICBub2RlR3JvdXAuY2xhc3NlZCgnaGlnaGxpZ2h0ZWQnLCBpc0hpZ2hsaWdodGVkKTtcbiAgbm9kZUdyb3VwLmNsYXNzZWQoJ3NlbGVjdGVkJywgaXNTZWxlY3RlZCk7XG4gIG5vZGVHcm91cC5jbGFzc2VkKCdleHRyYWN0JywgaXNFeHRyYWN0KTtcbiAgbm9kZUdyb3VwLmNsYXNzZWQoJ2V4cGFuZGVkJywgaXNFeHBhbmRlZCk7XG4gIG5vZGVHcm91cC5jbGFzc2VkKCdmYWRlZCcsIGlzRmFkZWRPdXQpO1xuICAvLyBNYWluIG5vZGUgYWx3YXlzIGV4aXN0cyBoZXJlIGFuZCBpdCB3aWxsIGJlIHJlYWNoZWQgYmVmb3JlIHN1YnNjZW5lLFxuICAvLyBzbyBkMyBzZWxlY3Rpb24gaXMgZmluZSBoZXJlLlxuICBjb25zdCBub2RlID0gbm9kZUdyb3VwLnNlbGVjdCgnLicgKyBjbGFzc05hbWUgKyAnIC4nICsgQ2xhc3MuTm9kZS5DT0xPUl9UQVJHRVQpO1xuXG4gIC8vIFRPRE8gc2V0IGNvbG9yXG4gIC8vIGNvbnN0IGZpbGxDb2xvciA9IGdldEZpbGxGb3JOb2RlKHNjZW5lRWxlbWVudC50ZW1wbGF0ZUluZGV4LFxuICAvLyAgIENvbG9yQnlbc2NlbmVFbGVtZW50LmNvbG9yQnkudG9VcHBlckNhc2UoKV0sXG4gIC8vICAgcmVuZGVySW5mbywgaXNFeHBhbmRlZCk7XG4gIC8vIG5vZGUuc3R5bGUoJ2ZpbGwnLCBmaWxsQ29sb3IpO1xuICAvL1xuICAvLyAvLyBDaG9vc2Ugb3V0bGluZSB0byBiZSBkYXJrZXIgdmVyc2lvbiBvZiBub2RlIGNvbG9yIGlmIHRoZSBub2RlIGlzIGEgc2luZ2xlXG4gIC8vIC8vIGNvbG9yIGFuZCBpcyBub3Qgc2VsZWN0ZWQuXG4gIC8vIG5vZGUuc3R5bGUoJ3N0cm9rZScsIGlzU2VsZWN0ZWQgPyBudWxsIDogZ2V0U3Ryb2tlRm9yRmlsbChmaWxsQ29sb3IpKTtcbn1cblxuXG4vKiogTW9kaWZ5IG5vZGUgYW5kIGl0cyBzdWJzY2VuZSBhbmQgaXRzIGxhYmVsJ3MgcG9zaXRpb25hbCBhdHRyaWJ1dGVzICovXG5mdW5jdGlvbiBwb3NpdGlvbihub2RlR3JvdXAsIGQ6IFJlbmRlck5vZGVJbmZvKSB7XG4gIGNvbnN0IHNoYXBlR3JvdXAgPSBzZWxlY3RDaGlsZChub2RlR3JvdXAsICdnJywgQ2xhc3MuTm9kZS5TSEFQRSk7XG4gIGNvbnN0IGN4ID0gY29tcHV0ZUNYUG9zaXRpb25PZk5vZGVTaGFwZShkKTtcbiAgc3dpdGNoIChkLm5vZGUudHlwZSkge1xuICAgIGNhc2UgTm9kZVR5cGUuT1A6IHtcbiAgICAgIGNvbnN0IHNoYXBlID0gc2VsZWN0Q2hpbGQoc2hhcGVHcm91cCwgJ2ZvcmVpZ25PYmplY3QnKTtcbiAgICAgIHBvc2l0aW9uUmVjdChzaGFwZSwgY3gsIGQueSwgZC5jb3JlQm94LndpZHRoLCBkLmNvcmVCb3guaGVpZ2h0KTtcblxuICAgICAgbGFiZWxQb3NpdGlvbihub2RlR3JvdXAsIGN4LCBkLnksIGQubGFiZWxPZmZzZXQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgTm9kZVR5cGUuTUVUQToge1xuICAgICAgLy8gcG9zaXRpb24gc2hhcGVcbiAgICAgIGNvbnN0IHNoYXBlcyA9IHNoYXBlR3JvdXAuc2VsZWN0QWxsKCdmb3JlaWduT2JqZWN0Jyk7XG4gICAgICBpZiAoZC5leHBhbmRlZCkge1xuICAgICAgICBwb3NpdGlvblJlY3Qoc2hhcGVzLCBkLngsIGQueSwgZC53aWR0aCwgZC5oZWlnaHQpO1xuICAgICAgICBzdWJzY2VuZVBvc2l0aW9uKG5vZGVHcm91cCwgZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3NpdGlvblJlY3Qoc2hhcGVzLCBjeCwgZC55LCBkLmNvcmVCb3gud2lkdGgsIGQuY29yZUJveC5oZWlnaHQpO1xuICAgICAgICBsYWJlbFN1YnRpdGxlUG9zaXRpb24obm9kZUdyb3VwLCBjeCAtIGQud2lkdGggLyAyICsgNCwgZC55LCAtZC5oZWlnaHQgLyAyICsgMjQpO1xuICAgICAgfVxuICAgICAgbGFiZWxQb3NpdGlvbihub2RlR3JvdXAsIGN4IC0gZC53aWR0aCAvIDIgKyA0LCBkLnksIC1kLmhlaWdodCAvIDIgKyA4KTtcblxuXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBOb2RlVHlwZS5TRVJJRVM6IHtcbiAgICAgIGNvbnN0IHNoYXBlID0gc2VsZWN0Q2hpbGQoc2hhcGVHcm91cCwgJ3VzZScpO1xuICAgICAgaWYgKGQuZXhwYW5kZWQpIHtcbiAgICAgICAgcG9zaXRpb25SZWN0KHNoYXBlLCBkLngsIGQueSwgZC53aWR0aCwgZC5oZWlnaHQpO1xuICAgICAgICBzdWJzY2VuZVBvc2l0aW9uKG5vZGVHcm91cCwgZCk7XG4gICAgICAgIC8vIHB1dCBsYWJlbCBvbiB0b3BcbiAgICAgICAgbGFiZWxQb3NpdGlvbihub2RlR3JvdXAsIGN4LCBkLnksXG4gICAgICAgICAgLWQuaGVpZ2h0IC8gMiArIGQubGFiZWxIZWlnaHQgLyAyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvc2l0aW9uUmVjdChzaGFwZSwgY3gsIGQueSwgZC5jb3JlQm94LndpZHRoLCBkLmNvcmVCb3guaGVpZ2h0KTtcbiAgICAgICAgbGFiZWxQb3NpdGlvbihub2RlR3JvdXAsIGN4LCBkLnksIGQubGFiZWxPZmZzZXQpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgTm9kZVR5cGUuQlJJREdFOiB7XG4gICAgICAvLyBwb3NpdGlvbiBzaGFwZVxuICAgICAgLy8gTk9URTogSW4gcmVhbGl0eSwgdGhlc2Ugd2lsbCBub3QgYmUgdmlzaWJsZSwgYnV0IGl0IGhlbHBzIHRvIHB1dCB0aGVtXG4gICAgICAvLyBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbiBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICAgICAgY29uc3Qgc2hhcGUgPSBzZWxlY3RDaGlsZChzaGFwZUdyb3VwLCAncmVjdCcpO1xuICAgICAgcG9zaXRpb25SZWN0KHNoYXBlLCBkLngsIGQueSwgZC53aWR0aCwgZC5oZWlnaHQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRocm93IEVycm9yKCdVbnJlY29nbml6ZWQgbm9kZSB0eXBlOiAnICsgZC5ub2RlLnR5cGUpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSB0aGUgc3Vic2NlbmUgb2YgdGhlIGdpdmVuIG5vZGUgZ3JvdXBcbiAqL1xuZnVuY3Rpb24gc3Vic2NlbmVQb3NpdGlvbihub2RlR3JvdXAsIGQ6IFJlbmRlck5vZGVJbmZvKSB7XG4gIGNvbnN0IHgwID0gZC54IC0gZC53aWR0aCAvIDIuMCArIGQucGFkZGluZ0xlZnQ7XG4gIGNvbnN0IHkwID0gZC55IC0gZC5oZWlnaHQgLyAyLjAgKyBkLnBhZGRpbmdUb3A7XG5cbiAgY29uc3Qgc3Vic2NlbmUgPSBzZWxlY3RDaGlsZChub2RlR3JvdXAsICdnJywgQ2xhc3MuU3Vic2NlbmUuR1JPVVApO1xuICB0cmFuc2xhdGUoc3Vic2NlbmUsIHgwLCB5MCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNlSW5wdXRzKHJlbmRlckdyYXBoSW5mbzogUmVuZGVyR3JhcGhJbmZvKSB7XG4gIGQzLnNlbGVjdEFsbCgnLmlucHV0LWhpZ2hsaWdodCcpLmNsYXNzZWQoJ2lucHV0LWhpZ2hsaWdodCcsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcuc3RhcnQtb3V0cHV0LWVkZ2UnKS5jbGFzc2VkKCdzdGFydC1vdXRwdXQtZWRnZScsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcub3V0cHV0LWVkZ2UtaGlnaGxpZ2h0JykuY2xhc3NlZCgnb3V0cHV0LWVkZ2UtaGlnaGxpZ2h0JywgZmFsc2UpO1xuICBkMy5zZWxlY3RBbGwoJy5ub24taW5wdXQnKS5jbGFzc2VkKCdub24taW5wdXQnLCBmYWxzZSk7XG4gIGQzLnNlbGVjdEFsbCgnLmlucHV0LXBhcmVudCcpLmNsYXNzZWQoJ2lucHV0LXBhcmVudCcsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcuaW5wdXQtY2hpbGQnKS5jbGFzc2VkKCdpbnB1dC1jaGlsZCcsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcuaW5wdXQtZWRnZS1oaWdobGlnaHQnKS5jbGFzc2VkKCdpbnB1dC1lZGdlLWhpZ2hsaWdodCcsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcubm9uLWlucHV0LWVkZ2UtaGlnaGxpZ2h0JylcbiAgLmNsYXNzZWQoJ25vbi1pbnB1dC1lZGdlLWhpZ2hsaWdodCcsIGZhbHNlKTtcbiAgZDMuc2VsZWN0QWxsKCcuaW5wdXQtaGlnaGxpZ2h0LXNlbGVjdGVkJylcbiAgLmNsYXNzZWQoJ2lucHV0LWhpZ2hsaWdodC1zZWxlY3RlZCcsIGZhbHNlKTtcblxuICAvLyDojrflj5blvZPliY3pgInmi6nnmoToioLngrnvvIzlpoLmnpzmsqHmnInmiJYgdHJhY2VJbnB1dHMg6KKr56aB55So5YiZ6L+U5ZueXG4gIGNvbnN0IHNlbGVjdGVkTm9kZVNlbGVjdG9yU3RyaW5nID0gJ2cubm9kZS5zZWxlY3RlZCxnLm9wLnNlbGVjdGVkJztcbiAgY29uc3Qgbm9kZVNlbGVjdGlvbiA9IGQzLnNlbGVjdChzZWxlY3RlZE5vZGVTZWxlY3RvclN0cmluZyk7XG4gIGxldCBjdXJyZW50Tm9kZTtcbiAgaWYgKHJlbmRlckdyYXBoSW5mbyAmJiByZW5kZXJHcmFwaEluZm8udHJhY2VJbnB1dHMgJiZcbiAgICBub2RlU2VsZWN0aW9uLm5vZGVzKCkubGVuZ3RoKSB7XG4gICAgY3VycmVudE5vZGUgPSBub2RlU2VsZWN0aW9uLm5vZGVzKClbIDAgXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgbm9kZU5hbWUgPSBjdXJyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpO1xuICBjb25zdCBvcE5vZGVzID0gX2dldEFsbENvbnRhaW5lZE9wTm9kZXMobm9kZU5hbWUsIHJlbmRlckdyYXBoSW5mbyk7XG4gIGxldCBhbGxUcmFjZWROb2RlcyA9IHt9O1xuICBfLmVhY2gob3BOb2RlcywgZnVuY3Rpb24gKG5vZGVJbnN0YW5jZSkge1xuICAgIGFsbFRyYWNlZE5vZGVzID1cbiAgICAgIHRyYWNlQWxsSW5wdXRzT2ZPcE5vZGUocmVuZGVyR3JhcGhJbmZvLCBub2RlSW5zdGFuY2UsIGFsbFRyYWNlZE5vZGVzKTtcbiAgfSk7XG5cbiAgZDMuc2VsZWN0QWxsKHNlbGVjdGVkTm9kZVNlbGVjdG9yU3RyaW5nKVxuICAvLyBSZW1vdmUgdGhlIGlucHV0LWhpZ2hsaWdodCBmcm9tIHRoZSBzZWxlY3RlZCBub2RlLlxuICAuY2xhc3NlZCgnaW5wdXQtaGlnaGxpZ2h0JywgZmFsc2UpXG4gIC8vIEFkZCBpbnB1dC1oaWdobGlnaHQtc2VsZWN0ZWQgY2xhc3MgdG8gc2VsZWN0ZWQgbm9kZSwgd2hpY2ggYWxsb3dzXG4gIC8vIHRyZWF0aW5nIHRoZSBzZWxlY3RlZCBub3QgYXMgYSBzcGVjaWFsIGNhc2Ugb2YgYW4gaW5wdXQgbm9kZS5cbiAgLmNsYXNzZWQoJ2lucHV0LWhpZ2hsaWdodC1zZWxlY3RlZCcsIHRydWUpO1xuXG4gIC8vIEhpZ2hsaWdodCBhbGwgcGFyZW50IG5vZGVzIG9mIGVhY2ggT3BOb2RlIGFzIGlucHV0IHBhcmVudCB0byBhbGxvd1xuICAvLyBzcGVjaWZpYyBoaWdobGlnaHRpbmcuXG4gIGNvbnN0IGhpZ2hsaWdodGVkTm9kZXMgPSBPYmplY3Qua2V5cyhhbGxUcmFjZWROb2Rlcyk7XG4gIGNvbnN0IHZpc2libGVOb2RlcyA9XG4gICAgICAgICAgX2ZpbmRWaXNpYmxlUGFyZW50c0Zyb21PcE5vZGVzKHJlbmRlckdyYXBoSW5mbywgaGlnaGxpZ2h0ZWROb2Rlcyk7XG4gIF9tYXJrUGFyZW50c09mTm9kZXModmlzaWJsZU5vZGVzKTtcblxuICAvLyBBdHRhY2ggY2xhc3MgdG8gYWxsIG5vbi1pbnB1dCBub2RlcyBhbmQgZWRnZXMgZm9yIHN0eWxpbmcuXG4gIGQzLnNlbGVjdEFsbChcbiAgICAnZy5ub2RlOm5vdCguc2VsZWN0ZWQpOm5vdCguaW5wdXQtaGlnaGxpZ2h0KScgK1xuICAgICc6bm90KC5pbnB1dC1wYXJlbnQpOm5vdCguaW5wdXQtY2hpbGRyZW4pJylcbiAgLmNsYXNzZWQoJ25vbi1pbnB1dCcsIHRydWUpXG4gIC5lYWNoKGZ1bmN0aW9uIChkOiBSZW5kZXJOb2RlSW5mbykge1xuICAgIC8vIE1hcmsgYWxsIG5vZGVzIHdpdGggdGhlIHNwZWNpZmllZCBuYW1lIGFzIG5vbi1pbnB1dHMuIFRoaXNcbiAgICAvLyByZXN1bHRzIGluIEFubm90YXRpb24gbm9kZXMgd2hpY2ggYXJlIGF0dGFjaGVkIHRvIGlucHV0cyB0byBiZVxuICAgIC8vIHRhZ2dlZCBhcyB3ZWxsLlxuICAgIGlmIChkKSB7XG4gICAgICBkMy5zZWxlY3RBbGwoYFtkYXRhLW5hbWU9XCIke2Qubm9kZS5uYW1lfVwiXWApLmNsYXNzZWQoJ25vbi1pbnB1dCcsIHRydWUpO1xuICAgIH1cbiAgfSk7XG4gIGQzLnNlbGVjdEFsbCgnZy5lZGdlOm5vdCguaW5wdXQtZWRnZS1oaWdobGlnaHQpJylcbiAgLmNsYXNzZWQoJ25vbi1pbnB1dC1lZGdlLWhpZ2hsaWdodCcsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2VGaXJzdE91dHB1dHNPZk9wTm9kZShcbiAgcmVuZGVyR3JhcGhJbmZvOiBSZW5kZXJHcmFwaEluZm8sIG5vZGU6IEJhc2VOb2RlIHwgR3JvdXBOb2RlLCBlZGdlc1NlbGVjdG9yOiBkMy5TZWxlY3Rpb248YW55ICwgYW55LCBhbnksIGFueT4pIHtcbiAgY29uc29sZS5sb2cobm9kZSk7XG4gIGVkZ2VzU2VsZWN0b3IuZWFjaChmdW5jdGlvbiAoZCkge1xuICAgIGlmIChkLnYgPT09IG5vZGUubmFtZSkge1xuICAgICAgY29uc3QgZWRnZSA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICAgIGVkZ2UuY2xhc3NlZCgnc3RhcnQtb3V0cHV0LWVkZ2UnLCB0cnVlKTtcbiAgICAgIGVkZ2UuY2xhc3NlZCgnb3V0cHV0LWVkZ2UtaGlnaGxpZ2h0JywgdHJ1ZSk7XG4gICAgICBjb25zdCBuZXh0T3BOb2RlID0gcmVuZGVyR3JhcGhJbmZvLmdldFJlbmRlck5vZGVCeU5hbWUoZC53KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5leHRPcE5vZGUpO1xuICAgICAgLy8gaWYgKG5leHRPcE5vZGUpIHtcbiAgICAgIC8vICAgX3RyYWNlTmV4dE91dHB1dE9mTm9kZShyZW5kZXJHcmFwaEluZm8sIG5leHRPcE5vZGUubm9kZSwgZWRnZXNTZWxlY3Rvcik7XG4gICAgICAvLyB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBmaW5kIGFsbCBvcCBub2RlcyBjb250YWluZWQgYnkgdGhlIG5vZGUgaWRlbnRpZmllZCBieSB0aGVcbiAqIHByb3ZpZGVkIG5hbWUuXG4gKiBAcGFyYW0gbm9kZU5hbWUgVGhlIG1ldGEgb3Igb3Agbm9kZSBvZiB3aGljaCB0aGUgT3BOb2RlIGluc3RhbmNlcyBhcmVcbiAqIHJlcXVpcmVkLlxuICogQHBhcmFtIHJlbmRlckdyYXBoSW5mbyBUaGUgcmVuZGVyZWQgZ3JhcGggaW5mb3JtYXRpb24gb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gX2dldEFsbENvbnRhaW5lZE9wTm9kZXMoXG4gIG5vZGVOYW1lOiBzdHJpbmcsIHJlbmRlckdyYXBoSW5mbzogUmVuZGVyR3JhcGhJbmZvKSB7XG4gIGxldCBvcE5vZGVzID0gW107XG5cbiAgLy8gR2V0IGN1cnJlbnQgbm9kZS5cbiAgY29uc3Qgbm9kZSA9IHJlbmRlckdyYXBoSW5mby5nZXROb2RlQnlOYW1lKG5vZGVOYW1lKSBhcyBHcm91cE5vZGUgfCBCYXNlTm9kZTtcblxuICBpZiAobm9kZS5pc0dyb3VwTm9kZSkge1xuICAgIC8vIE90aGVyd2lzZSwgbWFrZSByZWN1cnNpdmUgY2FsbCBmb3IgZWFjaCBub2RlIGNvbnRhaW5lZCBieSB0aGUgR3JvdXBOb2RlLlxuICAgIGNvbnN0IGNoaWxkTm9kZU5hbWVzID0gKG5vZGUgYXMgR3JvdXBOb2RlKS5tZXRhZ3JhcGgubm9kZXMoKTtcbiAgICBfLmVhY2goY2hpbGROb2RlTmFtZXMsIGZ1bmN0aW9uIChjaGlsZE5vZGVOYW1lKSB7XG4gICAgICBvcE5vZGVzID1cbiAgICAgICAgb3BOb2Rlcy5jb25jYXQoX2dldEFsbENvbnRhaW5lZE9wTm9kZXMoY2hpbGROb2RlTmFtZSwgcmVuZGVyR3JhcGhJbmZvKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb3BOb2Rlcy5wdXNoKG5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIG9wTm9kZXM7XG59XG5cbmludGVyZmFjZSBWaXNpYmxlUGFyZW50IHtcbiAgdmlzaWJsZVBhcmVudDogTm9kZTtcbiAgb3BOb2RlczogQmFzZU5vZGVbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNlQWxsSW5wdXRzT2ZPcE5vZGUoXG4gIHJlbmRlckdyYXBoSW5mbzogUmVuZGVyR3JhcGhJbmZvLCBzdGFydE5vZGU6IEJhc2VOb2RlLFxuICBhbGxUcmFjZWROb2RlczogT2JqZWN0KSB7XG4gIC8vIFRvIHByZXZlbnQgaW5maW5pdGUgbG9vcHMgZHVlIHRvIGN5Y2xpY2FsIHJlbGF0aW9uc2hpcHMgYW5kIGltcHJvdmluZ1xuICAvLyBwZXJmb3JtYW5jZSBieSB0cmFjaW5nIE9wTm9kZSB3aGljaCBpcyBpbnB1dCB0byAyKyBub2RlcyBvbmx5IG9uY2UuXG4gIGlmIChhbGxUcmFjZWROb2Rlc1sgc3RhcnROb2RlLm5hbWUgXSkge1xuICAgIHJldHVybiBhbGxUcmFjZWROb2RlcztcbiAgfSBlbHNlIHtcbiAgICBhbGxUcmFjZWROb2Rlc1sgc3RhcnROb2RlLm5hbWUgXSA9IHRydWU7XG4gIH1cbiAgLy8gRXh0cmFjdCB0aGUgaW5wdXRzLlxuICBjb25zdCBpbnB1dHMgPSBzdGFydE5vZGUuaW5wdXRzO1xuICAvLyBHZXQgdmlzaWJsZSBwYXJlbnQuXG4gIGNvbnN0IGN1cnJlbnRWaXNpYmxlUGFyZW50ID0gZ2V0VmlzaWJsZVBhcmVudChyZW5kZXJHcmFwaEluZm8sIHN0YXJ0Tm9kZSk7XG4gIC8vIE1hcmsgYXMgaW5wdXQgbm9kZS5cbiAgZDMuc2VsZWN0KGAubm9kZVtkYXRhLW5hbWU9XCIke2N1cnJlbnRWaXNpYmxlUGFyZW50Lm5hbWV9XCJdYClcbiAgLmNsYXNzZWQoJ2lucHV0LWhpZ2hsaWdodCcsIHRydWUpO1xuXG4gIC8vIEZpbmQgdGhlIHZpc2libGUgcGFyZW50IG9mIGVhY2ggaW5wdXQuXG4gIGNvbnN0IHZpc2libGVJbnB1dHMgPSB7fTtcbiAgXy5lYWNoKGlucHV0cywgZnVuY3Rpb24gKG5vZGVJbnN0YW5jZSkge1xuICAgIGNvbnN0IHJlc29sdmVkTm9kZSA9IHJlbmRlckdyYXBoSW5mby5nZXROb2RlQnlOYW1lKG5vZGVJbnN0YW5jZS5uYW1lKTtcbiAgICBpZiAocmVzb2x2ZWROb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIE5vZGUgY291bGQgbm90IGJlIGZvdW5kIGluIHJlbmRlcmVkIEhpZXJhcmNoeSwgd2hpY2ggaGFwcGVucyB3aGVuXG4gICAgICAvLyB0cmFjaW5nIGlucHV0cyBvZiBhIFN1bW1hcnlOb2RlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgY29uc3QgdmlzaWJsZVBhcmVudCA9IGdldFZpc2libGVQYXJlbnQocmVuZGVyR3JhcGhJbmZvLCByZXNvbHZlZE5vZGUpO1xuXG4gICAgLy8gQXBwZW5kIE9wTm9kZSB0byB2aXNpYmxlIHBhcmVudCBlbnRyeS5cbiAgICBjb25zdCB2aXNpYmxlSW5wdXRzRW50cnkgPSB2aXNpYmxlSW5wdXRzWyB2aXNpYmxlUGFyZW50Lm5hbWUgXTtcbiAgICBpZiAodmlzaWJsZUlucHV0c0VudHJ5KSB7XG4gICAgICB2aXNpYmxlSW5wdXRzRW50cnkub3BOb2Rlcy5wdXNoKHJlc29sdmVkTm9kZSk7XG4gICAgfSBlbHNlIHsgIC8vIENyZWF0ZSBuZXcgZW50cnkuXG4gICAgICB2aXNpYmxlSW5wdXRzWyB2aXNpYmxlUGFyZW50Lm5hbWUgXSA9IHtcbiAgICAgICAgdmlzaWJsZVBhcmVudDogdmlzaWJsZVBhcmVudCxcbiAgICAgICAgb3BOb2RlcyAgICAgIDogWyByZXNvbHZlZE5vZGUgXVxuICAgICAgfSBhcyBWaXNpYmxlUGFyZW50O1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gRmluZCBhbGwgcGFyZW50cyBvZiB0aGUgc3RhcnQgbm9kZS5cbiAgY29uc3Qgc3RhcnROb2RlUGFyZW50cyA9IHt9O1xuICBjb25zdCBpbmRleGVkU3RhcnROb2RlUGFyZW50cyA9IFsgY3VycmVudFZpc2libGVQYXJlbnQgXTtcbiAgc3RhcnROb2RlUGFyZW50c1sgY3VycmVudFZpc2libGVQYXJlbnQubmFtZSBdID0ge1xuICAgIHRyYWNlZCAgICAgICAgICAgICA6IGZhbHNlLFxuICAgIGluZGV4ICAgICAgICAgICAgICA6IDAsXG4gICAgY29ubmVjdGlvbkVuZHBvaW50czogW11cbiAgfTtcblxuICBsZXQgY3VycmVudE5vZGUgPSBjdXJyZW50VmlzaWJsZVBhcmVudCBhcyBOb2RlO1xuICBmb3IgKGxldCBpbmRleCA9IDE7IGN1cnJlbnROb2RlLm5hbWUgIT09IFJPT1RfTkFNRTsgaW5kZXgrKykge1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICBzdGFydE5vZGVQYXJlbnRzWyBjdXJyZW50Tm9kZS5uYW1lIF0gPSB7XG4gICAgICB0cmFjZWQgICAgICAgICAgICAgOiBmYWxzZSxcbiAgICAgIGluZGV4ICAgICAgICAgICAgICA6IGluZGV4LFxuICAgICAgY29ubmVjdGlvbkVuZHBvaW50czogW11cbiAgICB9O1xuICAgIGluZGV4ZWRTdGFydE5vZGVQYXJlbnRzWyBpbmRleCBdID0gY3VycmVudE5vZGU7XG4gIH1cblxuICAvLyBGaW5kIGZpcnN0IG11dHVhbCBwYXJlbnQgb2YgZWFjaCBpbnB1dCBub2RlIGFuZCBoaWdobGlnaHQgY29ubmVjdGlvbi5cbiAgXy5mb3JPd24odmlzaWJsZUlucHV0cywgZnVuY3Rpb24gKHZpc2libGVQYXJlbnRJbmZvOiBWaXNpYmxlUGFyZW50LCBrZXkpIHtcbiAgICBjb25zdCBub2RlSW5zdGFuY2UgPSB2aXNpYmxlUGFyZW50SW5mby52aXNpYmxlUGFyZW50O1xuICAgIC8vIE1ha2UgcmVjdXJzaXZlIGNhbGwgZm9yIGVhY2ggaW5wdXQtT3BOb2RlIGNvbnRhaW5lZCBieSB0aGUgdmlzaWJsZVxuICAgIC8vIHBhcmVudC5cbiAgICBfLmVhY2godmlzaWJsZVBhcmVudEluZm8ub3BOb2RlcywgZnVuY3Rpb24gKG9wTm9kZTogQmFzZU5vZGUpIHtcbiAgICAgIGFsbFRyYWNlZE5vZGVzID1cbiAgICAgICAgdHJhY2VBbGxJbnB1dHNPZk9wTm9kZShyZW5kZXJHcmFwaEluZm8sIG9wTm9kZSwgYWxsVHJhY2VkTm9kZXMpO1xuICAgIH0pO1xuXG4gICAgaWYgKG5vZGVJbnN0YW5jZS5uYW1lICE9PSBjdXJyZW50VmlzaWJsZVBhcmVudC5uYW1lKSB7XG4gICAgICBfY3JlYXRlVmlzaWJsZVRyYWNlKFxuICAgICAgICBub2RlSW5zdGFuY2UsIHN0YXJ0Tm9kZVBhcmVudHMsIGluZGV4ZWRTdGFydE5vZGVQYXJlbnRzKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBhbGxUcmFjZWROb2Rlcztcbn1cblxuXG4vKipcbiAqIEZpbmQgdGhlIHBhcmVudCBvZiB0aGUgcGFzc2VkIGluIG9wIG5vZGUgd2hpY2ggaXMgZXhwYW5kZWQuIFRoaXMgaXMgZG9uZVxuICogYnkgZ29pbmcgdGhyb3VnaCBhbGwgcGFyZW50cyB1bnRpbCB0aGUgcGFyZW50J3MgcGFyZW50IGlzIGV4cGFuZGVkLCB0aHVzXG4gKiBmaW5kaW5nIHRoZSBmaXJzdCB1bmV4cGFuZGVkIHBhcmVudCB3aGljaCBpcyByZW5kZXJlZCBvbiB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHJlbmRlckdyYXBoSW5mbyBUaGUgZ3JhcGggaW5mbyBvYmplY3QgdXNlZCB0byBnYWluIGFjY2VzcyB0byB0aGVcbiAqIHJlbmRlciBpbmZvIG9mIHRoZSBwYXJlbnRzLlxuICogQHBhcmFtIGN1cnJlbnROb2RlIFRoZSBub2RlIHdob3NlIHBhcmVudCBpcyB0byBiZSBmb3VuZC5cbiAqIEByZXR1cm5zIE5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZpc2libGVQYXJlbnQoXG4gIHJlbmRlckdyYXBoSW5mbzogUmVuZGVyR3JhcGhJbmZvLFxuICBjdXJyZW50Tm9kZTogTm9kZSkge1xuICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgbGV0IGN1cnJlbnRQYXJlbnQgPSBjdXJyZW50Tm9kZTtcblxuICB3aGlsZSAoIWZvdW5kKSB7XG4gICAgLy8gR2V0IHBhcmVudCBlbGVtZW50LCB0byBleHRyYWN0IG5hbWUuXG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50UGFyZW50O1xuICAgIGN1cnJlbnRQYXJlbnQgPSBjdXJyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgIGlmIChjdXJyZW50UGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVuZGVyTm9kZSA9IHJlbmRlckdyYXBoSW5mby5nZXRSZW5kZXJOb2RlQnlOYW1lKGN1cnJlbnRQYXJlbnQubmFtZSk7XG4gICAgICAvLyBGb3VuZCBpZiBub2RlIGlzIHJlbmRlcmVkIG9uIHRoZSBzY3JlZW4gKHJlbmRlck5vZGUgdHJ1dGh5KSwgYW5kXG4gICAgICAvLyB0aGUgcGFyZW50IGlzIGVpdGhlciBleHBhbmRlZCAoaS5lLiBpdCBpcyBhIG1ldGFub2RlIG9yIHNlcmllc25vZGUpXG4gICAgICAvLyBvciB0aGUgcGFyZW50IGlzIGFuIE9wTm9kZSBpbiB3aGljaCBjYXNlIGN1cnJlbnROb2RlIGlzIGFuIGVtYmVkZGVkXG4gICAgICAvLyBub2RlIHdoaWNoIGhhcyBhbm90aGVyIE9wTm9kZSBhcyBwYXJlbnQuXG4gICAgICBpZiAocmVuZGVyTm9kZSAmJlxuICAgICAgICAocmVuZGVyTm9kZS5leHBhbmRlZCkpIHtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSAgLy8gQ2xvc2Ugd2hpbGUgbG9vcC5cbiAgcmV0dXJuIGN1cnJlbnROb2RlO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgbWFwIHsgW25hbWU6IHN0cmluZ10gLT4gTm9kZSB9IG9mIGFsbCB2aXNpYmxlIC8gcmVuZGVyZWQgcGFyZW50c1xuICogb2YgdGhlIG5vZGVzIGlkZW50aWZpZWQgYnkgdGhlIG5vZGUgbmFtZXMgcGFzc2VkIGluLlxuICpcbiAqIEBwYXJhbSByZW5kZXJHcmFwaEluZm8gVGhlIGluZm9ybWF0aW9uIG9uIHRoZSByZW5kZXJlZCBncmFwaC5cbiAqIEBwYXJhbSBub2RlTmFtZXMgU3RyaW5nIGFycmF5IG9mIG5vZGUgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIF9maW5kVmlzaWJsZVBhcmVudHNGcm9tT3BOb2RlcyhyZW5kZXJHcmFwaEluZm8sIG5vZGVOYW1lczogc3RyaW5nW10pIHtcbiAgY29uc3QgdmlzaWJsZVBhcmVudHM6IHsgWyBub2RlTmFtZTogc3RyaW5nIF06IE5vZGUgfSA9IHt9O1xuICBfLmVhY2gobm9kZU5hbWVzLCBmdW5jdGlvbiAobm9kZU5hbWUpIHtcbiAgICBjb25zdCBjdXJyZW50Tm9kZSA9IHJlbmRlckdyYXBoSW5mby5nZXROb2RlQnlOYW1lKG5vZGVOYW1lKTtcbiAgICBjb25zdCB2aXNpYmxlUGFyZW50ID0gZ2V0VmlzaWJsZVBhcmVudChyZW5kZXJHcmFwaEluZm8sIGN1cnJlbnROb2RlKTtcbiAgICB2aXNpYmxlUGFyZW50c1sgdmlzaWJsZVBhcmVudC5uYW1lIF0gPSB2aXNpYmxlUGFyZW50O1xuICB9KTtcblxuICByZXR1cm4gdmlzaWJsZVBhcmVudHM7XG59XG5cblxuLyoqXG4gKiBUcmF2ZXJzZSB0aHJvdWdoIHRoZSBwYXJlbnRzIG9mIGFsbCBub2RlcyBpbiB0aGUgbGlzdCBhbmQgbWFyayBlYWNoXG4gKiBlbmNvdW50ZXJlZCBub2RlIGFzIGlucHV0LXBhcmVudC5cbiAqIEBwYXJhbSB2aXNpYmxlTm9kZXMgTWFwIG9mIGlucHV0IG5vZGVzLCBoYXZlIHRvIGJlIHZpc2libGUvcmVuZGVyZWQgd2hlblxuICogY2FsbGVkLlxuICovXG5mdW5jdGlvbiBfbWFya1BhcmVudHNPZk5vZGVzKHZpc2libGVOb2RlczogeyBbIG5vZGVOYW1lOiBzdHJpbmcgXTogTm9kZSB9KSB7XG4gIF8uZm9yT3duKHZpc2libGVOb2RlcywgZnVuY3Rpb24gKG5vZGVJbnN0YW5jZTogTm9kZSkge1xuICAgIC8vIE1hcmsgYWxsIHBhcmVudHMgb2YgdGhlIG5vZGUgYXMgaW5wdXQtcGFyZW50cy5cbiAgICBsZXQgY3VycmVudE5vZGUgPSBub2RlSW5zdGFuY2U7XG5cbiAgICB3aGlsZSAoY3VycmVudE5vZGUubmFtZSAhPT0gUk9PVF9OQU1FKSB7XG4gICAgICBjb25zdCByZW5kZXJlZEVsZW1lbnRTZWxlY3Rpb24gPVxuICAgICAgICAgICAgICBkMy5zZWxlY3QoYC5ub2RlW2RhdGEtbmFtZT1cIiR7Y3VycmVudE5vZGUubmFtZX1cIl1gKTtcbiAgICAgIC8vIE9ubHkgbWFyayB0aGUgZWxlbWVudCBhcyBhIHBhcmVudCBub2RlIHRvIGFuIGlucHV0IGlmIGl0IGlzIG5vdFxuICAgICAgLy8gbWFya2VkIGFzIGlucHV0IG5vZGUgaXRzZWxmLlxuICAgICAgaWYgKHJlbmRlcmVkRWxlbWVudFNlbGVjdGlvbi5ub2RlcygpLmxlbmd0aCAmJlxuICAgICAgICAhcmVuZGVyZWRFbGVtZW50U2VsZWN0aW9uLmNsYXNzZWQoJ2lucHV0LWhpZ2hsaWdodCcpICYmXG4gICAgICAgICFyZW5kZXJlZEVsZW1lbnRTZWxlY3Rpb24uY2xhc3NlZCgnc2VsZWN0ZWQnKSAmJlxuICAgICAgICAvLyBPcE5vZGUgb25seSBwYXJlbnQgaWYgc3RhcnQgbm9kZSBpcyBlbWJlZGRlZCBub2RlLCBpbiB3aGljaCBjYXNlXG4gICAgICAgIC8vIHRoZSBPcE5vZGUgc2hvdWxkIGJlIGZhZGVkIGFzIHdlbGwuXG4gICAgICAgICFyZW5kZXJlZEVsZW1lbnRTZWxlY3Rpb24uY2xhc3NlZCgnb3AnKSkge1xuICAgICAgICByZW5kZXJlZEVsZW1lbnRTZWxlY3Rpb24uY2xhc3NlZCgnaW5wdXQtcGFyZW50JywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICB9KTtcbn1cblxuXG4vKipcbiAqIENvbG9ycyB0aGUgZWRnZXMgdG8gY29ubmVjdCB0aGUgcGFzc2VkIG5vZGUgdG8gdGhlIHN0YXJ0IG5vZGUuIFRoaXMgaXNcbiAqIGRvbmUgYnk6XG4gKlxuICogYSkgRmluZGluZyB0aGUgZmlyc3QgKHZpc2libGUpIGNvbW1vbiBwYXJlbnQgaW4gdGhlIHJlbmRlcmVkXG4gKiBoaWVyYXJjaHkuXG4gKiBOQjogVGhlcmUgYXJlIDIgdHlwZXMgb2YgY29ubmVjdGlvbnM6XG4gKiAxKSBEaXJlY3QgY29ubmVjdGlvbnMgYmV0d2VlbiBub2RlIEFcbiAqIGFuZCBCLCBtYXJrZWQgYmVsb3cgYXMgSUksXG4gKiAyKSBDb25uZWN0aW9ucyBmcm9tIGFueSBub2RlIEEgdG8gaXRzIHBhcmVudCwgQScuIE1hcmtlZCBiZWxvdyBhcyBJIGFuZCBJSUkuXG4gKiBGb3IgdHlwZSAyIGNvbm5lY3Rpb24geW91IG5lZWQgdG8ga25vdyB0aGUgaW5uZXItbmVzdGVkIG5vZGUsIHRoZVxuICogZGlyZWN0IHBhcmVudCwgYW5kIHRoZSB1bHRpbWF0ZSBkZXN0aW5hdGlvbiBvZiB0aGUgY29ubmVjdGlvbi5cbiAqXG4gKiAgQV9wYXJlbnQgICAgICBCX3BhcmVudFxuICogKy0tLS0tLS0tKyAgICArLS0tLS0tLS0tK1xuICogfCAgICAgICAgfCAgICB8ICAgICAgICAgfFxuICogfCAgKy0tKyBJfCBJSSB8SUlJKy0tKyAgfFxuICogfCAgfEEgKy0tLS0tLS0tLS0+K0IgfCAgfFxuICogfCAgKy0tKyAgfCAgICB8ICAgKy0tKyAgfFxuICogfCAgICAgICAgfCAgICB8ICAgICAgICAgfFxuICogKy0tLS0tLS0tKyAgICArLS0tLS0tLS0tK1xuICpcbiAqXG4gKiBiKSBIaWdobGlnaHRpbmcgdGhlIGRpcmVjdCBjb25uZWN0aW9uIGJldHdlZW4gdGhlIHBhcmVudHMgb2YgQSBhbmQgQixcbiAqIGNhbGxlZCBBX3BhcmVudCBhbmQgQl9wYXJlbnQsIHMudC4gQV9wYXJlbnQgYW5kIEJfcGFyZW50IGFyZSBjaGlsZHJlbiBvZiB0aGVcbiAqIG11dHVhbCBwYXJlbnQgb2YgQSBhbmQgQiBmb3VuZCBpbiBhKSwgbWFya2VkIGFib3ZlIGFzIElJLlxuICpcbiAqIGMpIEhpZ2hsaWdodGluZyB0aGUgY29ubmVjdGlvbiBmcm9tIEEgdG8gQV9wYXJlbnQgYW5kIEIgdG8gQl9wYXJlbnRcbiAqICh0aHJvdWdoIGFsbCBsYXllcnMgb2YgcGFyZW50cyBiZXR3ZWVuIEEgYW5kIEFfcGFyZW50IGFuZCBCIGFuZCBCX3BhcmVudCxcbiAqIHJlc3BlY3RpdmVseSkuIE1hcmtlZCBhYm92ZSBhcyBJIGFuZCBJSUkuXG4gKlxuICogQHBhcmFtIG5vZGVJbnN0YW5jZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIG5vZGUgdG8gdXNlIGFzIGRlc3RpbmF0aW9uIG5vZGUsIEIuXG4gKiBAcGFyYW0gc3RhcnROb2RlUGFyZW50cyBNYXAgb2Ygc3RhcnROb2RlUGFyZW50IG5hbWVzIHRvIGluZm9ybWF0aW9uIG9iamVjdHNcbiAqIGFib3V0IHRoZSBwYXJlbnQuXG4gKiBAcGFyYW0gaW5kZXhlZFN0YXJ0Tm9kZVBhcmVudHMgQW4gYXJyYXkgb2YgYWxsIHBhcmVudHMgb2YgdGhlIHN0YXJ0IG5vZGUuXG4gKiBUaGlzIGlzIHJlcXVpcmVkIHRvIGZpbmQgdGhlIGNoaWxkIG9mIHRoZSBtdXR1YWwgcGFyZW50IHdoaWNoIGlzIGEgcGFyZW50XG4gKiBvZiB0aGUgc3RhcnQgbm9kZS5cbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZVZpc2libGVUcmFjZShcbiAgbm9kZUluc3RhbmNlOiBOb2RlLCBzdGFydE5vZGVQYXJlbnRzLCBpbmRleGVkU3RhcnROb2RlUGFyZW50czogTm9kZVtdKSB7XG4gIGxldCBjdXJyZW50Tm9kZSA9IG5vZGVJbnN0YW5jZTtcbiAgbGV0IHByZXZpb3VzTm9kZSA9IG5vZGVJbnN0YW5jZTtcblxuICAvLyBBc2NlbmQgdGhyb3VnaCBwYXJlbnRzIHVudGlsIGEgbXV0dWFsIHBhcmVudCBpcyBmb3VuZCB3aXRoIHRoZSBzdGFydFxuICAvLyBub2RlLlxuICBjb25zdCBkZXN0aW5hdGlvblBhcmVudFBhaXJzID0gW107XG4gIHdoaWxlICghc3RhcnROb2RlUGFyZW50c1sgY3VycmVudE5vZGUubmFtZSBdKSB7XG4gICAgaWYgKHByZXZpb3VzTm9kZS5uYW1lICE9PSBjdXJyZW50Tm9kZS5uYW1lKSB7XG4gICAgICBkZXN0aW5hdGlvblBhcmVudFBhaXJzLnB1c2goWyBwcmV2aW91c05vZGUsIGN1cnJlbnROb2RlIF0pO1xuICAgIH1cbiAgICBwcmV2aW91c05vZGUgPSBjdXJyZW50Tm9kZTtcbiAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLnBhcmVudE5vZGU7XG4gIH1cblxuICAvLyBDb25uZWN0aW9uIGJldHdlZW4gbm9kZXMgaXMgZHJhd24gYmV0d2VlbiB0aGUgcGFyZW50cyBvZiBlYWNoXG4gIC8vIHJlc3BlY3RpdmUgbm9kZSwgYm90aCBvZiB3aGljaCBzaGFyZSB0aGUgbXV0dWFsIHBhcmVudC5cbiAgY29uc3Qgc3RhcnROb2RlSW5kZXggPSBzdGFydE5vZGVQYXJlbnRzWyBjdXJyZW50Tm9kZS5uYW1lIF0uaW5kZXg7XG4gIGNvbnN0IHN0YXJ0Tm9kZU5hbWUgPVxuICAgICAgICAgIGluZGV4ZWRTdGFydE5vZGVQYXJlbnRzWyBNYXRoLm1heChzdGFydE5vZGVJbmRleCAtIDEsIDApIF0ubmFtZTtcblxuICBjb25zdCBzdGFydE5vZGVUb3BQYXJlbnROYW1lID0gc3RhcnROb2RlTmFtZTtcbiAgY29uc3QgdGFyZ2V0Tm9kZVRvcFBhcmVudE5hbWUgPSBwcmV2aW91c05vZGUubmFtZTtcblxuICBjb25zdCBlbmROb2RlTmFtZSA9IHByZXZpb3VzTm9kZS5uYW1lO1xuICBkMy5zZWxlY3RBbGwoYFtkYXRhLWVkZ2U9XCIke2VuZE5vZGVOYW1lfS0tJHtzdGFydE5vZGVOYW1lfVwiXWApXG4gIC5jbGFzc2VkKCdpbnB1dC1lZGdlLWhpZ2hsaWdodCcsIHRydWUpO1xuXG4gIC8vIFRyYWNlIHVwIHRoZSBwYXJlbnRzIG9mIHRoZSBpbnB1dC5cbiAgXy5lYWNoKGRlc3RpbmF0aW9uUGFyZW50UGFpcnMsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGNvbnN0IGlubmVyID0gdmFsdWVbIDAgXTtcbiAgICBjb25zdCBvdXRlciA9IHZhbHVlWyAxIF07XG4gICAgY29uc3QgZWRnZVNlbGVjdG9yID0gYFtkYXRhLWVkZ2U9XCIke2lubmVyLm5hbWV9LS0ke3N0YXJ0Tm9kZVRvcFBhcmVudE5hbWV9YCArXG4gICAgICBgfn4ke291dGVyLm5hbWV9fn5PVVRcIl1gO1xuICAgIGQzLnNlbGVjdEFsbChlZGdlU2VsZWN0b3IpLmNsYXNzZWQoJ2lucHV0LWVkZ2UtaGlnaGxpZ2h0JywgdHJ1ZSk7XG4gIH0pO1xuXG4gIC8vIFRyYWNlIHVwIHRoZSBwYXJlbnRzIG9mIHRoZSBzdGFydCBub2RlLlxuICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgc3RhcnROb2RlSW5kZXg7IGluZGV4KyspIHtcbiAgICBjb25zdCBpbm5lciA9IGluZGV4ZWRTdGFydE5vZGVQYXJlbnRzWyBpbmRleCAtIDEgXTtcbiAgICBjb25zdCBvdXRlciA9IGluZGV4ZWRTdGFydE5vZGVQYXJlbnRzWyBpbmRleCBdO1xuICAgIGNvbnN0IGVkZ2VTZWxlY3RvciA9IGBbZGF0YS1lZGdlPVwiJHt0YXJnZXROb2RlVG9wUGFyZW50TmFtZX1+fiR7b3V0ZXIubmFtZX1gICtcbiAgICAgIGB+fklOLS0ke2lubmVyLm5hbWV9XCJdYDtcbiAgICBkMy5zZWxlY3RBbGwoZWRnZVNlbGVjdG9yKS5jbGFzc2VkKCdpbnB1dC1lZGdlLWhpZ2hsaWdodCcsIHRydWUpO1xuICB9XG59XG5cbiJdfQ==