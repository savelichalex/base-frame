import Emitter from './../core/Emitter.js';

var BaseModel = function() {
    this._emitter = Emitter();
    this._emitter.name = "model";
};

BaseModel.prototype = {
    _properties: {},

    defProperty: function(prop) {
        var self = this;

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
    }
};

export default BaseModel;