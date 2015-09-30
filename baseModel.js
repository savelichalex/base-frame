import { Emitter } from 'base-components';

/**
 * Base class for work with models
 * Help you to create models with attributes that can fire
 * change event every time when update
 * @constructor
 */
function BaseModel () {
    this._emitter = this._util.emitter();
    if ( this.inheritChain ) {
        this._emitter.name = this.inheritChain[ this.inheritChain.length - 1 ];
    }

    this._properties = {};
}

BaseModel.prototype = {

    _util: {
        emitter: Emitter
    },

    /**
     * Create model attribute which can fire change event every time when update
     * @param prop
     * @param value
     */
    defProperty: function (prop, value) {
        var self = this;

        if (typeof value !== 'undefined') {
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
     * @param data
     * @returns {*}
     */
    trigger: function(event, data) {
        return this._emitter.trigger(event, data);
    },

    /**
     * Short method to fire change event
     * @private
     */
    _change: function() {
        this.trigger('change', this.getModel());
    },

    /**
     * Return current model
     * @returns {BaseModel._properties}
     */
    getModel: function() {
        return this._properties;
    }
};

export default BaseModel;