import FastEmitter from 'fastemitter-with-context';
import _ from 'underscore';
import Promise from 'bluebird';

"use strict";

var Emitter = function() {
    var emitter, emitterProxy;

    emitter = new FastEmitter();

    emitterProxy = {

        on: function (event, context) {
            var promise,
                queue = [];
            emitter.on(event, function (data) {
                promise = new Promise(function (resolve) {
                    resolve(data);
                });
                let self = this;
                queue.forEach(function (obj) {
                    promise = promise.bind(self).then(obj.onResolve, obj.onReject);
                })
            }, context);
            return {
                then: function (onResolve, onReject) {
                    queue.push({
                        onResolve: onResolve,
                        onReject: onReject
                    });
                }
            }
        },

        off: function (event) {
            emitter.off(event);
        },

        trigger: function (event, data) {
            console.log(event, this.name);
            emitter.trigger(event, data);
        },

        once: function (event, context) {
            return new Promise(function (resolve) {
                emitter.once(event, function (data) {
                    resolve(data);
                }, context);
            });
        },

        _commandTo: function (event, data) {
            this.trigger(event + ':up', data);
            return this.once(event + ':down');
        },

        _commandFrom: function (event, context) {
            let promise = this.on(event + ':up', context);
            return {
                then: function (onResolve, onReject) {
                    promise = promise.then(onResolve, onReject);
                    return this;
                },
                end: function () {
                    promise.then(function (data) {
                        emitterProxy.trigger(event + ':down', data);
                    });
                }
            };
        },

        _commands: {},

        commandTo: function (event, data) {
            if (!this._commands[event]) {
                this._commands[event] = {
                    id: 0
                };
            }
            var id = this._commands[event].id;
            this.trigger(event + ':uniqueBefore', this._commands[event].id++);
            var self = this,
                queue = [];
            emitterProxy
                .once(event + ':uniqueAfter')
                .then(function () {
                    let promise = self._commandTo(event + ':' + id++, data);
                    queue.forEach(function (obj) {
                        promise = promise.then(obj.onResolve, obj.onReject);
                    });
                });
            return {
                then: function (onResolve, onReject) {
                    queue.push({
                        onResolve: onResolve,
                        onReject: onReject
                    });
                }
            }
        },

        commandFrom: function (event) {
            var queue = [];
            this.on(event + ':uniqueBefore')
                .then(function (id) {
                    let promise = emitterProxy.once(event + ':' + id + ':up');
                    emitterProxy.trigger(event + ':uniqueAfter');
                    queue.forEach(function (obj) {
                        promise = promise.then(obj.onResolve, obj.onReject);
                    });
                    promise.then(function (data) {
                        emitterProxy.trigger(event + ':' + id + ':down', data);
                    });
                });
            return {
                then: function (onResolve, onReject) {
                    queue.push({
                        onResolve: onResolve,
                        onReject: onReject
                    });
                    return this;
                }
            };
        },

        Promise: Promise,
    };

    return emitterProxy;
};

export default Emitter;