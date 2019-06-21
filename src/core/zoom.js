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
import * as d3 from 'd3';
import { Subject } from 'rxjs';
import { PARAMS as LAYOUT_PARAMS } from './layout';
/**
 * @record
 */
export function RelativePositionInfo() { }
if (false) {
    /** @type {?} */
    RelativePositionInfo.prototype.topLeft;
    /** @type {?} */
    RelativePositionInfo.prototype.bottomRight;
}
/**
 * 缩放控制器
 * zoomElement {SVGGElement} 被缩放的 svg 元素，必须被 containerEle 包含
 * containerEle {SVGSVGElement} 触发缩放的元素，一般为 zoomElement 的最外层容器
 */
var /**
 * 缩放控制器
 * zoomElement {SVGGElement} 被缩放的 svg 元素，必须被 containerEle 包含
 * containerEle {SVGSVGElement} 触发缩放的元素，一般为 zoomElement 的最外层容器
 */
DagreZoom = /** @class */ (function () {
    function DagreZoom(zoomElement, containerEle) {
        this.zoomElement = zoomElement;
        this.containerEle = containerEle;
        this.transformChange = new Subject();
        this.bind();
    }
    /**
     * @return {?}
     */
    DagreZoom.prototype.bind = /**
     * @return {?}
     */
    function () {
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
    DagreZoom.prototype.unbind = /**
     * @return {?}
     */
    function () {
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
    DagreZoom.prototype.fit = /**
     * 缩放到合适的大小
     * @param {?=} duration
     * @param {?=} scale
     * @return {?}
     */
    function (duration, scale) {
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
    DagreZoom.prototype.panToCenter = /**
     * @param {?} node
     * @return {?}
     */
    function (node) {
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
    DagreZoom.prototype.isOffScreen = /**
     * 判断 node 位置是否在这个 SVG 容器中，
     * X 或者 Y 任意一边超出这返回 true，否则返回 false，
     * 如果 node 不存在，或不在这个 SVG 容器 DOM 中也返回 false
     * @param {?} node
     * @return {?}
     */
    function (node) {
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
    DagreZoom.prototype.emitChange = /**
     * @private
     * @return {?}
     */
    function () {
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
    DagreZoom.prototype.getRelativePositionInfo = /**
     * 获取 node 位于 SVG 容器的相对位置信息
     * @private
     * @param {?} node
     * @return {?}
     */
    function (node) {
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
    return DagreZoom;
}());
/**
 * 缩放控制器
 * zoomElement {SVGGElement} 被缩放的 svg 元素，必须被 containerEle 包含
 * containerEle {SVGSVGElement} 触发缩放的元素，一般为 zoomElement 的最外层容器
 */
export { DagreZoom };
if (false) {
    /** @type {?} */
    DagreZoom.prototype.zoomTransform;
    /** @type {?} */
    DagreZoom.prototype.zoom;
    /** @type {?} */
    DagreZoom.prototype.transformChange;
    /** @type {?} */
    DagreZoom.prototype.zoomElement;
    /** @type {?} */
    DagreZoom.prototype.containerEle;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BuZy16b3Jyby9uZy1wbHVzL2dyYXBoLyIsInNvdXJjZXMiOlsiY29yZS96b29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sSUFBSSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7Ozs7QUFFbkQsMENBR0M7OztJQUZDLHVDQUFrQzs7SUFDbEMsMkNBQXNDOzs7Ozs7O0FBUXhDOzs7Ozs7SUFLRSxtQkFBbUIsV0FBd0IsRUFBUyxZQUEyQjtRQUE1RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFlO1FBRi9FLG9CQUFlLEdBQThCLElBQUksT0FBTyxFQUFFLENBQUM7UUFHekQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQzs7OztJQUVELHdCQUFJOzs7SUFBSjtRQUFBLGlCQWFDO1FBWkMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFrQixDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJO2FBQ1IsRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNULE9BQU87UUFDVCxDQUFDLENBQUM7YUFDRCxFQUFFLENBQUMsTUFBTSxFQUFFO1lBQ1YsS0FBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUN4QyxLQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxD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SyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLE9BQU87WUFDTCxPQUFPLEVBQU0sT0FBTztZQUNwQixXQUFXLEVBQUUsT0FBTztTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUNILGdCQUFDO0FBQUQsQ0FBQyxBQWxKRCxJQWtKQzs7Ozs7Ozs7O0lBakpDLGtDQUFnQzs7SUFDaEMseUJBQXNDOztJQUN0QyxvQ0FBMkQ7O0lBRS9DLGdDQUErQjs7SUFBRSxpQ0FBa0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogVGhpcyBwcm9kdWN0IGNvbnRhaW5zIGEgbW9kaWZpZWQgdmVyc2lvbiBvZiAnVGVuc29yQm9hcmQgcGx1Z2luIGZvciBncmFwaHMnLFxuICogYSBBbmd1bGFyIGltcGxlbWVudGF0aW9uIG9mIG5lc3QtZ3JhcGggdmlzdWFsaXphdGlvblxuICpcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBuZy16b3Jyby1wbHVzIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgJ0xpY2Vuc2UnKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuICdBUyBJUycgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBBUkFNUyBhcyBMQVlPVVRfUEFSQU1TIH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbGF0aXZlUG9zaXRpb25JbmZvIHtcbiAgdG9wTGVmdDogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9O1xuICBib3R0b21SaWdodDogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9O1xufVxuXG4vKipcbiAqIOe8qeaUvuaOp+WItuWZqFxuICogem9vbUVsZW1lbnQge1NWR0dFbGVtZW50fSDooqvnvKnmlL7nmoQgc3ZnIOWFg+e0oO+8jOW/hemhu+iiqyBjb250YWluZXJFbGUg5YyF5ZCrXG4gKiBjb250YWluZXJFbGUge1NWR1NWR0VsZW1lbnR9IOinpuWPkee8qeaUvueahOWFg+e0oO+8jOS4gOiIrOS4uiB6b29tRWxlbWVudCDnmoTmnIDlpJblsYLlrrnlmahcbiAqL1xuZXhwb3J0IGNsYXNzIERhZ3JlWm9vbSB7XG4gIHpvb21UcmFuc2Zvcm06IGQzLlpvb21UcmFuc2Zvcm07XG4gIHpvb206IGQzLlpvb21CZWhhdmlvcjxTVkdFbGVtZW50LCB7fT47XG4gIHRyYW5zZm9ybUNoYW5nZTogU3ViamVjdDxkMy5ab29tVHJhbnNmb3JtPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHpvb21FbGVtZW50OiBTVkdHRWxlbWVudCwgcHVibGljIGNvbnRhaW5lckVsZTogU1ZHU1ZHRWxlbWVudCkge1xuICAgIHRoaXMuYmluZCgpO1xuICB9XG5cbiAgYmluZCgpOiB2b2lkIHtcbiAgICB0aGlzLnpvb20gPSBkMy56b29tPFNWR0VsZW1lbnQsIHt9PigpO1xuICAgIHRoaXMuem9vbVxuICAgIC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgLy8gVE9ET1xuICAgIH0pXG4gICAgLm9uKCd6b29tJywgKCkgPT4ge1xuICAgICAgdGhpcy56b29tVHJhbnNmb3JtID0gZDMuZXZlbnQudHJhbnNmb3JtO1xuICAgICAgdGhpcy5lbWl0Q2hhbmdlKCk7XG4gICAgICBkMy5zZWxlY3QodGhpcy56b29tRWxlbWVudCkuYXR0cigndHJhbnNmb3JtJywgZDMuZXZlbnQudHJhbnNmb3JtKTtcbiAgICB9KTtcbiAgICBkMy5zZWxlY3QodGhpcy5jb250YWluZXJFbGUpLmNhbGwodGhpcy56b29tKVxuICAgIC5vbignZGJsY2xpY2suem9vbScsIG51bGwpO1xuICB9XG5cbiAgdW5iaW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnpvb20pIHtcbiAgICAgIHRoaXMuem9vbVxuICAgICAgLm9uKCdlbmQnLCBudWxsKVxuICAgICAgLm9uKCd6b29tJywgbnVsbCk7XG4gICAgICB0aGlzLnpvb20gPSBudWxsO1xuICAgICAgdGhpcy50cmFuc2Zvcm1DaGFuZ2UuY29tcGxldGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog57yp5pS+5Yiw5ZCI6YCC55qE5aSn5bCPXG4gICAqL1xuICBmaXQoZHVyYXRpb246IG51bWJlciA9IDUwMCwgc2NhbGU6IG51bWJlciA9IDAuOSk6IHZvaWQge1xuICAgIGNvbnN0IHN2Z1JlY3QgPSB0aGlzLmNvbnRhaW5lckVsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsZXQgc2NlbmVTaXplID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgc2NlbmVTaXplID0gdGhpcy56b29tRWxlbWVudC5nZXRCQm94KCk7XG4gICAgICBpZiAoc2NlbmVTaXplLndpZHRoID09PSAwKSB7XG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIHNjZW5lIGFueW1vcmUuIFdlIGhhdmUgYmVlbiBkZXRhY2hlZCBmcm9tIHRoZSBkb20uXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBGaXJlZm94IHByb2R1Y2VkIE5TX0VSUk9SX0ZBSUxVUkUgaWYgd2UgaGF2ZSBiZWVuXG4gICAgICAvLyBkZXRhY2hlZCBmcm9tIHRoZSBkb20uXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihzdmdSZWN0LndpZHRoIC8gc2NlbmVTaXplLndpZHRoLCBzdmdSZWN0LmhlaWdodCAvIHNjZW5lU2l6ZS5oZWlnaHQsIDIpICogc2NhbGU7XG5cbiAgICBjb25zdCBkeCA9IChzdmdSZWN0LndpZHRoIC0gc2NlbmVTaXplLndpZHRoICogZml0U2NhbGUpIC8gMjtcbiAgICBjb25zdCBkeSA9IChzdmdSZWN0LmhlaWdodCAtIHNjZW5lU2l6ZS5oZWlnaHQgKiBmaXRTY2FsZSkgLyAyO1xuICAgIGNvbnN0IHBhcmFtcyA9IExBWU9VVF9QQVJBTVMuZ3JhcGg7XG5cbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBkMy56b29tSWRlbnRpdHlcbiAgICAudHJhbnNsYXRlKGR4ICsgcGFyYW1zLnBhZGRpbmcucGFkZGluZ0xlZnQsIGR5ICsgcGFyYW1zLnBhZGRpbmcucGFkZGluZ1RvcClcbiAgICAuc2NhbGUoZml0U2NhbGUpO1xuXG4gICAgZDMuc2VsZWN0KHRoaXMuY29udGFpbmVyRWxlKVxuICAgIC50cmFuc2l0aW9uKClcbiAgICAuZHVyYXRpb24oZHVyYXRpb24pXG4gICAgLmNhbGwodGhpcy56b29tLnRyYW5zZm9ybSwgdHJhbnNmb3JtKVxuICAgIC5vbignZW5kLmZpdHRlZCcsICgpID0+IHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdGVuZXIgZm9yIHRoZSB6b29tZW5kIGV2ZW50LFxuICAgICAgLy8gc28gd2UgZG9uJ3QgZ2V0IGNhbGxlZCBhdCB0aGUgZW5kIG9mIHJlZ3VsYXIgem9vbSBldmVudHMsXG4gICAgICAvLyBqdXN0IHRob3NlIHRoYXQgZml0IHRoZSBncmFwaCB0byBzY3JlZW4uXG4gICAgICB0aGlzLnpvb20ub24oJ2VuZC5maXR0ZWQnLCBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBhblRvQ2VudGVyKG5vZGU6IFNWR0dFbGVtZW50KTogdm9pZCB7XG5cbiAgICAvLyDnoa7kv50gbm9kZSDlnKgg6L+Z5LiqIFNWRyDlrrnlmajkuK1cbiAgICBpZiAoIW5vZGUgfHwgIXRoaXMuY29udGFpbmVyRWxlLmNvbnRhaW5zKG5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3ZnUmVjdCA9IHRoaXMuY29udGFpbmVyRWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRSZWxhdGl2ZVBvc2l0aW9uSW5mbyhub2RlKTtcbiAgICBjb25zdCBzdmdUcmFuc2Zvcm0gPSBkMy56b29tVHJhbnNmb3JtKHRoaXMuY29udGFpbmVyRWxlKTtcblxuICAgIGNvbnN0IGNlbnRlclggPSAocG9zaXRpb24udG9wTGVmdC54ICsgcG9zaXRpb24uYm90dG9tUmlnaHQueCkgLyAyO1xuICAgIGNvbnN0IGNlbnRlclkgPSAocG9zaXRpb24udG9wTGVmdC55ICsgcG9zaXRpb24uYm90dG9tUmlnaHQueSkgLyAyO1xuICAgIGNvbnN0IGR4ID0gc3ZnUmVjdC5sZWZ0ICsgc3ZnUmVjdC53aWR0aCAvIDIgLSBjZW50ZXJYO1xuICAgIGNvbnN0IGR5ID0gc3ZnUmVjdC50b3AgKyBzdmdSZWN0LmhlaWdodCAvIDIgLSBjZW50ZXJZO1xuXG4gICAgZDMuc2VsZWN0KHRoaXMuY29udGFpbmVyRWxlKS50cmFuc2l0aW9uKCkuZHVyYXRpb24oNTAwKS5jYWxsKFxuICAgICAgdGhpcy56b29tLnRyYW5zbGF0ZUJ5LFxuICAgICAgZHggLyBzdmdUcmFuc2Zvcm0uayxcbiAgICAgIGR5IC8gc3ZnVHJhbnNmb3JtLmspO1xuXG4gIH1cblxuICAvKipcbiAgICog5Yik5patIG5vZGUg5L2N572u5piv5ZCm5Zyo6L+Z5LiqIFNWRyDlrrnlmajkuK3vvIxcbiAgICogWCDmiJbogIUgWSDku7vmhI/kuIDovrnotoXlh7rov5nov5Tlm54gdHJ1Ze+8jOWQpuWImei/lOWbniBmYWxzZe+8jFxuICAgKiDlpoLmnpwgbm9kZSDkuI3lrZjlnKjvvIzmiJbkuI3lnKjov5nkuKogU1ZHIOWuueWZqCBET00g5Lit5Lmf6L+U5ZueIGZhbHNlXG4gICAqL1xuICBpc09mZlNjcmVlbihub2RlOiBTVkdHRWxlbWVudCk6IGJvb2xlYW4ge1xuXG4gICAgLy8g56Gu5L+dIG5vZGUg5ZyoIOi/meS4qiBTVkcg5a655Zmo5LitXG4gICAgaWYgKCFub2RlIHx8ICF0aGlzLmNvbnRhaW5lckVsZS5jb250YWlucyhub2RlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0UmVsYXRpdmVQb3NpdGlvbkluZm8obm9kZSk7XG4gICAgY29uc3Qgc3ZnUmVjdCA9IHRoaXMuY29udGFpbmVyRWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGhvcml6b250YWxCb3VuZCA9IHN2Z1JlY3QubGVmdCArIHN2Z1JlY3Qud2lkdGg7XG4gICAgY29uc3QgdmVydGljYWxCb3VuZCA9IHN2Z1JlY3QudG9wICsgc3ZnUmVjdC5oZWlnaHQ7XG4gICAgY29uc3QgaXNPdXRzaWRlT2ZCb3VuZHMgPSAoc3RhcnQsIGVuZCwgbG93ZXJCb3VuZCwgdXBwZXJCb3VuZCkgPT4ge1xuICAgICAgLy8gUmV0dXJuIGlmIGV2ZW4gYSBwYXJ0IG9mIHRoZSBpbnRlcnZhbCBpcyBvdXQgb2YgYm91bmRzLlxuICAgICAgcmV0dXJuICEoc3RhcnQgPiBsb3dlckJvdW5kICYmIGVuZCA8IHVwcGVyQm91bmQpO1xuICAgIH07XG5cbiAgICAvLyBYIOaIluiAhSBZIOS7u+aEj+S4gOi+uei2heWHulxuICAgIHJldHVybiBpc091dHNpZGVPZkJvdW5kcyhwb3NpdGlvbi50b3BMZWZ0LngsIHBvc2l0aW9uLmJvdHRvbVJpZ2h0LngsIHN2Z1JlY3QubGVmdCwgaG9yaXpvbnRhbEJvdW5kKSB8fFxuICAgICAgaXNPdXRzaWRlT2ZCb3VuZHMocG9zaXRpb24udG9wTGVmdC55LCBwb3NpdGlvbi5ib3R0b21SaWdodC55LCBzdmdSZWN0LnRvcCwgdmVydGljYWxCb3VuZCk7XG4gIH1cblxuICBwcml2YXRlIGVtaXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy50cmFuc2Zvcm1DaGFuZ2UubmV4dCh0aGlzLnpvb21UcmFuc2Zvcm0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPliBub2RlIOS9jeS6jiBTVkcg5a655Zmo55qE55u45a+55L2N572u5L+h5oGvXG4gICAqL1xuICBwcml2YXRlIGdldFJlbGF0aXZlUG9zaXRpb25JbmZvKG5vZGU6IFNWR0dFbGVtZW50KTogUmVsYXRpdmVQb3NpdGlvbkluZm8ge1xuICAgIGNvbnN0IG5vZGVCb3ggPSBub2RlLmdldEJCb3goKTtcbiAgICBjb25zdCBub2RlQ3RtID0gbm9kZS5nZXRTY3JlZW5DVE0oKTtcbiAgICBsZXQgcG9pbnRUTCA9IHRoaXMuY29udGFpbmVyRWxlLmNyZWF0ZVNWR1BvaW50KCk7XG4gICAgbGV0IHBvaW50QlIgPSB0aGlzLmNvbnRhaW5lckVsZS5jcmVhdGVTVkdQb2ludCgpO1xuXG4gICAgcG9pbnRUTC54ID0gbm9kZUJveC54O1xuICAgIHBvaW50VEwueSA9IG5vZGVCb3gueTtcbiAgICBwb2ludEJSLnggPSBub2RlQm94LnggKyBub2RlQm94LndpZHRoO1xuICAgIHBvaW50QlIueSA9IG5vZGVCb3gueSArIG5vZGVCb3guaGVpZ2h0O1xuICAgIHBvaW50VEwgPSBwb2ludFRMLm1hdHJpeFRyYW5zZm9ybShub2RlQ3RtKTtcbiAgICBwb2ludEJSID0gcG9pbnRCUi5tYXRyaXhUcmFuc2Zvcm0obm9kZUN0bSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcExlZnQgICAgOiBwb2ludFRMLFxuICAgICAgYm90dG9tUmlnaHQ6IHBvaW50QlJcbiAgICB9O1xuICB9XG59XG4iXX0=