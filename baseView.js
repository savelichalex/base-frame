var vdom = require( 'virtual-dom' );
var diff = vdom.diff;
var patch = vdom.patch;
var createElement = vdom.create;
var h = vdom.h;

var addEvent = require( './util' ).addEvent;

//from base-components
var Emitter = require( 'base-components' ).Emitter;
var defer = require( 'base-components' ).defer;

// hack for use AttributeHook from
// https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/hooks/attribute-hook.js used for svg
// support
var SVGAttributeHook = require( './svgAttributeHook' );

//savelichalex: for use views on server by node.js and for tests must check environment
//i think that must use views on server just returning html if this is need
var isBrowser = typeof window !== 'undefined';

/**
 * Base class for views
 * Offers methods for create events, render model with virtual-dom and
 * methods to work with own emitter to create events. That's help to tell
 * to another object that something happened
 * @constructor
 */
function BaseView(options) {
    options = options || {};
    this._listeners = {};

    if(this.events && !options.preventEvents) {
        this._createEvents( this.events );
    }

    this._emitter = this._util.emitter();
    if ( this.inheritChain ) {
        this._emitter.name = this.inheritChain[ this.inheritChain.length - 1 ];
    }

    this._vdom = void 0;
    this._vdomNode = void 0;

}

BaseView.prototype = {
    constructor: BaseView,

    /**
     * Contain functions to prevent create closure for this
     * @private
     */
    _util: {
        emitter: Emitter,
        defer: defer,
        addEvent: addEvent,
        h: h,
        svgAttributeHook: SVGAttributeHook
    },

    /**
     * Used for evaluate hypertext returned form template
     * @param ht {String} Hypertext (virtual-dom/h) that created in
     * overrided render method in child class
     * @returns {Object} VNode
     * @protected
     */
    renderTpl: function (ht) {
        var h = this._util.h;
        var SVGAttributeHook = this._util.svgAttributeHook;
        return eval(ht);
    },

    /**
     * Main view function, that must be override by child classes
     * @param new_vdom VNode from child overrided render method
     * @returns {VNode} if this is not browser environment
     * @public
     */
    render: function(new_vdom) {
        if(this._vdom) {
            var patches = diff( this._vdom, new_vdom );
            this._vdomNode = patch( this._vdomNode, patches );
        } else {
            this._vdomNode = createElement( new_vdom );
        }
        this._vdom = new_vdom;

        this._initRootNode();

        if ( isBrowser ) {
            this.rootNode.appendChild( this._vdomNode );

            this.trigger( 'renderComplete' );
        } else {
            this.trigger( 'renderComplete', this._vdom );
            return this._vdom;
        }
    },

    /**
     * Initialise root node if this not done yet
     * @throws {Error} if root node not specified in child class
     * @private
     */
    _initRootNode: function() {
        if(!this.rootNode) {
            throw new Error('RootNode not specified in ' + this.inheritChain[this.inheritChain.length - 1]);
        }
        if( Object.prototype.toString.call( this.rootNode ) === "[object Function]" ) {
            this.rootNode = this.rootNode();
        }
        if( Object.prototype.toString.call( this.rootNode ) === "[object String]" ) {
            if ( isBrowser ) {
                if(!this.resetRootNode) {
                    this.rootNode = document.querySelector(this.rootNode);
                } else {
                    //reset event listeners by clone rootNode
                    var rootNode = document.querySelector(this.rootNode);
                    var newRootNode = rootNode.cloneNode(true);
                    rootNode.parentNode.replaceChild(newRootNode, rootNode);
                    this.rootNode = newRootNode;
                }
            }
            if ( !this.rootNode ) {
                console.warn( this.rootNode + ' not found on document' );
            }
        }
    },

    /**
     * Create event handlers which specified in child class.
     * Main part of events creation is that only root view node
     * have event listeners for all specified events.
     * It is based on fact that event can bubble to parent node.
     * With this in mind, you can decrease event listeners in your code,
     * hence saving memory and help compiler to optimise hot function
     * @param events {Object}
     * @throws {Error} if events object is not a hash object
     * @throws {Error} if not valid event declaration
     * @private
     * TODO: right event handling for not bubble events
     */
    _createEvents: function(events) {
        if( Object.prototype.toString.call( events ) === "[object Function]" ) {
            return this._createEvents( this.events() );
        }
        if ( Object.prototype.toString.call( events ) !== "[object Object]" ) {
            throw new Error('Events must be a hash object');
        }

        for( var event in events ) {
            if(events.hasOwnProperty(event)) {
                var event_arr = event.split( ' ' );
                var type = event_arr[ 0 ];
                var target = event_arr[ 1 ];

                if ( !target ) {
                    throw new Error( 'Event must be with target node' );
                }

                var prevent = false;
                if (event_arr.length > 2 && event_arr[2] === 'preventDefault') {
                    prevent = true;
                }

                if (!this._listeners[type]) {
                    this._listeners[type] = {};

                    this._initRootNode();

                    if ( isBrowser ) {
                        this._util.addEvent( this.rootNode, type, this._searchListener( this, this.rootNode ) );
                    }
                }

                var listener = events[ event ];

                if ( Object.prototype.toString.call( listener ) !== "[object Object]" && !listener._queue ) {
                    if ( Object.prototype.toString.call( listener ) === "[object Function]" ) {
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

    /**
     * Create function that used as callback to event listener
     * @param context
     * @param rootNode
     * @returns {Function}
     * @private
     */
    _searchListener: function(context, rootNode) {
        return function(event) {
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
                    var listener = context._listeners[ eventType ][ target ];
                    if (listener) {
                        if (listener.prevent) {
                            event.preventDefault();
                        }
                        var _resolve;
                        var promise = new context._emitter.Promise( function ( resolve ) {
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
                    if (target.className && (typeof target.className === 'string')) {
                        var classes = target.className.split(' ');
                        classes.forEach(function (className) {
                            if (searchInListeners('.' + className, context)) { //TODO: multyple classes
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

    /**
     * Short method to use emitter
     * @param event
     * @param context
     * @returns {*}
     */
    on: function(event, context) {
        return this._emitter.on(event, context);
    },

    /**
     * Short method to use emitter
     * @param event
     * @param context
     * @returns {*}
     */
    once: function(event, context) {
        return this._emitter.once(event, context);
    },

    /**
     * Short method to use emitter
     * @param event
     * @param data
     * @returns {*}
     */
    trigger: function(event, data) {
        return this._emitter.trigger(event, data);
    }
};

module.exports = BaseView;