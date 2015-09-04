import _ from 'underscore';
import $ from 'jquery';
import Promise from 'bluebird';

//Global functions
window._ = _;
window.$ = $;
window.Promise = Promise;

window.defer = defer;

window.addEvent = addEvent;

function addEvent(elem, event, fn) {
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
    } else {
        elem.attachEvent("on" + event, function() {
            // set the this pointer same as addEventListener when fn is called
            return(fn.call(elem, window.event));
        });
    }
}

var clone = function(first, second) {
    if(Object.prototype.toString.call(second) !== "[object Object]" ||
        Object.prototype.toString.call(first) !== "[object Object]") {
        throw new Error("variables must be type of object");
    }

    for(var i in first) {
        if(first.hasOwnProperty(i)) {
            second[i] = first[i];
        }
    }
};

var intersect = function(x, y) {
    var ret = [],
        x_len = x.length,
        y_len = y.length;

    for(var i = 0; i < x_len; i++) {
        for(var z = 0; z < y_len; z++) {
            if(x[i] === y[z]) {
                ret.push(x[i]);
                break;
            }
        }
    }

    return ret;
};

if(typeof Function.prototype.extends !== 'function')
    Function.prototype.extends = function(Parent) {
        var thisClassName = this.name,
            parentClassName = Parent.name,
            thisProtoKeys = Object.keys(this.prototype),
            parentProtoKeys = Object.keys(Parent.prototype);

        if(!thisClassName && !parentClassName) { //if function.name not working
            var functionNameRegExp = /^function\s*([^\s(]+)/;
            thisClassName = functionNameRegExp.exec(this.toString())[1];
            parentClassName = functionNameRegExp.exec(Parent.toString())[1];
        }

        var hasInThisPrototype = (function(thisProto, parentProto) {
            var intersection = intersect(parentProto, thisProto),
                inter_len = intersection.length,
                result = {};

            for(var i = 0; i < inter_len; i++) {
                result[intersection[i]] = true;
            }

            return result;
        })(thisProtoKeys, parentProtoKeys);

        var thisProtoKeysLength = thisProtoKeys.length,
            parentProtoKeysLength = parentProtoKeys.length,
            funcInStr,
            i;

        var getFunctionBody = function(func) {
            var result = /function[\w\s\$]*\(([\w\s,]*)[\/\*\*\/]*\)[^{]+\{([\s\S]*)\}$/g.exec(func.toString());

            return {
                args: result[1].trim(),
                body: result[2]
            }
        };

        this.prototype.inheritChain = Array.prototype.slice.call(Parent.prototype.inheritChain);
        this.prototype.inheritChain.push(thisClassName);

        this.prototype.activeSuperContext = thisClassName;
        this.prototype.changeSuperContext = function() {
            var inheritChainLen = this.inheritChain.length;

            for(var i = inheritChainLen; i > -1; i--) {
                if(this.activeSuperContext === this.inheritChain[i]) break;
            }

            this.activeSuperContext = this.inheritChain[i - 1];
        };

        for(i = 0; i < parentProtoKeysLength; i++) {
            if(typeof Parent.prototype[parentProtoKeys[i]] === 'function') {
                if (!hasInThisPrototype[parentProtoKeys[i]]) {
                    if(parentProtoKeys[i] === 'changeSuperContext' || parentProtoKeys[i] === 'super'){
                        continue;
                    } else if(parentProtoKeys[i].indexOf('$') !== -1 || Parent.prototype[parentProtoKeys[i]].inherited) {
                        funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                        this.prototype[parentProtoKeys[i]] = eval.call(null, '(function ' + parentProtoKeys[i] + '(' + funcInStr.args + ') {' + funcInStr.body + '})');
                    } else {
                        funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                        this.prototype[parentClassName + '$' + parentProtoKeys[i]] =
                            eval.call(null, '(function ' + parentClassName + '$' + parentProtoKeys[i] + '(' + funcInStr.args + ') {' + funcInStr.body + '})');
                        this.prototype[parentProtoKeys[i]] = eval.call(null, '(function ' + parentProtoKeys[i] +  '(' + funcInStr.args + ') {' +
                            'if(!this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\']) {' +
                            'var currentActiveSuperContext = this.activeSuperContext;' +
                            'while(!this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'])' +
                            'this.changeSuperContext();' +
                            'var res = this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'](' + funcInStr.args + ');' +
                            'this.activeSuperContext = currentActiveSuperContext;' +
                            'return res;' +
                            '} else {' +
                            'return this[this.activeSuperContext + \'$' + parentProtoKeys[i] + '\'](' + funcInStr.args + ');' +
                            '}' +
                            '})');

                        this.prototype[parentProtoKeys[i]].inherited = true;
                    }
                }
            } else {
                if(!hasInThisPrototype[parentProtoKeys[i]] && parentProtoKeys[i] !== 'inheritChain') {
                    if(Object.prototype.toString.call(Parent.prototype[parentProtoKeys[i]]) === "[object Object]") {
                        this.prototype[parentProtoKeys[i]] = {};
                        clone(Parent.prototype[parentProtoKeys[i]], this.prototype[parentProtoKeys[i]]);
                    }
                }
            }
        }

        var parentConstructor = getFunctionBody(Parent.toString());

        this.prototype[parentClassName + '$constructor'] =
            eval.call(null, '(function ' + parentClassName + '$constructor(' + parentConstructor.args + ') {' + parentConstructor.body + '})');

        this.prototype.super = eval.call(null, '(function superFn(' + parentConstructor.args + ') {' +
            'this.changeSuperContext(); ' +
            'var i = this.activeSuperContext + \'$constructor\';' +
            'this[i](' + parentConstructor.args + ');' +
            'this.activeSuperContext = \'' + thisClassName + '\'; })');

        if(Parent.prototype.super) {
            var superKeys = Object.keys(Parent.prototype.super),
                superKeysLen = superKeys.length;

            for(i = 0; i < superKeysLen; i++) {
                this.prototype.super[superKeys[i]] = Parent.prototype.super[superKeys[i]];
            }
        }

        for(i = 0; i < thisProtoKeysLength; i++) {
            if(typeof this.prototype[thisProtoKeys[i]] === 'function') {
                funcInStr = getFunctionBody(this.prototype[thisProtoKeys[i]]);

                this.prototype[thisClassName + '$' + thisProtoKeys[i]] =
                    eval.call(null, '(function ' + thisClassName + '$' + thisProtoKeys[i] + '(' +funcInStr.args + ') {' + funcInStr.body + '})');
                this.prototype[thisProtoKeys[i]] =
                    eval.call(null, '(function ' + thisProtoKeys[i] + '(' + funcInStr.args + ') {' +
                        'return this[this.activeSuperContext + \'$' + thisProtoKeys[i] + '\'](' + funcInStr.args + '); })');
                this.prototype.super[thisProtoKeys[i]] = eval.call(null, '(function super$' + thisProtoKeys[i] + '(' + funcInStr.args + ') {' +
                    'this.changeSuperContext(); ' +
                    'var i = this.activeSuperContext + \'$' + thisProtoKeys[i] + '\';' +
                    'var res = this[i](' + funcInStr.args + ');' +
                    'this.activeSuperContext = \'' + thisClassName + '\';' +
                    'return res; })'
                );
            }
        }
    };

