var clone = function(first, second) {
    if(Object.prototype.toString.call(second) !== "[object Object]" ||
        Object.prototype.toString.call(first) !== "[object Object]") {
        throw new Error("variables must be type of object");
    }

    for(let i in first) {
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
        var result = /function[\w\s]*\(([\w\s,]*)[\/\*\*\/]*\)[^{]+\{([\s\S]*)\}$/g.exec(func.toString());

        return {
            args: result[1],
            body: result[2]
        }
    };

    this.prototype.inheritChain = Parent.prototype.inheritChain;
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
                } else if(parentProtoKeys[i].indexOf('@') !== -1) {
                    funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                    this.prototype[parentProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
                }

                funcInStr = getFunctionBody(Parent.prototype[parentProtoKeys[i]]);

                this.prototype[parentClassName + '@' + parentProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
                this.prototype[parentProtoKeys[i]] = Function(funcInStr.args, 'return this[\'' + parentClassName + '@' + parentProtoKeys[i] + '\'](' + funcInStr.args + ');');
            }
        } else {
            this.prototype[parentProtoKeys[i]] = Parent.prototype[parentProtoKeys[i]];
        }
    }

    var parentConstructor = getFunctionBody(Parent.toString());

    this.prototype[parentClassName + '@constructor'] = Function(parentConstructor.args, parentConstructor.body);

    this.prototype.super = Function(parentConstructor.args,
        'this.changeSuperContext(); ' +
        'var i = this.activeSuperContext + \'@constructor\';' +
        'this[i](' + parentConstructor.args + ');' +
        'this.activeSuperContext = \'' + thisClassName + '\';');

    for(i = 0; i < thisProtoKeysLength; i++) {
        if(typeof this.prototype[thisProtoKeys[i]] === 'function') {
            funcInStr = getFunctionBody(this.prototype[thisProtoKeys[i]]);

            this.prototype[thisClassName + '@' + thisProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
            this.prototype[thisProtoKeys[i]] = Function(funcInStr.args, 'return this[\'' + thisClassName + '@' + thisProtoKeys[i] + '\'](' + funcInStr.args + ');');

            this.prototype.super[thisProtoKeys[i]] = Function(
                'this.changeSuperContext(); ' +
                'var i = this.activeSuperContext + \'@' + parentProtoKeys[i] + '\';' +
                'var res = this[i](' + funcInStr.args + ');' +
                'this.activeSuperContext = \'' + thisClassName + '\';' +
                'return res;'
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
                this.prototype[thisClassName + '@' + thisProtoKeys[i]] = Function(funcInStr.body);
                this.prototype[thisProtoKeys[i]] = Function('return this[\'' + thisClassName + '@' + thisProtoKeys[i] + '\']();');
            } else {
                this.prototype[thisClassName + '@' + thisProtoKeys[i]] = Function(funcInStr.args, funcInStr.body);
                this.prototype[thisProtoKeys[i]] = Function(funcInStr.args, 'return this[\'' + thisClassName + '@' + thisProtoKeys[i] + '\'](' + funcInStr.args + ');');
            }
        }
    }
};

export function defer(onFulfill, onReject) {
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