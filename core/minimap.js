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
/** @type {?} */
var FRAC_VIEWPOINT_AREA = 0.8;
export default  class Minimap {
  constructor(svg, zoomG, mainZoom, minimap, maxWandH, labelPadding) {
        var _this = this;
        this.svg = svg;
        this.labelPadding = labelPadding;
        this.zoomG = zoomG;
        this.mainZoom = mainZoom;
        this.maxWandH = maxWandH;
        /** @type {?} */
        var $minimap = d3.select(minimap);
        /** @type {?} */
        var $minimapSvg = $minimap.select('svg');
        /** @type {?} */
        var $viewpoint = $minimapSvg.select('rect');
        this.canvas = (/** @type {?} */ ($minimap.select('canvas.first').node()));
        this.canvasRect = this.canvas.getBoundingClientRect();
        /** @type {?} */
        var dragmove = function (d) {
            _this.viewpointCoord.x = ((/** @type {?} */ (d3.event))).x;
            _this.viewpointCoord.y = ((/** @type {?} */ (d3.event))).y;
            _this.updateViewpoint();
        };
        this.viewpointCoord = { x: 0, y: 0 };
        /** @type {?} */
        var drag = d3.drag().subject(Object).on('drag', dragmove);
        $viewpoint.datum((/** @type {?} */ (this.viewpointCoord))).call(drag);
        // Make the minimap clickable.
        $minimapSvg.on('click', function () {
            if (((/** @type {?} */ (d3.event))).defaultPrevented) {
                // This click was part of a drag event, so suppress it.
                return;
            }
            // Update the coordinates of the viewpoint.
            /** @type {?} */
            var minimapOffset = _this.minimapOffset();
            /** @type {?} */
            var width = Number($viewpoint.attr('width'));
            /** @type {?} */
            var height = Number($viewpoint.attr('height'));
            /** @type {?} */
            var clickCoords = d3.mouse((/** @type {?} */ ($minimapSvg.node())));
            _this.viewpointCoord.x = clickCoords[0] - width / 2 - minimapOffset.x;
            _this.viewpointCoord.y = clickCoords[1] - height / 2 - minimapOffset.y;
            _this.updateViewpoint();
        });
        this.viewpoint = (/** @type {?} */ ($viewpoint.node()));
        this.minimapSvg = (/** @type {?} */ ($minimapSvg.node()));
        this.minimap = minimap;
        this.canvasBuffer =
            (/** @type {?} */ ($minimap.select('canvas.second').node()));
        this.downloadCanvas =
            (/** @type {?} */ ($minimap.select('canvas.download').node()));
        d3.select(this.downloadCanvas).style('display', 'none');
        this.update();
    }
    /**
     * @private
     * @return {?}
     */
    minimapOffset = () => {
        return {
            x: (this.canvasRect.width - this.minimapSize.width) / 2,
            y: (this.canvasRect.height - this.minimapSize.height) / 2,
        };
    };
    /**
     * @private
     * @return {?}
     */
    updateViewpoint = () => {
        // Update the coordinates of the viewpoint rectangle.
        d3.select(this.viewpoint)
            .attr('x', this.viewpointCoord.x)
            .attr('y', this.viewpointCoord.y);
        // Update the translation vector of the main svg to reflect the
        // new viewpoint.
        /** @type {?} */
        var mainX = -this.viewpointCoord.x * this.scaleMain / this.scaleMinimap;
        /** @type {?} */
        var mainY = -this.viewpointCoord.y * this.scaleMain / this.scaleMinimap;
        d3.select(this.svg).call(this.mainZoom.transform, d3.zoomIdentity.translate(mainX, mainY).scale(this.scaleMain));
    };
    /**
     * @return {?}
     */
    update = () => {
        var _this = this;
        /** @type {?} */
        var sceneSize = null;
        try {
            // Get the size of the entire scene.
            sceneSize = this.zoomG.getBBox();
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
        var $download = d3.select('#graphdownload');
        this.download = (/** @type {?} */ ($download.node()));
        $download.on('click', function (d) {
            _this.download.href = _this.downloadCanvas.toDataURL('image/png');
        });
        /** @type {?} */
        var $svg = d3.select(this.svg);
        // Read all the style rules in the document and embed them into the svg.
        // The svg needs to be self contained, i.e. all the style rules need to be
        // embedded so the canvas output matches the origin.
        /** @type {?} */
        var stylesText = '';
        for (var k = 0; k < document.styleSheets.length; k++) {
            try {
                /** @type {?} */
                var cssRules = ((/** @type {?} */ (document.styleSheets[k]))).cssRules ||
                    ((/** @type {?} */ (document.styleSheets[k]))).rules;
                if (cssRules == null) {
                    continue;
                }
                for (var i = 0; i < cssRules.length; i++) {
                    // Remove tf-* selectors from the styles.
                    stylesText +=
                        cssRules[i].cssText.replace(/ ?tf-[\w-]+ ?/g, '') + '\n';
                }
            }
            catch (e) {
                if (e.name !== 'SecurityError') {
                    throw e;
                }
            }
        }
        // Temporarily add the css rules to the main svg.
        /** @type {?} */
        var svgStyle = $svg.append('style');
        svgStyle.text(stylesText);
        // Temporarily remove the zoom/pan transform from the main svg since we
        // want the minimap to show a zoomed-out and centered view.
        /** @type {?} */
        var $zoomG = d3.select(this.zoomG);
        /** @type {?} */
        var zoomTransform = $zoomG.attr('transform');
        $zoomG.attr('transform', null);
        // Since we add padding, account for that here.
        sceneSize.height += this.labelPadding * 2;
        sceneSize.width += this.labelPadding * 2;
        // Temporarily assign an explicit width/height to the main svg, since
        // it doesn't have one (uses flex-box), but we need it for the canvas
        // to work.
        $svg
            .attr('width', sceneSize.width)
            .attr('height', sceneSize.height);
        // Since the content inside the svg changed (e.g. a node was expanded),
        // the aspect ratio have also changed. Thus, we need to update the scale
        // factor of the minimap. The scale factor is determined such that both
        // the width and height of the minimap are <= maximum specified w/h.
        this.scaleMinimap =
            this.maxWandH / Math.max(sceneSize.width, sceneSize.height);
        this.minimapSize = {
            width: sceneSize.width * this.scaleMinimap,
            height: sceneSize.height * this.scaleMinimap
        };
        /** @type {?} */
        var minimapOffset = this.minimapOffset();
        // Update the size of the minimap's svg, the buffer canvas and the
        // viewpoint rect.
        d3.select(this.minimapSvg).attr((/** @type {?} */ (this.minimapSize)));
        d3.select(this.canvasBuffer).attr((/** @type {?} */ (this.minimapSize)));
        // Download canvas width and height are multiples of the style width and
        // height in order to increase pixel density of the PNG for clarity.
        /** @type {?} */
        var downloadCanvasSelection = d3.select(this.downloadCanvas);
        downloadCanvasSelection.style('width', sceneSize.width);
        downloadCanvasSelection.style('height', sceneSize.height);
        downloadCanvasSelection.attr('width', 3 * sceneSize.width);
        downloadCanvasSelection.attr('height', 3 * sceneSize.height);
        if (this.translate != null && this.zoom != null) {
            // Update the viewpoint rectangle shape since the aspect ratio of the
            // map has changed.
            requestAnimationFrame(function () { return _this.zoom(); });
        }
        // Serialize the main svg to a string which will be used as the rendering
        // content for the canvas.
        /** @type {?} */
        var svgXml = (new XMLSerializer()).serializeToString(this.svg);
        // Now that the svg is serialized for rendering, remove the temporarily
        // assigned styles, explicit width and height and bring back the pan/zoom
        // transform.
        svgStyle.remove();
        $svg.attr('width', null).attr('height', null);
        $zoomG.attr('transform', zoomTransform);
        /** @type {?} */
        var image = new Image();
        image.onload = function () {
            // Draw the svg content onto the buffer canvas.
            /** @type {?} */
            var context = _this.canvasBuffer.getContext('2d');
            context.clearRect(0, 0, _this.canvasBuffer.width, _this.canvasBuffer.height);
            context.drawImage(image, minimapOffset.x, minimapOffset.y, _this.minimapSize.width, _this.minimapSize.height);
            requestAnimationFrame(function () {
                var _a;
                // Hide the old canvas and show the new buffer canvas.
                d3.select(_this.canvasBuffer).style('display', null);
                d3.select(_this.canvas).style('display', 'none');
                // Swap the two canvases.
                _a = [_this.canvasBuffer, _this.canvas], _this.canvas = _a[0], _this.canvasBuffer = _a[1];
            });
            /** @type {?} */
            var downloadContext = _this.downloadCanvas.getContext('2d');
            downloadContext.clearRect(0, 0, _this.downloadCanvas.width, _this.downloadCanvas.height);
            downloadContext.drawImage(image, 0, 0, _this.downloadCanvas.width, _this.downloadCanvas.height);
        };
        image.onerror = function () {
            /** @type {?} */
            var blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
            image.src = URL.createObjectURL(blob);
        };
        image.src =
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);
    };
    /**
     * Handles changes in zooming/panning. Should be called from the main svg
     * to notify that a zoom/pan was performed and this minimap will update it's
     * viewpoint rectangle.
     *
     * @param translate The translate vector, or none to use the last used one.
     * @param scale The scaling factor, or none to use the last used one.
     */
    /**
     * Handles changes in zooming/panning. Should be called from the main svg
     * to notify that a zoom/pan was performed and this minimap will update it's
     * viewpoint rectangle.
     *
     * @param {?=} transform
     * @return {?}
     */
    zoom = (transform) => {
        if (this.scaleMinimap == null) {
            // Scene is not ready yet.
            return;
        }
        // Update the new translate and scale params, only if specified.
        if (transform) {
            this.translate = [transform.x, transform.y];
            this.scaleMain = transform.k;
        }
        // Update the location of the viewpoint rectangle.
        /** @type {?} */
        var svgRect = this.svg.getBoundingClientRect();
        /** @type {?} */
        var minimapOffset = this.minimapOffset();
        /** @type {?} */
        var $viewpoint = d3.select(this.viewpoint);
        this.viewpointCoord.x = -this.translate[0] * this.scaleMinimap /
            this.scaleMain;
        this.viewpointCoord.y = -this.translate[1] * this.scaleMinimap /
            this.scaleMain;
        /** @type {?} */
        var viewpointWidth = svgRect.width * this.scaleMinimap / this.scaleMain;
        /** @type {?} */
        var viewpointHeight = svgRect.height * this.scaleMinimap / this.scaleMain;
        $viewpoint
            .attr('x', this.viewpointCoord.x + minimapOffset.x)
            .attr('y', this.viewpointCoord.y + minimapOffset.y)
            .attr('width', viewpointWidth)
            .attr('height', viewpointHeight);
        // Show/hide the minimap depending on the viewpoint area as fraction of the
        // whole minimap.
        /** @type {?} */
        var mapWidth = this.minimapSize.width;
        /** @type {?} */
        var mapHeight = this.minimapSize.height;
        /** @type {?} */
        var x = this.viewpointCoord.x;
        /** @type {?} */
        var y = this.viewpointCoord.y;
        /** @type {?} */
        var w = Math.min(Math.max(0, x + viewpointWidth), mapWidth) -
            Math.min(Math.max(0, x), mapWidth);
        /** @type {?} */
        var h = Math.min(Math.max(0, y + viewpointHeight), mapHeight) -
            Math.min(Math.max(0, y), mapHeight);
        /** @type {?} */
        var fracIntersect = (w * h) / (mapWidth * mapHeight);
        if (fracIntersect < FRAC_VIEWPOINT_AREA) {
            this.minimap.classList.remove('hidden');
        }
        else {
            this.minimap.classList.add('hidden');
        }
    };

}

