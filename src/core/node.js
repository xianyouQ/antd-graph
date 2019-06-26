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
export function traceInputs(container,renderGraphInfo) {
    let select
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
    console.log(renderGraphInfo)
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
