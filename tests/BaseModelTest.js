var chai = require( 'chai' );

var assert = chai.assert;
var expect = chai.expect;

var BaseModel = require( '../index' ).BaseModel;

describe( 'BaseModel', function () {
    it( 'should be created and init', function () {
        var test = new BaseModel();

        assert.instanceOf( test, BaseModel, 'test must be instance of BaseModel' );
    } );

    it( 'should be extended by base-extends', function () {
        function TestModel () {
            this.super();

            this.defProperty( 'test' );
        }

        TestModel.extends( BaseModel );

        var test = new TestModel();

        expect( test._emitter ).to.be.ok;
        expect( test._properties ).to.be.ok;
        expect( test.inheritChain ).to.include( 'BaseModel' );
    } );

    it( 'should fire change event', function ( done ) {
        function TestModel () {
            this.super();

            this.defProperty( 'test' );
        }

        TestModel.extends( BaseModel );

        var test = new TestModel();

        test.on( 'change' ).then( function ( model ) {
            expect( model ).is.deep.equal( {
                test: 1
            } );
            done();
        } );

        test.test = 1;
    } );
} );