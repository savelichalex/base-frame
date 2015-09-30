var chai = require( 'chai' );

var assert = chai.assert;
var expect = chai.expect;

var BaseTreeView = require( '../index' ).BaseTreeView;

var h = require( 'virtual-dom' ).h;
var toHtml = require( 'vdom-to-html' );

var templateFn = new Function( "obj", "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};with(obj||{}){__p+='h(\"div\", [ \"'+((__t=(variable))==null?'':__t)+'\" ])';}return __p;" );

describe( 'BaseTreeView', function () {

    it( 'should be extended by base-extends', function () {

        function TestView () {
            this.rootTemplate = function () {
            };
            this.nodeTemplate = function () {
            };
            this.listTemplate = function () {
            };
            this.super();
        }

        TestView.prototype = {
            traverse: function () {
            }
        };

        TestView.extends( BaseTreeView );

        var test = new TestView();

        expect( test._emitter ).to.be.ok;
        expect( test._listeners ).to.be.ok;
        expect( test.inheritChain ).to.include( 'BaseView' );
        expect( test.inheritChain ).to.include( 'BaseTreeView' );

    } );

} );