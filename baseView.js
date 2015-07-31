import _ from 'underscore';
import $ from 'jquery';
import Promise from 'bluebird';

import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

import { defer } from './util';
import Emitter from './Emitter.js';

export function BaseView() {
    this._emitter = Emitter();
    this._emitter.name = "view";
}

BaseView.prototype = {

    rootNode: void 0,

    _vdom: void 0,

    _vdomNode: void 0,

    _render: function(new_vdom) {
        if(this._vdom) {
            var patches = diff(this._vdom, new_vdom);
            this._vdomNode = patch(this._vdomNode, patches);
        } else {
            this._vdomNode = createElement(new_vdom);
        }
        this._vdom = new_vdom;

        this._initRootNode();

        this.rootNode.appendChild(this._vdomNode);
    },

    _initRootNode: function() {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }
        if(_.isString(this.rootNode)) {
            this.rootNode = $(this.rootNode)[0];
        }
    },

    _listeners: {},

    _createEvents: function(events) {
        if(!(_.isObject(events))) {
            throw new Error('Events must be a hash object');
        }

        for(let event in events) {
            if(events.hasOwnProperty(event)) {
                let type = event.split(' ')[0].toLowerCase();
                let target = event.split(' ')[1];

                if (!this._listeners[type]) {
                    this._listeners[type] = {};

                    this._initRootNode();

                    $(this.rootNode).on(type, this._searchListener(this, this.rootNode));
                }

                let listener = events[event];

                if (!(_.isObject(listener) && listener._queue)) {
                    if (_.isFunction(listener)) {
                        listener = defer(listener);
                    } else {
                        throw new Error('Callback must be a function');
                    }
                }

                this._listeners[type][target] = listener;
            }
        }
    },

    _searchListener: function(context, rootNode) {
        return function(event) {
            event = event.originalEvent; //because use jQuery, temp
            let target = event.target;

            function searchByTarget(target, context) {
                target = {
                    tag: target.nodeName.toLowerCase(),
                    className: target.className,
                    id: target.id
                };
                let eventType = event.type;

                function searchInListeners(target, context) {
                    let listener = context._listeners[eventType][target];
                    if (listener) {
                        let _resolve;
                        let promise = new Promise(function (resolve) {
                            _resolve = resolve;
                        });
                        listener._queue.forEach(function (o) {
                            promise = promise.bind(context).then(o.onFulfill, o.onReject);
                        });
                        _resolve(event);

                        return true;
                    } else {
                        return false;
                    }
                }

                if (!(searchInListeners(target.tag, context))) {
                    if (!(searchInListeners(target.className, context))) {
                        if (!(searchInListeners(target.id, context))) {
                            event.preventDefault();
                            return false;
                        }
                    }
                }
            }

            while(target) {
                if (!searchByTarget(target, context)) {
                    target = target.parentNode;
                    if(target === rootNode) {
                        target = false;
                    }
                }
            }
        }
    },

    _init: function() {
        if(this.events) {
            this._createEvents(this.events);
        }
    },

    on: function(event, context) {
        return this._emitter.on(event, context);
    },

    trigger: function(event, data) {
        return this._emitter.trigger(event, data);
    },
};