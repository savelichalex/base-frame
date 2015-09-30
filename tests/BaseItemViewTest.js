var chai = require( 'chai' );

var assert = chai.assert;
var expect = chai.expect;

var BaseItemView = require( '../index' ).BaseItemView;

var h = require( 'virtual-dom' ).h;
var toHtml = require( 'vdom-to-html' );

var templateFn = new Function( "obj", "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};with(obj||{}){__p+='h(\"div\", [ \"'+((__t=(variable))==null?'':__t)+'\" ])';}return __p;" );

describe( 'BaseItemView', function () {

    it( 'should be extended by base-extends', function () {

        function TestView () {
            this.template = function () {
            };
            this.super();
        }

        TestView.extends( BaseItemView );

        var test = new TestView();

        expect( test._emitter ).to.be.ok;
        expect( test._listeners ).to.be.ok;
        expect( test.inheritChain ).to.include( 'BaseView' );
        expect( test.inheritChain ).to.include( 'BaseItemView' );

    } );

    it( 'should throw error while incorrect model', function () {

        function TestView () {
            this.template = templateFn;
            this.super();
        }

        TestView.extends( BaseItemView );

        var test = new TestView();

        function fn () {
            test.render();
        }

        expect( fn ).to.throw( ReferenceError );

    } );

    it( 'should return vdom while render', function () {

        function TestView () {
            this.template = templateFn;
            this.rootNode = '#node';
            this.super();
        }

        TestView.extends( BaseItemView );

        var test = new TestView();

        var outerHtml = toHtml( test.render( {
            variable: '123'
        } ) );

        expect( outerHtml ).to.equal( '<div>123</div>' );

    } );

} );