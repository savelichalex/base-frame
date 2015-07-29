import Emitter from './Emitter.js';

'use strict';

var GlobalEmitter = Emitter();
GlobalEmitter.name = 'global';

var BaseComponent = function() {
    this._emitter = Emitter();
    this._emitter.name = 'local';
};

BaseComponent.prototype = {

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

                let emitter = channel === 'global' ? GlobalEmitter : this._emitter;

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

                let emitter = channel === 'global' ? GlobalEmitter : this._emitter;

                for (let signal in signals) {
                    if (signals.hasOwnProperty(signal)) {
                        let _arr = signal.split('@');
                        if (_arr.length > 2) {
                            throw new Error("Incorrect name of signal");
                        }

                        let method = _arr[0];
                        let event = _arr[1];

                        this.emit[signals[signal]] = function (data) {
                            switch (method) {
                                case 'trigger':
                                    emitter.trigger(event, data);
                                    break;
                                case 'command':
                                    return emitter.commandTo(event, data);
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
        this._slots(this.slots);
        this._signals(this.signals);
    }

};

export default BaseComponent;