import _ from 'underscore';
import $ from 'jquery';
import Promise from 'bluebird';

import { defer } from './util';

import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import createElement from 'virtual-dom/create-element';

import convertHTML from 'html-to-vdom';

var convert = convertHTML({
    VNode: VNode,
    VText: VText
});

export function BaseItemView() {

}

BaseItemView.prototype = {

    template: void 0,

    rootNode: void 0,

    _vdom: void 0,

    _vdomNode: void 0,

    render(model) {
        if(!this.template || !this.rootNode) {
            throw new Error('Template and rootNode not specified');
        }
        let new_vdom = convert(this._templateCachedFn(model));

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

                    $(this.rootNode).on(type, this.searchListener(this));
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

    searchListener: function(context) {
        return function(event) {
            event = event.originalEvent; //because use jQuery, temp
            let target = event.target;
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
                    let promise = new Promise(function(resolve) {
                        _resolve = resolve;
                    });
                    listener._queue.forEach(function(o) {
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
    },

    init: function() {
        this._templateCachedFn = _.template(this.template);
        this._createEvents(this.events);
    }
};

export function BaseCollectionView() {

}