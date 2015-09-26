/******/
(function (modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/
    var installedModules = {};

    /******/ 	// The require function
    /******/
    function __webpack_require__(moduleId) {

        /******/ 		// Check if module is in cache
        /******/
        if (installedModules[moduleId])
        /******/            return installedModules[moduleId].exports;

        /******/ 		// Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/            exports: {},
            /******/            id: moduleId,
            /******/            loaded: false
            /******/
        };

        /******/ 		// Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/ 		// Flag the module as loaded
        /******/
        module.loaded = true;

        /******/ 		// Return the exports of the module
        /******/
        return module.exports;
        /******/
    }


    /******/ 	// expose the modules object (__webpack_modules__)
    /******/
    __webpack_require__.m = modules;

    /******/ 	// expose the module cache
    /******/
    __webpack_require__.c = installedModules;

    /******/ 	// __webpack_public_path__
    /******/
    __webpack_require__.p = "";

    /******/ 	// Load entry module and return exports
    /******/
    return __webpack_require__(0);
    /******/
})
    /************************************************************************/
    /******/([
    /* 0 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        module.exports = {
            BaseCollectionView: __webpack_require__(1),
            BaseComponent: __webpack_require__(11),
            BaseItemView: __webpack_require__(12),
            BaseModel: __webpack_require__(13),
            BaseTreeView: __webpack_require__(14),
            BaseView: __webpack_require__(2),
            Emitter: __webpack_require__(5),
            util: __webpack_require__(4),
            defer: __webpack_require__(4).defer
        };

        /***/
    },
    /* 1 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _baseView = __webpack_require__(2);

        var _baseView2 = _interopRequireDefault(_baseView);

        function BaseCollectionView() {
        }

        BaseCollectionView.prototype = {

            template: void 0,

            render: function render(collection) {
                if (!this.rootNode) {
                    throw new Error('RootNode not specified');
                }

                var new_vdom = this.renderTpl(this.template, {
                    collection: this.traverse(collection)
                });

                this['super'].render.call(this, new_vdom);
            },

            init: function init() {
                if (!this.templates) {
                    throw new Error('Templates not specified');
                }

                if (!this.template) {
                    throw new Error('Template not specified');
                }

                this['super'].init.call(this);
            },

            traverse: function traverse(collection) {
                if (!collection) {
                    return '';
                }

                if (Object.prototype.toString.call(collection) !== '[object Array]') {
                    throw new Error('Collection must be an Array');
                }

                var length = collection.length,
                    i = 0,
                    classHasFilterFunc = this.checkClassHasFilterFunc(),
                    filterFunc = undefined;

                if (classHasFilterFunc) {
                    filterFunc = function (item, index) {
                        var curAC = this.activeSuperContext;
                        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                        var res = this.filter(item, index);
                        this.activeSuperContext = curAC;
                        return res;
                    };
                } else {
                    filterFunc = (function () {
                        var firstInCol = Object.keys(this.templates)[0];
                        return function (item) {
                            return this.renderTpl(this.templates[firstInCol], item);
                        };
                    })();
                }

                var result = [];

                for (; i < length; i++) {
                    result.push(filterFunc.call(this, collection[i], i));
                }

                return result;
            },

            checkClassHasFilterFunc: function checkClassHasFilterFunc() {
                var curAC = this.activeSuperContext,
                    flag = false;

                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                if (this[this.activeSuperContext + '$filter']) {
                    flag = true;
                }
                this.activeSuperContext = curAC;

                return flag;
            }

        };

        BaseCollectionView['extends'](_baseView2['default']);

        exports['default'] = BaseCollectionView;
        module.exports = exports['default'];

        /***/
    },
    /* 2 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _virtualDom = __webpack_require__(3);

        //import diff from 'virtual-dom/diff';
        //import patch from 'virtual-dom/patch';
        //import createElement from 'virtual-dom/create';

        var _virtualDom2 = _interopRequireDefault(_virtualDom);

        var _util = __webpack_require__(4);

        var _EmitterJs = __webpack_require__(5);

        var _EmitterJs2 = _interopRequireDefault(_EmitterJs);

        var diff = _virtualDom2['default'].diff;
        var patch = _virtualDom2['default'].patch;
        var createElement = _virtualDom2['default'].create;
        var h = _virtualDom2['default'].h;

        function BaseView() {
        }

        BaseView.prototype = {

            _emitter: void 0,

            rootNode: void 0,

            _vdom: void 0,

            _vdomNode: void 0,

            _util: {
                emitter: _EmitterJs2['default'],
                defer: _util.defer,
                addEvent: _util.addEvent
            },

            __vdom: {
                diff: diff,
                patch: patch,
                createElement: createElement,
                h: h
            },

            _listeners: void 0,

            renderTpl: function renderTpl(func, obj) {
                var h = this.__vdom.h;
                return eval(func(obj));
            },

            render: function render(new_vdom) {
                if (this._vdom) {
                    var patches = this.__vdom.diff(this._vdom, new_vdom);
                    this._vdomNode = this.__vdom.patch(this._vdomNode, patches);
                } else {
                    this._vdomNode = this.__vdom.createElement(new_vdom);
                }
                this._vdom = new_vdom;

                this._initRootNode();

                this.rootNode.appendChild(this._vdomNode);

                this.trigger('renderComplete');
            },

            _initRootNode: function _initRootNode() {
                if (!this.rootNode) {
                    throw new Error('RootNode not specified in ' + this.inheritChain[this.inheritChain.length - 1]);
                }
                if (_.isString(this.rootNode)) {
                    this.rootNode = $(this.rootNode)[0];
                }
            },

            _createEvents: function _createEvents(events) {
                if (!_.isObject(events)) {
                    throw new Error('Events must be a hash object');
                }

                for (var _event in events) {
                    if (events.hasOwnProperty(_event)) {
                        var event_arr = _event.split(' ');
                        var type = event_arr[0];
                        var target = event_arr[1];
                        var prevent = false;
                        if (event_arr.length > 2 && event_arr[2] === 'preventDefault') {
                            prevent = true;
                        }

                        if (!this._listeners[type]) {
                            this._listeners[type] = {};

                            this._initRootNode();

                            this._util.addEvent(this.rootNode, type, this._searchListener(this, this.rootNode));
                        }

                        var listener = events[_event];

                        if (!(_.isObject(listener) && listener._queue)) {
                            if (_.isFunction(listener)) {
                                listener = this._util.defer(listener);
                            } else {
                                throw new Error('Callback must be a function');
                            }
                        }

                        this._listeners[type][target] = listener;
                        this._listeners[type][target].prevent = prevent;
                    }
                }
            },

            _searchListener: function _searchListener(context, rootNode) {
                return function (event) {
                    //event = event.originalEvent; //because use jQuery, temp
                    var target = event.target;

                    function searchByTarget(target, context) {
                        target = {
                            tag: target.nodeName.toLowerCase(),
                            className: target.className,
                            id: target.id
                        };
                        var eventType = event.type;

                        function searchInListeners(target, context) {
                            var listener = context._listeners[eventType][target];
                            if (listener) {
                                var _ret = (function () {
                                    if (listener.prevent) {
                                        event.preventDefault();
                                    }
                                    var _resolve = undefined;
                                    var promise = new Promise(function (resolve) {
                                        _resolve = resolve;
                                    });
                                    listener._queue.forEach(function (o) {
                                        promise = promise.bind(context).then(o.onFulfill, o.onReject);
                                    });
                                    _resolve(event);

                                    return {
                                        v: true
                                    };
                                })();

                                if (typeof _ret === 'object') return _ret.v;
                            } else {
                                return false;
                            }
                        }

                        var hasListener = false;
                        if (!searchInListeners(target.tag, context)) {
                            //TODO: not search when target does not have class or id
                            if (target.className && typeof target.className === 'string') {
                                var classes = target.className.split(' ');
                                classes.forEach(function (className) {
                                    if (searchInListeners('.' + className, context)) {
                                        //TODO: multyple classes
                                        hasListener = true;
                                    }
                                });
                            }

                            if (target.id && !hasListener) {
                                if (searchInListeners('#' + target.id, context)) {
                                    hasListener = true;
                                }
                            }
                        } else {
                            hasListener = true;
                        }

                        return hasListener;
                    }

                    while (target) {
                        if (!searchByTarget(target, context)) {
                            //TODO: for example mouseout target is not rootNode or his children (not search)
                            if (target === rootNode) {
                                break;
                            } else {
                                target = target.parentNode;
                            }
                        } else {
                            break;
                        }
                    }
                    event.stopPropagation();
                };
            },

            init: function init() {
                this._listeners = {};

                if (this.events) {
                    this._createEvents(this.events);
                }

                this._emitter = this._util.emitter();
                this._emitter.name = this.inheritChain[this.inheritChain.length - 1];
            },

            on: function on(event, context) {
                return this._emitter.on(event, context);
            },

            once: function once(event, context) {
                return this._emitter.once(event, context);
            },

            trigger: function trigger(event, data) {
                return this._emitter.trigger(event, data);
            }
        };

        BaseView.rootClass();

        exports['default'] = BaseView;
        module.exports = exports['default'];

        /***/
    },
    /* 3 */
    /***/ function (module, exports) {

        module.exports = virtualDom;

        /***/
    },
    /* 4 */
    /***/ function (module, exports) {

        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.addEvent = addEvent;
        exports.defer = defer;

        function addEvent(elem, event, fn) {
            if (elem.addEventListener) {
                elem.addEventListener(event, fn, false);
            } else {
                elem.attachEvent("on" + event, function () {
                    // set the this pointer same as addEventListener when fn is called
                    return fn.call(elem, window.event);
                });
            }
        }

        var clone = function clone(first, second) {
            if (Object.prototype.toString.call(second) !== "[object Object]" || Object.prototype.toString.call(first) !== "[object Object]") {
                throw new Error("variables must be type of object");
            }

            for (var i in first) {
                if (first.hasOwnProperty(i)) {
                    second[i] = first[i];
                }
            }
        };

        var intersect = function intersect(x, y) {
            var ret = [],
                x_len = x.length,
                y_len = y.length;

            for (var i = 0; i < x_len; i++) {
                for (var z = 0; z < y_len; z++) {
                    if (x[i] === y[z]) {
                        ret.push(x[i]);
                        break;
                    }
                }
            }

            return ret;
        };

        if (typeof Function.prototype["extends"] !== 'function') Function.prototype["extends"] = function (Parent) {
            var thisClassName = this.name,
                parentClassName = Parent.name,
                thisProtoKeys = Object.keys(this.prototype),
                parentProtoKeys = Object.keys(Parent.prototype);

            if (!thisClassName && !parentClassName) {
                //if function.name not working
                var functionNameRegExp = /^function\s*([^\s(]+)/;
                thisClassName = functionNameRegExp.exec(this.toString())[1];
                parentClassName = functionNameRegExp.exec(Parent.toString())[1];
            }

            var hasInThisPrototype = (function (thisProto, parentProto) {
                var intersection = intersect(parentProto, thisProto),
                    inter_len = intersection.length,
                    result = {};

                for (var i = 0; i < inter_len; i++) {
                    result[intersection[i]] = true;
                }

                return result;
            })(thisProtoKeys, parentProtoKeys);

            var thisProtoKeysLength = thisProtoKeys.length,
                parentProtoKeysLength = parentProtoKeys.length,
                funcInStr,
                i;

            var getFunctionBody = function getFunctionBody(func) {
                var result = /function[\w\s\$]*\(([\w\s,]*)[\/\*\*\/]*\)[^{]+\{([\s\S]*)\}$/g.exec(func.toString());

                return {
                    args: result[1].trim(),
                    body: result[2]
                };
            };

            this.prototype.inheritChain = Array.prototype.slice.call(Parent.prototype.inheritChain);
            this.prototype.inheritChain.push(thisClassName);

            this.prototype.activeSuperContext = thisClassName;
            this.prototype.changeSuperContext = function () {
                var inheritChainLen = this.inheritChain.length;

                for (var i = inheritChainLen; i > -1; i--) {
                    if (this.activeSuperContext === this.inheritChain[i]) break;
                }

                this.activeSuperContext = this.inheritChain[i - 1];
            };

            for (i = 0; i < parentProtoKeysLength; i++) {
                if (typeof Parent.prototype[parentProtoKeys[i]] === 'function') {
                    if (!hasInThisPrototype[parentProtoKeys[i]]) {
                        if (parentProtoKeys[i] === 'changeSuperContext' || parentProtoKeys[i] === 'super') {
                            continue;
                        } else if (parentProtoKeys[i].indexOf('$') !== -1 || Parent.prototype[parentProtoKeys[i]].inherited) {
                            funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                            this.prototype[parentProtoKeys[i]] = eval.call(null, '(function ' + parentProtoKeys[i] + '(' + funcInStr.args + ') {' + funcInStr.body + '})');
                        } else {
                            funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                            this.prototype[parentClassName + '$' + parentProtoKeys[i]] = eval.call(null, '(function ' + parentClassName + '$' + parentProtoKeys[i] + '(' + funcInStr.args + ') {' + funcInStr.body + '})');
                            this.prototype[parentProtoKeys[i]] = eval.call(null, '(function ' + parentProtoKeys[i] + '(' + funcInStr.args + ') {' + 'if(!this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\']) {' + 'var currentActiveSuperContext = this.activeSuperContext;' + 'while(!this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'])' + 'this.changeSuperContext();' + 'var res = this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'](' + funcInStr.args + ');' + 'this.activeSuperContext = currentActiveSuperContext;' + 'return res;' + '} else {' + 'return this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'](' + funcInStr.args + ');' + '}' + '})');

                            this.prototype[parentProtoKeys[i]].inherited = true;
                        }
                    }
                } else {
                    if (!hasInThisPrototype[parentProtoKeys[i]] && parentProtoKeys[i] !== 'inheritChain') {
                        if (Object.prototype.toString.call(Parent.prototype[parentProtoKeys[i]]) === "[object Object]") {
                            this.prototype[parentProtoKeys[i]] = {};
                            clone(Parent.prototype[parentProtoKeys[i]], this.prototype[parentProtoKeys[i]]);
                        }
                    }
                }
            }

            var parentConstructor = getFunctionBody(Parent.toString());

            this.prototype[parentClassName + '$constructor'] = eval.call(null, '(function ' + parentClassName + '$constructor(' + parentConstructor.args + ') {' + parentConstructor.body + '})');

            this.prototype["super"] = eval.call(null, '(function superFn(' + parentConstructor.args + ') {' + 'this.changeSuperContext(); ' + 'var i = this.activeSuperContext + \'$constructor\';' + 'this[i](' + parentConstructor.args + ');' + 'this.activeSuperContext = \'' + thisClassName + '\'; })');

            if (Parent.prototype["super"]) {
                var superKeys = Object.keys(Parent.prototype["super"]),
                    superKeysLen = superKeys.length;

                for (i = 0; i < superKeysLen; i++) {
                    this.prototype["super"][superKeys[i]] = Parent.prototype["super"][superKeys[i]];
                }
            }

            for (i = 0; i < thisProtoKeysLength; i++) {
                if (typeof this.prototype[thisProtoKeys[i]] === 'function') {
                    funcInStr = getFunctionBody(this.prototype[thisProtoKeys[i]]);

                    this.prototype[thisClassName + '$' + thisProtoKeys[i]] = eval.call(null, '(function ' + thisClassName + '$' + thisProtoKeys[i] + '(' + funcInStr.args + ') {' + funcInStr.body + '})');
                    this.prototype[thisProtoKeys[i]] = eval.call(null, '(function ' + thisProtoKeys[i] + '(' + funcInStr.args + ') {' + 'return this[this.activeSuperContext + \'$' + thisProtoKeys[i] + '\'](' + funcInStr.args + '); })');
                    this.prototype["super"][thisProtoKeys[i]] = eval.call(null, '(function super$' + thisProtoKeys[i] + '(' + funcInStr.args + ') {' + 'this.changeSuperContext(); ' + 'var i = this.activeSuperContext + \'$' + thisProtoKeys[i] + '\';' + 'var res = this[i](' + funcInStr.args + ');' + 'this.activeSuperContext = \'' + thisClassName + '\';' + 'return res; })');
                }
            }
        };

        if (typeof Function.prototype.rootClass !== 'function') Function.prototype.rootClass = function () {
            var thisClassName = this.name,
                thisProtoKeys = Object.keys(this.prototype),
                thisProtoKeysLength = thisProtoKeys.length,
                i,
                funcInStr;

            if (!thisClassName) {
                //if function.name not working
                var functionNameRegExp = /^function\s*([^\s(]+)/;
                thisClassName = functionNameRegExp.exec(this.toString())[1];
            }

            var getFunctionBody = function getFunctionBody(func) {
                var result = /function[\w\s]*\(([\w\s,]*)\)[^{]+\{([\s\S]*)\}$/.exec(func.toString());

                return {
                    args: result[1],
                    body: result[2]
                };
            };

            this.prototype.inheritChain = [thisClassName];

            for (i = 0; i < thisProtoKeysLength; i++) {
                if (typeof this.prototype[thisProtoKeys[i]] === 'function') {
                    funcInStr = getFunctionBody(this.prototype[thisProtoKeys[i]]);

                    if (funcInStr.args.length === 0) {
                        this.prototype[thisClassName + '$' + thisProtoKeys[i]] = Function(funcInStr.body);
                        this.prototype[thisProtoKeys[i]] = Function('return this[\'' + thisClassName + '$' + thisProtoKeys[i] + '\']();');
                    } else {
                        this.prototype[thisClassName + '$' + thisProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
                        this.prototype[thisProtoKeys[i]] = Function(funcInStr.args, 'return this[\'' + thisClassName + '$' + thisProtoKeys[i] + '\'](' + funcInStr.args + ');');
                    }
                }
            }
        };

        function defer(onFulfill, onReject) {
            return {
                _queue: [{
                    onFulfill: onFulfill,
                    onReject: onReject
                }],
                then: function then(onFulfill, onReject) {
                    this._queue.push({
                        onFulfill: onFulfill,
                        onReject: onReject
                    });

                    return this;
                }
            };
        }

        /***/
    },
    /* 5 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _fastemitterWithContext = __webpack_require__(6);

        var _fastemitterWithContext2 = _interopRequireDefault(_fastemitterWithContext);

        var _bluebird = __webpack_require__(10);

        var _bluebird2 = _interopRequireDefault(_bluebird);

        "use strict";

        var Emitter = function Emitter() {
            var emitter, emitterProxy;

            emitter = new _fastemitterWithContext2['default']();

            emitterProxy = {

                on: function on(event, context) {
                    var promise,
                        queue = [];
                    emitter.on(event, function (data) {
                        promise = new _bluebird2['default'](function (resolve) {
                            resolve(data);
                        });
                        var self = this;
                        queue.forEach(function (obj) {
                            promise = promise.bind(self).then(obj.onResolve, obj.onReject);
                        });
                    }, context);
                    return {
                        then: function then(onResolve, onReject) {
                            queue.push({
                                onResolve: onResolve,
                                onReject: onReject
                            });
                        }
                    };
                },

                off: function off(event) {
                    emitter.off(event);
                },

                trigger: function trigger(event, data) {
                    console.log(event, this.name);
                    emitter.trigger(event, data);
                },

                once: function once(event, context) {
                    return new _bluebird2['default'](function (resolve) {
                        emitter.once(event, function (data) {
                            resolve(data);
                        }, context);
                    });
                },

                _commandTo: function _commandTo(event, data) {
                    this.trigger(event + ':up', data);
                    return this.once(event + ':down');
                },

                _commandFrom: function _commandFrom(event, context) {
                    var promise = this.on(event + ':up', context);
                    return {
                        then: function then(onResolve, onReject) {
                            promise = promise.then(onResolve, onReject);
                            return this;
                        },
                        end: function end() {
                            promise.then(function (data) {
                                emitterProxy.trigger(event + ':down', data);
                            });
                        }
                    };
                },

                _commands: {},

                commandTo: function commandTo(event, data) {
                    if (!this._commands[event]) {
                        this._commands[event] = {
                            id: 0
                        };
                    }
                    var id = this._commands[event].id;
                    this.trigger(event + ':uniqueBefore', this._commands[event].id++);
                    var self = this,
                        queue = [];
                    emitterProxy.once(event + ':uniqueAfter').then(function () {
                        var promise = self._commandTo(event + ':' + id++, data);
                        queue.forEach(function (obj) {
                            promise = promise.then(obj.onResolve, obj.onReject);
                        });
                    });
                    return {
                        then: function then(onResolve, onReject) {
                            queue.push({
                                onResolve: onResolve,
                                onReject: onReject
                            });
                        }
                    };
                },

                commandFrom: function commandFrom(event) {
                    var queue = [];
                    this.on(event + ':uniqueBefore').then(function (id) {
                        var promise = emitterProxy.once(event + ':' + id + ':up');
                        emitterProxy.trigger(event + ':uniqueAfter');
                        queue.forEach(function (obj) {
                            promise = promise.then(obj.onResolve, obj.onReject);
                        });
                        promise.then(function (data) {
                            emitterProxy.trigger(event + ':' + id + ':down', data);
                        });
                    });
                    return {
                        then: function then(onResolve, onReject) {
                            queue.push({
                                onResolve: onResolve,
                                onReject: onReject
                            });
                            return this;
                        }
                    };
                },

                Promise: _bluebird2['default']
            };

            return emitterProxy;
        };

        exports['default'] = Emitter;
        module.exports = exports['default'];

        /***/
    },
    /* 6 */
    /***/ function (module, exports, __webpack_require__) {

        /* WEBPACK VAR INJECTION */
        (function (process) {/* jshint -W014, -W116, -W106, -W064, -W097, -W079 */
            /**
             * @preserve Copyright (c) 2013 Petka Antonov
             *
             * Permission is hereby granted, free of charge, to any person obtaining a copy
             * of this software and associated documentation files (the "Software"), to deal
             * in the Software without restriction, including without limitation the rights
             * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             * copies of the Software, and to permit persons to whom the Software is
             * furnished to do so, subject to the following conditions:</p>
             *
             * The above copyright notice and this permission notice shall be included in
             * all copies or substantial portions of the Software.
             *
             * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
             * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             * THE SOFTWARE.
             */
            "use strict";
            //TODO Prevent passing the same function identity multiple times as a listener
            //for the same event

            //TODO maxListeners API

            var INITIAL_DISTINCT_HANDLER_TYPES = 6;
            var domain;
            var isArray = Array.isArray;
            var objectCreate = Object.create;

            function EventEmitter() {
                this.domain = null;
                if (EventEmitter.usingDomains) {
                    domain = domain || __webpack_require__(8);
                    if (domain.active && !(this instanceof domain.Domain)) {
                        this.domain = domain.active;
                    }
                }
                this._maybeInit();
            }

            EventEmitter.EventEmitter = EventEmitter;

            EventEmitter.usingDomains = false;
            EventEmitter.defaultMaxListeners = 10;

            EventEmitter.prototype.setMaxListeners =
                function EventEmitter$setMaxListeners(n) {
                    if (( n >>> 0 ) !== n) {
                        throw TypeError("n must be a positive integer");
                    }
                    this._maxListeners = n;
                    return this;
                };

            EventEmitter.prototype.emit = function EventEmitter$emit(type, a1, a2) {
                if (type === void 0) return false;
                if (typeof type !== "string") type = ( "" + type );
                this._maybeInit();

                var index = this._indexOfEvent(type);

                if (index < 0) {
                    if (type === "error") {
                        this._emitError(a1);
                    }
                    return false;
                }

                var k = index + 1;
                var len = k + this._eventSpace;
                var argc = arguments.length;

                if (this.domain != null && this !== process) {
                    this.domain.enter();
                }

                var eventsWereFired = false;
                if (argc > 3) {
                    var args = new Array(argc - 1);
                    for (var i = 0, len = args.length; i < len; ++i) {
                        args[i] = arguments[i + 1];
                    }
                    eventsWereFired = this._emitApply(k, len, args);
                }
                else if (len - k === 1) {
                    switch (argc) {
                        case 1:
                            eventsWereFired = this._emitSingle0(k);
                            break;
                        case 2:
                            eventsWereFired = this._emitSingle1(k, a1);
                            break;
                        case 3:
                            eventsWereFired = this._emitSingle2(k, a1, a2);
                            break;
                    }
                }
                else {
                    switch (argc) {
                        case 1:
                            eventsWereFired = this._emit0(k, len);
                            break;
                        case 2:
                            eventsWereFired = this._emit1(k, len, a1);
                            break;
                        case 3:
                            eventsWereFired = this._emit2(k, len, a1, a2);
                            break;
                    }
                }

                if (this.domain != null && this !== process) {
                    this.domain.exit();
                }
                return eventsWereFired;
            };

            EventEmitter.prototype.addListener =
                EventEmitter.prototype.on =
                    function EventEmitter$addListener(type, listener, context) {
                        if (typeof listener !== "function")
                            throw new TypeError("listener must be a function");
                        if (typeof type !== "string")
                            type = ( "" + type );

                        this._maybeInit();
                        this._emitNew(type, listener);
                        var index = this._nextFreeIndex(type);
                        var events = this._events;
                        events[index] = listener;
                        events[index].context = context;
                        return this;
                    };

            EventEmitter.prototype.once = function EventEmitter$once(type, listener, context) {
                if (typeof listener !== "function")
                    throw new TypeError("listener must be a function");
                if (typeof type !== "string")
                    type = ( "" + type );

                this._maybeInit();
                this._emitNew(type, listener);
                var index = this._nextFreeIndex(type);
                var events = this._events;
                var self = this;

                function s() {
                    self.removeListener(type, s);
                    return listener.apply(this, arguments);
                }

                events[index] = s;
                s.listener = listener;
                s.context = context;
                return this;
            };

            EventEmitter.prototype.listeners = function EventEmitter$listeners(type) {
                if (typeof type !== "string")
                    type = ( "" + type );

                this._maybeInit();
                var index = this._indexOfEvent(type);
                if (index < 0) {
                    return [];
                }
                var ret = [];
                var k = index + 1;
                var m = k + this._eventSpace;
                var events = this._events;
                for (; k < m; ++k) {
                    if (events[k] === void 0) {
                        break;
                    }
                    ret.push(events[k]);
                }
                return ret;
            };

            EventEmitter.prototype.removeListener =
                function EventEmitter$removeListener(type, listener) {
                    if (typeof listener !== "function")
                        throw new TypeError("listener must be a function");
                    if (typeof type !== "string")
                        type = ( "" + type );

                    this._maybeInit();
                    var index = this._indexOfEvent(type);

                    if (index < 0) {
                        return this;
                    }
                    var events = this._events;
                    var eventSpace = this._eventSpace;
                    var k = index + 1;
                    var j = k;
                    var len = k + eventSpace;
                    var skips = 0;
                    var removeListenerIndex = -2;

                    for (; k < len; ++k) {
                        var item = events[k];
                        if (item === listener ||
                            ( item !== void 0 && item.listener === listener )) {
                            skips++;
                            events[k] = void 0;
                            if (removeListenerIndex === -2) {
                                removeListenerIndex = this._indexOfEvent("removeListener");
                            }
                            if (removeListenerIndex >= 0) {
                                this._emitRemove(type, listener);
                            }
                        }
                        else {
                            events[j++] = item;
                        }
                    }

                    for (k = len - skips; k < len; ++k) {
                        events[k] = void 0;
                    }


                    return this;
                };

            EventEmitter.prototype.removeAllListeners =
                function EventEmitter$removeAllListeners(type) {
                    this._maybeInit();
                    if (type === void 0) {
                        if (this._indexOfEvent("removeListener") >= 0) {
                            this._emitRemoveAll(void 0);
                        }
                        var events = this._events = new Array(this._events.length);
                        this._initSpace(events);
                        return this;
                    }
                    if (typeof type !== "string")
                        type = ( "" + type );

                    var index = this._indexOfEvent(type);
                    if (index < 0) {
                        return this;
                    }
                    var events = this._events;
                    var eventSpace = this._eventSpace;
                    var k = index + 1;
                    var len = k + eventSpace;
                    if (this._indexOfEvent("removeListener") >= 0) {
                        this._emitRemoveAll(type);
                    }
                    for (; k < len; ++k) {
                        events[k] = void 0;
                    }

                    return this;
                };

            EventEmitter.listenerCount = function (emitter, type) {
                if (!( emitter instanceof EventEmitter )) {
                    throw new TypeError("Not an event emitter");
                }

                var total = 0;
                var events = emitter._events;
                if (!isArray(events)) {
                    return 0;
                }
                var len = events.length;
                if (type === void 0) {
                    for (var i = 0; i < len; ++i) {
                        if (typeof events[i] === "function") total++;
                    }
                }
                else {
                    if (typeof type !== "string")
                        type = ( "" + type );
                    var index = this._indexOfEvent(type) + 1;
                    var eventSpace = this._eventSpace;
                    var k = index;
                    var m = index + eventSpace;
                    for (; k < m; ++k) {
                        if (typeof events[k] === "function") total++;
                    }
                }
                return total;
            };

            EventEmitter.prototype._resizeForHandlers =
                function EventEmitter$_resizeForHandlers() {
                    var events = this._events;
                    var tmp = new Array(events.length);
                    for (var i = 0, len = tmp.length; i < len; ++i) {
                        tmp[i] = events[i];
                    }
                    var oldEventSpace = this._eventSpace;
                    var newEventSpace = this._eventSpace = ( oldEventSpace * 2 + 2 );
                    var length = events.length = ( ( newEventSpace + 1 ) *
                        Math.max(this._eventCount, INITIAL_DISTINCT_HANDLER_TYPES) ) | 0;

                    newEventSpace++;
                    oldEventSpace++;
                    for (var i = 0, j = 0;
                         i < length;
                         i += newEventSpace, j += oldEventSpace) {

                        var k = j;
                        var m = k + oldEventSpace;
                        var n = 0;
                        for (; k < m; ++k) {
                            events[i + n] = tmp[k];
                            n++;
                        }

                        k = i + n;
                        m = i + newEventSpace;
                        for (; k < m; ++k) {
                            events[k] = void 0;
                        }
                    }
                };


            EventEmitter.prototype._doCompact = function EventEmitter$_doCompact() {
                var j = 0;
                var eventSpace = this._eventSpace + 1;
                var eventCount = this._eventCount;
                var shouldCompact = false;
                var events = this._events;
                for (var i = 0; i < eventCount; ++i) {
                    if (events[j + 1] === void 0) {
                        shouldCompact = true;
                        break;
                    }
                    j += eventSpace;
                }
                if (!shouldCompact) return false;
                j = 0;
                var len = events.length;
                var skips = 0;
                for (var i = 0; i < len; i += eventSpace) {
                    var listener = events[i + 1];
                    if (listener === void 0) {
                        skips += eventSpace;
                    }
                    else {
                        var k = i;
                        var m = k + eventSpace;
                        for (; k < m; ++k) {
                            events[j++] = events[k];
                        }
                    }
                }
                for (var i = len - skips; i < len; ++i) {
                    events[i] = void 0;
                }
                return true;
            };

            EventEmitter.prototype._resizeForEvents =
                function EventEmitter$_resizeForEvents() {
                    if (this._doCompact()) {
                        return;
                    }
                    var events = this._events;
                    var oldLength = events.length;
                    var newLength = ( ( this._eventSpace + 1 ) *
                    Math.max(this._eventCount * 2, INITIAL_DISTINCT_HANDLER_TYPES) );
                    for (var i = oldLength; i < newLength; ++i) {
                        events.push(void 0);
                    }
                };

            EventEmitter.prototype._emitRemoveAll =
                function EventEmitter$_emitRemoveAll(type) {
                    var events = this._events;
                    if (type === void 0) {
                        var len = events.length;
                        var eventSpace = this._eventSpace + 1;
                        for (var i = 0; i < len; i += eventSpace) {
                            var emitType = events[i];
                            var k = i + 1;
                            var m = k + eventSpace;
                            for (; k < m; ++k) {
                                var listener = events[k];
                                if (listener === void 0) {
                                    break;
                                }
                                this._emitRemove(emitType, listener.listener
                                    ? listener.listener
                                    : listener);
                            }

                        }
                    }
                    else {
                        var k = this._indexOfEvent(type) + 1;
                        var m = k + this._eventSpace + 1;

                        for (; k < m; ++k) {
                            var listener = events[k];
                            if (listener === void 0) {
                                break;
                            }
                            this._emitRemove(type, listener.listener
                                ? listener.listener
                                : listener);
                        }
                    }
                };

            EventEmitter.prototype._emitRemove =
                function EventEmitter$_emitRemove(type, fn) {
                    this.emit("removeListener", type, fn);
                };

            EventEmitter.prototype._emitNew = function EventEmitter$_emitNew(type, fn) {
                var i = this._indexOfEvent("newListener ");
                if (i < 0) return;
                this.emit("newListener", type, fn);
            };

            EventEmitter.prototype._indexOfEvent =
                function EventEmitter$_indexOfEvent(eventName) {
                    var j = 0;
                    var eventSpace = this._eventSpace + 1;
                    var eventCount = this._eventCount;
                    var events = this._events;
                    for (var i = 0; i < eventCount; ++i) {
                        if (events[j] === eventName) {
                            return j;
                        }
                        j += eventSpace;
                    }
                    return -1;
                };

            EventEmitter.prototype._warn =
                function EventEmitter$_warn(eventName, listenerCount) {
                    if (!this.__warnMap) {
                        this.__warnMap = objectCreate(null);
                    }
                    if (!this.__warnMap[eventName]) {
                        this.__warnMap[eventName] = true;
                        console.error("(node) warning: possible EventEmitter memory " +
                            "leak detected. %d listeners added. " +
                            "Use emitter.setMaxListeners() to increase limit.",
                            listenerCount);
                        console.trace();
                    }
                };

            EventEmitter.prototype._checkListenerLeak =
                function EventEmitter$_checkListenerLeak(eventName, listenerCount) {
                    var max = this._maxListeners;
                    if (max < 0) {
                        max = EventEmitter.defaultMaxListeners;
                    }
                    if ((max >>> 0) === max && max > 0) {
                        if (listenerCount > max) {
                            this._warn(eventName, listenerCount);
                        }
                    }
                };

            EventEmitter.prototype._nextFreeIndex =
                function EventEmitter$_nextFreeIndex(eventName) {
                    var eventSpace = this._eventSpace + 1;
                    var events = this._events;
                    var length = events.length;
                    for (var i = 0; i < length; i += eventSpace) {
                        var event = events[i];
                        if (event === eventName) {
                            var k = i + 1;
                            var len = i + eventSpace;
                            for (; k < len; ++k) {
                                if (events[k] === void 0) {
                                    this._checkListenerLeak(eventName, k - i);
                                    return k;
                                }
                            }
                            this._resizeForHandlers();
                            return this._nextFreeIndex(eventName);
                        }
                        //Don't check leaks when there is 1 listener
                        else if (event === void 0) {
                            events[i] = eventName;
                            this._eventCount++;
                            return i + 1;
                        }
                        else if (events[i + 1] === void 0) {
                            events[i] = eventName;
                            return i + 1;
                        }
                    }
                    this._resizeForEvents();
                    return this._nextFreeIndex(eventName);
                };

            EventEmitter.prototype._emitError = function EventEmitter$_emitError(e) {
                if (this.domain != null) {
                    if (!e) {
                        e = new TypeError("Uncaught, unspecified 'error' event.");
                    }
                    e.domainEmitter = this;
                    e.domain = this.domain;
                    e.domainThrown = false;
                    this.domain.emit("error", e);
                }
                else if (e instanceof Error) {
                    throw e;
                }
                else {
                    throw new TypeError("Uncaught, unspecified 'error' event.");
                }
            };

            EventEmitter.prototype._emitApply =
                function EventEmitter$_emitApply(index, length, args) {
                    var eventsWereFired = false;
                    var multipleListeners = ( length - index ) > 1;
                    var events = this._events;
                    var event = events[index];
                    if (!multipleListeners) {
                        if (event !== void 0) {
                            event.apply(event.context, args);
                            return true;
                        }
                        return false;
                    }
                    var next = void 0;
                    for (; index < length; ++index) {
                        event = events[index];
                        if (event === void 0) {
                            break;
                        }
                        eventsWereFired = true;
                        if (multipleListeners && ( ( index + 1 ) < length )) {
                            next = events[index + 1];
                        }
                        event.apply(event.context, args);
                        //The current listener was removed from its own callback
                        if (multipleListeners && ( ( index + 1 ) < length ) &&
                            next !== void 0 && next === events[index]) {
                            index--;
                            length--;
                        }
                    }
                    return eventsWereFired;
                };

            EventEmitter.prototype._emitSingle0 =
                function EventEmitter$_emitSingle0(index) {
                    var event = this._events[index];
                    if (event !== void 0) {
                        event.call(event.context);
                        return true;
                    }
                    return false;
                };

            EventEmitter.prototype._emitSingle1 =
                function EventEmitter$_emitSingle1(index, a1) {
                    var event = this._events[index];
                    if (event !== void 0) {
                        event.call(event.context, a1);
                        return true;
                    }
                    return false;
                };

            EventEmitter.prototype._emitSingle2 =
                function EventEmitter$_emitSingle2(index, a1, a2) {
                    var event = this._events[index];
                    if (event !== void 0) {
                        event.call(event.context, a1, a2);
                        return true;
                    }
                    return false;
                };

            EventEmitter.prototype._emit0 = function EventEmitter$_emit0(index, length) {
                var eventsWereFired = false;
                var next = void 0;
                var events = this._events;
                var event;
                for (; index < length; ++index) {
                    event = events[index];
                    if (event === void 0) {
                        break;
                    }
                    eventsWereFired = true;
                    if (( ( index + 1 ) < length )) {
                        next = events[index + 1];
                    }
                    event.call(event.context);
                    //The current listener was removed from its own callback
                    if (( ( index + 1 ) < length ) &&
                        next !== void 0 && next === events[index]) {
                        index--;
                        length--;
                    }
                    else if (next === void 0) {
                        break;
                    }
                }
                return eventsWereFired;
            };

            EventEmitter.prototype._emit1 =
                function EventEmitter$_emit1(index, length, a1) {
                    var eventsWereFired = false;
                    var next = void 0;
                    var events = this._events;
                    var event;
                    for (; index < length; ++index) {
                        event = events[index];
                        if (event === void 0) {
                            break;
                        }
                        eventsWereFired = true;
                        if (( ( index + 1 ) < length )) {
                            next = events[index + 1];
                        }
                        event.call(event.context, a1);
                        //The current listener was removed from its own callback
                        if (( ( index + 1 ) < length ) &&
                            next !== void 0 && next === events[index]) {
                            index--;
                            length--;
                        }
                        else if (next === void 0) {
                            break;
                        }
                    }
                    return eventsWereFired;
                };

            EventEmitter.prototype._emit2 =
                function EventEmitter$_emit2(index, length, a1, a2) {
                    var eventsWereFired = false;
                    var next = void 0;
                    var events = this._events;
                    var event;
                    for (; index < length; ++index) {
                        event = events[index];
                        if (event === void 0) {
                            break;
                        }
                        eventsWereFired = true;
                        if (( ( index + 1 ) < length )) {
                            next = events[index + 1];
                        }
                        event.call(event.context, a1, a2);
                        //The current listener was removed from its own callback
                        if (( ( index + 1 ) < length ) &&
                            next !== void 0 && next === events[index]) {
                            index--;
                            length--;
                        }
                        else if (next === void 0) {
                            break;
                        }
                    }
                    return eventsWereFired;
                };

            //eventSpace =
            //The reserved space for handlers of a distinct event type

            //eventCount =
            //The amount of unique event types currently registered.
            //Might not be the actual amount


            EventEmitter.prototype._maybeInit = function EventEmitter$_maybeInit() {
                if (!isArray(this._events)) {
                    if (( this._maxListeners >>> 0 ) !== this._maxListeners) {
                        this._maxListeners = -1;
                    }
                    this._eventSpace = 1;
                    this._eventCount = 0;
                    var events = this._events = new Array(( ( this._eventSpace + 1 ) *
                        INITIAL_DISTINCT_HANDLER_TYPES ) | 0);
                    this._initSpace(events);
                }
            };

            EventEmitter.prototype._initSpace = function EventEmitter$_initSpace(events) {
                var len = events.length;
                for (var i = 0; i < len; ++i) {
                    events[i] = void 0;
                }
            };

            module.exports = EventEmitter;
            /* WEBPACK VAR INJECTION */
        }.call(exports, __webpack_require__(7)))

        /***/
    },
    /* 7 */
    /***/ function (module, exports) {

        // shim for using process in browser

        var process = module.exports = {};
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = setTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    currentQueue[queueIndex].run();
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            clearTimeout(timeout);
        }

        process.nextTick = function (fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                setTimeout(drainQueue, 0);
            }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }

        Item.prototype.run = function () {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {
        }

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        // TODO(shtylman)
        process.cwd = function () {
            return '/'
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function () {
            return 0;
        };


        /***/
    },
    /* 8 */
    /***/ function (module, exports, __webpack_require__) {

        /*global define:false require:false */
        module.exports = (function () {
            // Import Events
            var events = __webpack_require__(9)

            // Export Domain
            var domain = {}
            domain.createDomain = domain.create = function () {
                var d = new events.EventEmitter()

                function emitError(e) {
                    d.emit('error', e)
                }

                d.add = function (emitter) {
                    emitter.on('error', emitError)
                }
                d.remove = function (emitter) {
                    emitter.removeListener('error', emitError)
                }
                d.bind = function (fn) {
                    return function () {
                        var args = Array.prototype.slice.call(arguments)
                        try {
                            fn.apply(null, args)
                        }
                        catch (err) {
                            emitError(err)
                        }
                    }
                }
                d.intercept = function (fn) {
                    return function (err) {
                        if (err) {
                            emitError(err)
                        }
                        else {
                            var args = Array.prototype.slice.call(arguments, 1)
                            try {
                                fn.apply(null, args)
                            }
                            catch (err) {
                                emitError(err)
                            }
                        }
                    }
                }
                d.run = function (fn) {
                    try {
                        fn()
                    }
                    catch (err) {
                        emitError(err)
                    }
                    return this
                };
                d.dispose = function () {
                    this.removeAllListeners()
                    return this
                };
                d.enter = d.exit = function () {
                    return this
                }
                return d
            };
            return domain
        }).call(this)

        /***/
    },
    /* 9 */
    /***/ function (module, exports) {

        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        function EventEmitter() {
            this._events = this._events || {};
            this._maxListeners = this._maxListeners || undefined;
        }

        module.exports = EventEmitter;

        // Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

        // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.
        EventEmitter.defaultMaxListeners = 10;

        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function (n) {
            if (!isNumber(n) || n < 0 || isNaN(n))
                throw TypeError('n must be a positive number');
            this._maxListeners = n;
            return this;
        };

        EventEmitter.prototype.emit = function (type) {
            var er, handler, len, args, i, listeners;

            if (!this._events)
                this._events = {};

            // If there is no 'error' event listener then throw.
            if (type === 'error') {
                if (!this._events.error ||
                    (isObject(this._events.error) && !this._events.error.length)) {
                    er = arguments[1];
                    if (er instanceof Error) {
                        throw er; // Unhandled 'error' event
                    }
                    throw TypeError('Uncaught, unspecified "error" event.');
                }
            }

            handler = this._events[type];

            if (isUndefined(handler))
                return false;

            if (isFunction(handler)) {
                switch (arguments.length) {
                    // fast cases
                    case 1:
                        handler.call(this);
                        break;
                    case 2:
                        handler.call(this, arguments[1]);
                        break;
                    case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;
                    // slower
                    default:
                        len = arguments.length;
                        args = new Array(len - 1);
                        for (i = 1; i < len; i++)
                            args[i - 1] = arguments[i];
                        handler.apply(this, args);
                }
            } else if (isObject(handler)) {
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++)
                    args[i - 1] = arguments[i];

                listeners = handler.slice();
                len = listeners.length;
                for (i = 0; i < len; i++)
                    listeners[i].apply(this, args);
            }

            return true;
        };

        EventEmitter.prototype.addListener = function (type, listener) {
            var m;

            if (!isFunction(listener))
                throw TypeError('listener must be a function');

            if (!this._events)
                this._events = {};

            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (this._events.newListener)
                this.emit('newListener', type,
                    isFunction(listener.listener) ?
                        listener.listener : listener);

            if (!this._events[type])
            // Optimize the case of one listener. Don't need the extra array object.
                this._events[type] = listener;
            else if (isObject(this._events[type]))
            // If we've already got an array, just append.
                this._events[type].push(listener);
            else
            // Adding the second element, need to change to array.
                this._events[type] = [this._events[type], listener];

            // Check for listener leak
            if (isObject(this._events[type]) && !this._events[type].warned) {
                var m;
                if (!isUndefined(this._maxListeners)) {
                    m = this._maxListeners;
                } else {
                    m = EventEmitter.defaultMaxListeners;
                }

                if (m && m > 0 && this._events[type].length > m) {
                    this._events[type].warned = true;
                    console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
                    if (typeof console.trace === 'function') {
                        // not supported in IE 10
                        console.trace();
                    }
                }
            }

            return this;
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.once = function (type, listener) {
            if (!isFunction(listener))
                throw TypeError('listener must be a function');

            var fired = false;

            function g() {
                this.removeListener(type, g);

                if (!fired) {
                    fired = true;
                    listener.apply(this, arguments);
                }
            }

            g.listener = listener;
            this.on(type, g);

            return this;
        };

        // emits a 'removeListener' event iff the listener was removed
        EventEmitter.prototype.removeListener = function (type, listener) {
            var list, position, length, i;

            if (!isFunction(listener))
                throw TypeError('listener must be a function');

            if (!this._events || !this._events[type])
                return this;

            list = this._events[type];
            length = list.length;
            position = -1;

            if (list === listener ||
                (isFunction(list.listener) && list.listener === listener)) {
                delete this._events[type];
                if (this._events.removeListener)
                    this.emit('removeListener', type, listener);

            } else if (isObject(list)) {
                for (i = length; i-- > 0;) {
                    if (list[i] === listener ||
                        (list[i].listener && list[i].listener === listener)) {
                        position = i;
                        break;
                    }
                }

                if (position < 0)
                    return this;

                if (list.length === 1) {
                    list.length = 0;
                    delete this._events[type];
                } else {
                    list.splice(position, 1);
                }

                if (this._events.removeListener)
                    this.emit('removeListener', type, listener);
            }

            return this;
        };

        EventEmitter.prototype.removeAllListeners = function (type) {
            var key, listeners;

            if (!this._events)
                return this;

            // not listening for removeListener, no need to emit
            if (!this._events.removeListener) {
                if (arguments.length === 0)
                    this._events = {};
                else if (this._events[type])
                    delete this._events[type];
                return this;
            }

            // emit removeListener for all listeners on all events
            if (arguments.length === 0) {
                for (key in this._events) {
                    if (key === 'removeListener') continue;
                    this.removeAllListeners(key);
                }
                this.removeAllListeners('removeListener');
                this._events = {};
                return this;
            }

            listeners = this._events[type];

            if (isFunction(listeners)) {
                this.removeListener(type, listeners);
            } else {
                // LIFO order
                while (listeners.length)
                    this.removeListener(type, listeners[listeners.length - 1]);
            }
            delete this._events[type];

            return this;
        };

        EventEmitter.prototype.listeners = function (type) {
            var ret;
            if (!this._events || !this._events[type])
                ret = [];
            else if (isFunction(this._events[type]))
                ret = [this._events[type]];
            else
                ret = this._events[type].slice();
            return ret;
        };

        EventEmitter.listenerCount = function (emitter, type) {
            var ret;
            if (!emitter._events || !emitter._events[type])
                ret = 0;
            else if (isFunction(emitter._events[type]))
                ret = 1;
            else
                ret = emitter._events[type].length;
            return ret;
        };

        function isFunction(arg) {
            return typeof arg === 'function';
        }

        function isNumber(arg) {
            return typeof arg === 'number';
        }

        function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
        }

        function isUndefined(arg) {
            return arg === void 0;
        }


        /***/
    },
    /* 10 */
    /***/ function (module, exports) {

        module.exports = Promise;

        /***/
    },
    /* 11 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _EmitterJs = __webpack_require__(5);

        var _EmitterJs2 = _interopRequireDefault(_EmitterJs);

        'use strict';

        var GlobalEmitter = (0, _EmitterJs2['default'])();
        GlobalEmitter.name = 'global';

        var BaseComponent = function BaseComponent() {
        };

        BaseComponent.prototype = {

            _emitter: void 0,

            _util: {
                emitter: _EmitterJs2['default']
            },

            _globalEmitter: GlobalEmitter,

            emit: {},

            _slots: function _slots(channels) {
                var _this = this;

                for (var channel in channels) {
                    if (channels.hasOwnProperty(channel)) {

                        var slots = channels[channel];

                        if (typeof slots === 'function') {
                            slots = slots.call({});
                        }

                        if (Object.prototype.toString.call(slots) !== '[object Object]') {
                            throw new Error("Slots must be (or return from func) hash object");
                        }

                        var emitter = channel === 'global' ? this._globalEmitter : this._emitter;

                        for (var slot in slots) {
                            if (slots.hasOwnProperty(slot)) {
                                (function () {
                                    var _arr = slot.split('@');
                                    if (_arr.length > 2) {
                                        throw new Error("Incorrect name of slot");
                                    }
                                    var method = _arr[0];
                                    var event = _arr[1];

                                    var promise = undefined;

                                    switch (method) {
                                        case 'on':
                                            promise = emitter.on(event, _this);
                                            break;
                                        case 'once':
                                            promise = emitter.once(event, _this);
                                            break;
                                        case 'command':
                                            promise = emitter.commandFrom(event, _this);
                                            break;
                                    }

                                    slots[slot]._queue.forEach(function (cb) {
                                        promise = promise.then(cb.onFulfill, cb.onReject);
                                    });
                                })();
                            }
                        }
                    }
                }
            },

            _signals: function _signals(channels) {
                var _this2 = this;

                for (var channel in channels) {
                    if (channels.hasOwnProperty(channel)) {
                        (function () {

                            var signals = channels[channel];

                            if (typeof signals === 'function') {
                                signals = signals.call({});
                            }

                            if (Object.prototype.toString.call(signals) !== '[object Object]') {
                                throw new Error("Signals must be (or return from func) hash object");
                            }

                            var emitter = channel === 'global' ? _this2._globalEmitter : _this2._emitter;

                            for (var signal in signals) {
                                if (signals.hasOwnProperty(signal)) {
                                    (function () {
                                        var _arr = signal.split('@');
                                        if (_arr.length > 2) {
                                            throw new Error("Incorrect name of signal");
                                        }

                                        var method = _arr[0];
                                        var event = _arr[1];

                                        _this2.emit[signals[signal]] = function (data) {
                                            switch (method) {
                                                case 'trigger':
                                                    emitter.trigger(event, data);
                                                    break;
                                                case 'command':
                                                    return emitter.commandTo(event, data);
                                                    break;
                                            }
                                        };
                                    })();
                                }
                            }
                        })();
                    }
                }
            },

            addSignal: function addSignal(channel, signal, methodname) {
                var emitter = channel === 'global' ? GlobalEmitter : this._emitter;

                var _arr = signal.split('@');
                if (_arr.length > 2) {
                    throw new Error("Incorrect name of signal");
                }

                var method = _arr[0];
                var event = _arr[1];

                this.emit[methodname] = function (data) {
                    switch (method) {
                        case 'trigger':
                            emitter.trigger(event, data);
                            break;
                        case 'command':
                            emitter.commandTo(event, data);
                            break;
                    }
                };
            },

            init: function init() {
                this._emitter = this._util.emitter();
                this._emitter.name = this.inheritChain[this.inheritChain.length - 1] + '-local';

                this._slots(this.slots);
                this._signals(this.signals);
            }

        };

        BaseComponent.rootClass();

        exports['default'] = BaseComponent;
        module.exports = exports['default'];

        /***/
    },
    /* 12 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _baseView = __webpack_require__(2);

        var _baseView2 = _interopRequireDefault(_baseView);

        function BaseItemView() {
        }

        BaseItemView.prototype = {

            template: void 0,

            render: function render(model) {
                if (!this.rootNode) {
                    throw new Error('RootNode not specified');
                }

                var new_vdom = this.renderTpl(this.template, model);

                this['super'].render.call(this, new_vdom);
            },

            init: function init() {
                if (!this.template) {
                    throw new Error('Template not specified');
                }

                this['super'].init.call(this);
            }

        };

        BaseItemView['extends'](_baseView2['default']);

        exports['default'] = BaseItemView;
        module.exports = exports['default'];

        /***/
    },
    /* 13 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _EmitterJs = __webpack_require__(5);

        var _EmitterJs2 = _interopRequireDefault(_EmitterJs);

        var BaseModel = function BaseModel() {
        };

        BaseModel.prototype = {

            _emitter: void 0,

            _util: {
                emitter: _EmitterJs2['default']
            },

            _properties: void 0,

            defProperty: function defProperty(prop, value) {
                var self = this;

                if (typeof value !== 'undefined') {
                    this._properties[prop] = value;
                }

                Object.defineProperty(this, prop, {
                    get: function get() {
                        return self._properties[prop];
                    },
                    set: function set(val) {
                        self._properties[prop] = val;
                        this._change();
                    },
                    enumerable: true,
                    configurable: true
                });
            },

            on: function on(event, context) {
                return this._emitter.on(event, context);
            },

            trigger: function trigger(event, data) {
                return this._emitter.trigger(event, data);
            },

            _change: function _change() {
                this.trigger('change', this.getModel());
            },

            getModel: function getModel() {
                return this._properties;
            },

            init: function init() {
                this._emitter = this._util.emitter();
                this._emitter.name = this.inheritChain[this.inheritChain.length - 1];

                this._properties = {};
            }
        };

        BaseModel.rootClass();

        exports['default'] = BaseModel;
        module.exports = exports['default'];

        /***/
    },
    /* 14 */
    /***/ function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, '__esModule', {
            value: true
        });

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {'default': obj};
        }

        var _baseView = __webpack_require__(2);

        var _baseView2 = _interopRequireDefault(_baseView);

        function BaseTreeView() {
        }

        BaseTreeView.prototype = {

            rootTemplate: void 0,

            nodeTemplate: void 0,

            listTemplate: void 0,

            render: function render(tree) {
                if (!this.rootNode) {
                    throw new Error('RootNode not specified');
                }

                var new_vdom = this.traverse(tree);

                this['super'].render.call(this, new_vdom);
                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
            },

            init: function init() {
                if (!this.nodeTemplate && !this.listTemplate) {
                    throw new Error('Templates not specified');
                }
                if (!this.rootTemplate) {
                    throw new Error('Root template not specified');
                }

                this['super'].init.call(this);
            },

            traverse: function traverse(tree) {
                var curAC = this.activeSuperContext;
                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                var res = this.traverse(tree);
                this.activeSuperContext = curAC;
                return res;
            }

        };

        BaseTreeView['extends'](_baseView2['default']);

        exports['default'] = BaseTreeView;
        module.exports = exports['default'];

        /***/
    }
    /******/]);