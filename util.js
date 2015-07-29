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

if(typeof Function.prototype.extends !== 'function')
Function.prototype.extends = function(Parent) {
    var tempProto = {};
    clone(this.prototype, tempProto);

    this.prototype = Object.create(Parent.prototype);
    this.prototype.constructor = this;
    this.prototype.__super__ = Parent;
    this.prototype.super = function _super() {
        var context = {
            __super__: this.__super__.prototype.__super__,
            super: _super
        };

        if(this.__super__) this.__super__.apply(context, arguments);

        for(let i in context) {
            if(context.hasOwnProperty(i)) {
                if(i !== 'super' && i !== '__super__') {
                    this[i] = context[i];
                }
            }
        }
    };

    clone(tempProto, this.prototype);
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