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
import * as d3 from 'd3';
import { Subject } from 'rxjs';
import { PARAMS as LAYOUT_PARAMS } from './layout';
/**
 * @record
 */
export function RelativePositionInfo() { }

/**
 * 缩放控制器
 * zoomElement {SVGGElement} 被缩放的 svg 元素，必须被 containerEle 包含
 * containerEle {SVGSVGElement} 触发缩放的元素，一般为 zoomElement 的最外层容器
 */
export class DagreZoom {
  constructor(zoomElement, containerEle) {
        this.zoomElement = zoomElement;
        this.containerEle = containerEle;
        this.transformChange = new Subject();
        this.bind();
    }
    /**
     * @return {?}
     */
    bind = () => {
        var _this = this;
        this.zoom = d3.zoom();
        this.zoom
            .on('end', function () {
            // TODO
        })
            .on('zoom', function () {
            _this.zoomTransform = d3.event.transform;
            _this.emitChange();
            d3.select(_this.zoomElement).attr('transform', d3.event.transform);
        });
        d3.select(this.containerEle).call(this.zoom)
            .on('dblclick.zoom', null);
    };
    /**
     * @return {?}
     */
    unbind = () => {
        if (this.zoom) {
            this.zoom
                .on('end', null)
                .on('zoom', null);
            this.zoom = null;
            this.transformChange.complete();
        }
    };
    /**
     * 缩放到合适的大小
     */
    /**
     * 缩放到合适的大小
     * @param {?=} duration
     * @param {?=} scale
     * @return {?}
     */
    fit = (duration, scale) => {
        var _this = this;
        if (duration === void 0) { duration = 500; }
        if (scale === void 0) { scale = 0.9; }
        /** @type {?} */
        var svgRect = this.containerEle.getBoundingClientRect();
        /** @type {?} */
        var sceneSize = null;
        try {
            sceneSize = this.zoomElement.getBBox();
            if (sceneSize.width === 0) {
                // There is no scene anymore. We have been detached from the dom.
                return;
            }
        }
        catch (e) {
            // Firefox produced NS_ERROR_FAILURE if we have been
            // detached from the dom.
            return;
        }
        /** @type {?} */
        var fitScale = Math.min(svgRect.width / sceneSize.width, svgRect.height / sceneSize.height, 2) * scale;
        /** @type {?} */
        var dx = (svgRect.width - sceneSize.width * fitScale) / 2;
        /** @type {?} */
        var dy = (svgRect.height - sceneSize.height * fitScale) / 2;
        /** @type {?} */
        var params = LAYOUT_PARAMS.graph;
        /** @type {?} */
        var transform = d3.zoomIdentity
            .translate(dx + params.padding.paddingLeft, dy + params.padding.paddingTop)
            .scale(fitScale);
        d3.select(this.containerEle)
            .transition()
            .duration(duration)
            .call(this.zoom.transform, transform)
            .on('end.fitted', function () {
            // Remove the listener for the zoomend event,
            // so we don't get called at the end of regular zoom events,
            // just those that fit the graph to screen.
            _this.zoom.on('end.fitted', null);
        });
    };
    /**
     * @param {?} node
     * @return {?}
     */
    panToCenter = (node) => {
        // 确保 node 在 这个 SVG 容器中
        if (!node || !this.containerEle.contains(node)) {
            return;
        }
        /** @type {?} */
        var svgRect = this.containerEle.getBoundingClientRect();
        /** @type {?} */
        var position = this.getRelativePositionInfo(node);
        /** @type {?} */
        var svgTransform = d3.zoomTransform(this.containerEle);
        /** @type {?} */
        var centerX = (position.topLeft.x + position.bottomRight.x) / 2;
        /** @type {?} */
        var centerY = (position.topLeft.y + position.bottomRight.y) / 2;
        /** @type {?} */
        var dx = svgRect.left + svgRect.width / 2 - centerX;
        /** @type {?} */
        var dy = svgRect.top + svgRect.height / 2 - centerY;
        d3.select(this.containerEle).transition().duration(500).call(this.zoom.translateBy, dx / svgTransform.k, dy / svgTransform.k);
    };
    /**
     * 判断 node 位置是否在这个 SVG 容器中，
     * X 或者 Y 任意一边超出这返回 true，否则返回 false，
     * 如果 node 不存在，或不在这个 SVG 容器 DOM 中也返回 false
     */
    /**
     * 判断 node 位置是否在这个 SVG 容器中，
     * X 或者 Y 任意一边超出这返回 true，否则返回 false，
     * 如果 node 不存在，或不在这个 SVG 容器 DOM 中也返回 false
     * @param {?} node
     * @return {?}
     */
    isOffScreen = (node) => {
        // 确保 node 在 这个 SVG 容器中
        if (!node || !this.containerEle.contains(node)) {
            return false;
        }
        /** @type {?} */
        var position = this.getRelativePositionInfo(node);
        /** @type {?} */
        var svgRect = this.containerEle.getBoundingClientRect();
        /** @type {?} */
        var horizontalBound = svgRect.left + svgRect.width;
        /** @type {?} */
        var verticalBound = svgRect.top + svgRect.height;
        /** @type {?} */
        var isOutsideOfBounds = function (start, end, lowerBound, upperBound) {
            // Return if even a part of the interval is out of bounds.
            return !(start > lowerBound && end < upperBound);
        };
        // X 或者 Y 任意一边超出
        return isOutsideOfBounds(position.topLeft.x, position.bottomRight.x, svgRect.left, horizontalBound) ||
            isOutsideOfBounds(position.topLeft.y, position.bottomRight.y, svgRect.top, verticalBound);
    };
    /**
     * @private
     * @return {?}
     */
    emitChange = () => {
        this.transformChange.next(this.zoomTransform);
    };
    /**
     * 获取 node 位于 SVG 容器的相对位置信息
     */
    /**
     * 获取 node 位于 SVG 容器的相对位置信息
     * @private
     * @param {?} node
     * @return {?}
     */
    getRelativePositionInfo = (node) => {
        /** @type {?} */
        var nodeBox = node.getBBox();
        /** @type {?} */
        var nodeCtm = node.getScreenCTM();
        /** @type {?} */
        var pointTL = this.containerEle.createSVGPoint();
        /** @type {?} */
        var pointBR = this.containerEle.createSVGPoint();
        pointTL.x = nodeBox.x;
        pointTL.y = nodeBox.y;
        pointBR.x = nodeBox.x + nodeBox.width;
        pointBR.y = nodeBox.y + nodeBox.height;
        pointTL = pointTL.matrixTransform(nodeCtm);
        pointBR = pointBR.matrixTransform(nodeCtm);
        return {
            topLeft: pointTL,
            bottomRight: pointBR
        };
    };
}
