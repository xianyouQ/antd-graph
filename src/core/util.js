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
/** @type {?} */
var ASYNC_TASK_DELAY = 20;
/**
 * @template T
 * @param {?} task
 * @return {?}
 */
export function runAsyncTask(task) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            try {
                resolve(task());
            }
            catch (e) {
                reject(e);
            }
        }, ASYNC_TASK_DELAY);
    });
}
