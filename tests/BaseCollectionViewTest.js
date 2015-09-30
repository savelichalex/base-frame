var chai = require( 'chai' );

var assert = chai.assert;
var expect = chai.expect;

var BaseCollectionView = require( '../index' ).BaseCollectionView;

var h = require( 'virtual-dom' ).h;
var toHtml = require( 'vdom-to-html' );

var templateFn = new Function( "obj", "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};with(obj||{}){__p+='h(\"div\", [ \"'+((__t=(variable))==null?'':__t)+'\" ])';}return __p;" );

describe( 'BaseCollectionView', function () {

    it( 'should be extended by base-extends', function () {

        function TestView () {
            this.template = function () {
            };
            this.templates = {};
            this.super();
        }

        TestView.extends( BaseCollectionView );

        var test = new TestView();

        expect( test._emitter ).to.be.ok;
        expect( test._listeners ).to.be.ok;
        expect( test.inheritChain ).to.include( 'BaseView' );
        expect( test.inheritChain ).to.include( 'BaseCollectionView' );

    } );

    it( 'should throw error while collection not array', function () {

        function TestView () {
            this.template = templateFn;
            this.templates = {};
            this.super();
        }

        TestView.extends( BaseCollectionView );

        var test = new TestView();

        function fn () {
            test.render( {} );
        }

        expect( fn ).to.throw( 'Collection must be an Array' );

    } );

} );