import Emitter from './Emitter.js';

var BaseModel = function() {
};

BaseModel.prototype = {

    _emitter: void 0,

    _util: {
        emitter: Emitter
    },

    _properties: void 0,

    defProperty: function(prop, value) {
        var self = this;

        if(typeof value !== 'undefined') {
            this._properties[prop] = value;
        }

        Object.defineProperty(this, prop, {
            get: function() { return self._properties[prop]; },
            set: function(val) {
                self._properties[prop] = val;
                this._change();
            },
            enumerable: true,
            configurable: true
        });
    },

    on: function(event, context) {
        return this._emitter.on(event, context);
    },

    trigger: function(event, data) {
        return this._emitter.trigger(event, data);
    },

    _change: function() {
        this.trigger('change', this.getModel());
    },

    getModel: function() {
        return this._properties;
    },

    init: function() {
        this._emitter = this._util.emitter();
        this._emitter.name = this.inheritChain[ this.inheritChain.length - 1 ];

        this._properties = {};
    }
};

BaseModel.rootClass();

export default BaseModel;