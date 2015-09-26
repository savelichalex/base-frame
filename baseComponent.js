import Emitter from './Emitter.js';

import { defer } from './util';

'use strict';

var GlobalEmitter = Emitter();
GlobalEmitter.name = 'global';

var BaseComponent = function() {
};

BaseComponent.prototype = {

    _emitter: void 0,

    _util: {
        emitter: Emitter
    },

    _globalEmitter: GlobalEmitter,

    emit: {},

    _slots: function(channels) {
        for(let channel in channels) {
            if(channels.hasOwnProperty(channel)) {

                let slots = channels[channel];

                if (typeof slots === 'function') {
                    slots = slots.call({});
                }

                if (Object.prototype.toString.call(slots) !== '[object Object]') {
                    throw new Error("Slots must be (or return from func) hash object");
                }

                let emitter = channel === 'global' ? this._globalEmitter : this._emitter;

                for (let slot in slots) {
                    if (slots.hasOwnProperty(slot)) {
                        let _arr = slot.split('@');
                        if (_arr.length > 2) {
                            throw new Error("Incorrect name of slot");
                        }
                        let method = _arr[0];
                        let event = _arr[1];

                        let promise;

                        switch (method) {
                            case 'on':
                                promise = emitter.on(event, this);
                                break;
                            case 'once':
                                promise = emitter.once(event, this);
                                break;
                            case 'command':
                                promise = emitter.commandFrom(event, this);
                                break;
                        }

                        if (Object.prototype.toString.call(slots[slot]) === '[object Function]') {
                            slots[slot] = defer(slots[slot]);
                        }

                        slots[slot]._queue.forEach(function (cb) {
                            promise = promise.then(cb.onFulfill, cb.onReject);
                        });
                    }
                }
            }
        }
    },

    _signals: function(channels) {
        for(let channel in channels) {
            if(channels.hasOwnProperty(channel)) {

                let signals = channels[channel];

                if (typeof signals === 'function') {
                    signals = signals.call({});
                }

                if (Object.prototype.toString.call(signals) !== '[object Object]') {
                    throw new Error("Signals must be (or return from func) hash object");
                }

                let emitter = channel === 'global' ? this._globalEmitter : this._emitter;

                for (let signal in signals) {
                    if (signals.hasOwnProperty(signal)) {
                        let _arr = signal.split('@');
                        if (_arr.length > 2) {
                            throw new Error("Incorrect name of signal");
                        }

                        let method = _arr[0];
                        let event = _arr[1];

                        this.emit[signals[signal]] = function (data, obj) {
                            let _event;
                            if (obj) {
                                _event = event.replace(/\{([^\}]+)\}/g, function (i, f) {
                                    return obj[f];
                                });
                            } else {
                                _event = event;
                            }
                            switch (method) {
                                case 'trigger':
                                    emitter.trigger(_event, data);
                                    break;
                                case 'command':
                                    return emitter.commandTo(_event, data);
                                    break;
                            }
                        };
                    }
                }
            }
        }
    },

    addSignal: function(channel, signal, methodname) {
        let emitter = channel === 'global' ? GlobalEmitter : this._emitter;

        let _arr = signal.split('@');
        if(_arr.length > 2) {
            throw new Error("Incorrect name of signal");
        }

        let method = _arr[0];
        let event = _arr[1];

        this.emit[methodname] = function(data) {
            switch(method) {
                case 'trigger': emitter.trigger(event, data); break;
                case 'command': emitter.commandTo(event, data); break;
            }
        };
    },

    init: function() {
        this._emitter = this._util.emitter();
        this._emitter.name = this.inheritChain[this.inheritChain.length - 1] + '-local';


        this._slots(this.slots);
        this._signals(this.signals);
    }

};

export default BaseComponent;