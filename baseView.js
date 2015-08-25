import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

//import { defer } from './util';
import Emitter from './Emitter.js';

export function BaseView() {
}

BaseView.prototype = {

    _emitter: (function() {
        let emitter = Emitter();
        emitter.name = 'view';
        return emitter;
    }()),

    rootNode: void 0,

    _vdom: void 0,

    _vdomNode: void 0,

    __vdom: {
        diff: diff,
        patch: patch,
        createElement: createElement
    },

    render: function(new_vdom) {
        if(this._vdom) {
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

    _initRootNode: function() {
        if(!this.rootNode) {
            throw new Error('RootNode not specified in ' + this.inheritChain[this.inheritChain.length - 1]);
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
                let event_arr = event.split(' ');
                let type = event_arr[0];
                let target = event_arr[1];
                let prevent = false;
                if(event_arr.length > 2 && event_arr[2] === 'preventDefault') {
                    prevent = true;
                }

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
                this._listeners[type][target].prevent = prevent;
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
                        if(listener.prevent) {
                            event.preventDefault();
                        }
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

                var hasListener = false;
                if (!(searchInListeners(target.tag, context))) {  //TODO: not search when target does not have class or id
                    if(target.className && (typeof target.className === 'string')) {
                        var classes = target.className.split(' ');
                        classes.forEach(function(className) {
                            if (searchInListeners('.' + className, context)) { //TODO: multyple classes
                                hasListener = true;
                            }
                        });
                    }

                    if(target.id && !hasListener) {
                        if (searchInListeners('#' + target.id, context)) {
                            hasListener = true;
                        }
                    }
                } else {
                    hasListener = true;
                }

                return hasListener;
            }

            while(target) {
                if (!searchByTarget(target, context)) { //TODO: for example mouseout target is not rootNode or his children (not search)
                    if(target === rootNode) {
                        break;
                    } else {
                        target = target.parentNode;
                    }
                } else {
                    break;
                }
            }
            event.stopPropagation();
        }
    },

    init: function() {
        if(this.events) {
            this._createEvents(this.events);
        }
    },

    on: function(event, context) {
        return this._emitter.on(event, context);
    },

    once: function(event, context) {
        return this._emitter.once(event, context);
    },

    trigger: function(event, data) {
        return this._emitter.trigger(event, data);
    },
};

BaseView.rootClass();