if(typeof Function.prototype.rootClass !== 'function')
    Function.prototype.rootClass = function() {
        var thisClassName = this.name,
            thisProtoKeys = Object.keys(this.prototype),
            thisProtoKeysLength = thisProtoKeys.length,
            i, funcInStr;

        if(!thisClassName) { //if function.name not working
            var functionNameRegExp = /^function\s*([^\s(]+)/;
            thisClassName = functionNameRegExp.exec(this.toString())[1];
        }

        var getFunctionBody = function(func) {
            var result = /function[\w\s]*\(([\w\s,]*)\)[^{]+\{([\s\S]*)\}$/.exec(func.toString());

            return {
                args: result[1],
                body: result[2]
            }
        };

        this.prototype.inheritChain = [thisClassName];

        for(i = 0; i < thisProtoKeysLength; i++) {
            if(typeof this.prototype[thisProtoKeys[i]] === 'function') {
                funcInStr = getFunctionBody(this.prototype[thisProtoKeys[i]]);

                if(funcInStr.args.length === 0) {
                    this.prototype[thisClassName + '$' + thisProtoKeys[i]] = Function(funcInStr.body);
                    this.prototype[thisProtoKeys[i]] = Function('return this[\'' + thisClassName + '$' + thisProtoKeys[i] + '\']();');
                } else {
                    this.prototype[thisClassName + '$' + thisProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
                    this.prototype[thisProtoKeys[i]] = Function(funcInStr.args, 'return this[\'' + thisClassName + '$' + thisProtoKeys[i] + '\'](' + funcInStr.args + ');');
                }
            }
        }
    };

function defer(onFulfill, onReject) {
    return {
        _queue: [{
            onFulfill: onFulfill,
            onReject: onReject
        }],
        then: function(onFulfill, onReject) {
            this._queue.push({
                onFulfill: onFulfill,
                onReject: onReject
            });

            return this;
        }
    }
}