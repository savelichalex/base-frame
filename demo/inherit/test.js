import util from '../../util';

function Test() {
    this.c = 3;
};

Test.prototype = {
    a: 1,
    getA: function() {
        return this.a;
    }
};

Test.rootClass();

function Test2() {
    this.super();
    this.a = 2;
};

Test2.prototype = {
    b: 2,
    getB: function() {
        return this.getA();
    },
    getD: function() {
        return this.super.getA.call(this);
    }
};

Test2.extends(Test);

function Test3() {
    this.super();
    this.a = 123;
}

Test3.prototype = {
    d: 4,
    getB: function() {
        return this.super.getB.call(this);
    }
};

Test3.extends(Test2);

var test = new Test3();

console.dir(test);

console.log(test.getA());