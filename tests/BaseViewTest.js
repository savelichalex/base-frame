var chai = require( 'chai' );

var assert = chai.assert;
var expect = chai.expect;

var BaseView = require( '../index' ).BaseView;

var h = require( 'virtual-dom' ).h;
var toHtml = require( 'vdom-to-html' );

describe( 'BaseView', function () {

    it( 'should be created and init', function () {
        var test = new BaseView();

        assert.instanceOf( test, BaseView, 'test must be instance of BaseView' );
    } );

    it( 'should be extended by base-extends', function () {

        function TestView () {
            this.super();
        }

        TestView.extends( BaseView );

        var test = new TestView();

        expect( test._emitter ).to.be.ok;
        expect( test._listeners ).to.be.ok;
        expect( test.inheritChain ).to.include( 'BaseView' );

    } );

    it( 'should throw error when create events by string', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            events: '123213'

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.throw( 'Events must be a hash object' );

    } );

    it( 'should throw error when create events by array', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            events: [ '123' ]

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.throw( 'Events must be a hash object' );

    } );

    it( 'should throw error when create event without node name', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            events: {
                'click': function () {

                }
            }

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.throw( 'Event must be with target node' );

    } );

    it( 'should throw error when create without rootNode', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            events: {
                'click node': function () {

                }
            }

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.throw( /RootNode not specified in/ );

    } );

    it( 'should throw error when create event without callback', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            rootNode: '#test',

            events: {
                'click node': '123'
            }

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.throw( 'Callback must be a function' );

    } );

    it( 'should not throw error while create events', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            rootNode: '#test',

            events: {
                'click node': function () {
                }
            }

        };

        TestView.extends( BaseView );

        var fn = function () {
            0, new TestView();
        };

        expect( fn ).to.not.throw( Error );

    } );

    it( 'should return vdom while render', function () {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            rootNode: '#test',

            events: {
                'click node': function () {
                }
            }

        };

        TestView.extends( BaseView );

        var test = new TestView();

        var outerHtml = toHtml( test.render( h( 'div' ) ) );

        expect( outerHtml ).to.equal( '<div></div>' );

    } );

    it( 'should listen renderComplete event', function ( done ) {
        function TestView () {
            this.super();
        }

        TestView.prototype = {

            rootNode: '#test',

        };

        TestView.extends( BaseView );

        var test = new TestView();

        test.once( 'renderComplete' ).then( function ( s ) {
            expect( s ).to.be.an( 'object' );
            done();
        }, function ( err ) {
            done( err );
        } );

        test.render( h( 'div' ) );

    } );

} );