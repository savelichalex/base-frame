/******/
(function ( modules ) { // webpackBootstrap
	/******/ 	// The module cache
	/******/
	var installedModules = {};

	/******/ 	// The require function
	/******/
	function __webpack_require__ ( moduleId ) {

		/******/ 		// Check if module is in cache
		/******/
		if ( installedModules[ moduleId ] )
		/******/            return installedModules[ moduleId ].exports;

		/******/ 		// Create a new module (and put it into the cache)
		/******/
		var module = installedModules[ moduleId ] = {
			/******/            exports: {},
			/******/            id: moduleId,
			/******/            loaded: false
			/******/
		};

		/******/ 		// Execute the module function
		/******/
		modules[ moduleId ].call( module.exports, module, module.exports, __webpack_require__ );

		/******/ 		// Flag the module as loaded
		/******/
		module.loaded = true;

		/******/ 		// Return the exports of the module
		/******/
		return module.exports;
		/******/
	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/
	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/
	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/
	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/
	return __webpack_require__( 0 );
	/******/
})
	/************************************************************************/
	/******/( [
	/* 0 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		__webpack_require__( 12 );

		module.exports = {
			BaseCollectionView: __webpack_require__( 13 ),
			BaseItemView: __webpack_require__( 52 ),
			BaseModel: __webpack_require__( 1 ),
			BaseTreeView: __webpack_require__( 53 ),
			BaseView: __webpack_require__( 14 )
		};

		/***/
	},
	/* 1 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		Object.defineProperty( exports, '__esModule', {
			value: true
		} );

		var _baseComponents = __webpack_require__( 2 );

		var BaseModel = function BaseModel () {
		};

		BaseModel.prototype = {

			_emitter: void 0,

			_util: {
				emitter: _baseComponents.Emitter
			},

			_properties: void 0,

			defProperty: function defProperty ( prop, value ) {
				var self = this;

				if ( typeof value !== 'undefined' ) {
					this._properties[ prop ] = value;
				}

				Object.defineProperty( this, prop, {
					get: function get () {
						return self._properties[ prop ];
					},
					set: function set ( val ) {
						self._properties[ prop ] = val;
						this._change();
					},
					enumerable: true,
					configurable: true
				} );
			},

			on: function on ( event, context ) {
				return this._emitter.on( event, context );
			},

			trigger: function trigger ( event, data ) {
				return this._emitter.trigger( event, data );
			},

			_change: function _change () {
				this.trigger( 'change', this.getModel() );
			},

			getModel: function getModel () {
				return this._properties;
			},

			init: function init () {
				this._emitter = this._util.emitter();
				this._emitter.name = this.inheritChain[ this.inheritChain.length - 1 ];

				this._properties = {};
			}
		};

		exports[ 'default' ] = BaseModel;
		module.exports = exports[ 'default' ];

		/***/
	},
	/* 2 */
	/***/ function ( module, exports, __webpack_require__ ) {

		module.exports = {
			BaseComponent: __webpack_require__( 3 ),
			Emitter: __webpack_require__( 4 ),
			defer: __webpack_require__( 11 ).defer
		};

		/***/
	},
	/* 3 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var Emitter = __webpack_require__( 4 );

		var defer = __webpack_require__( 11 ).defer;

		"use strict";

		var GlobalEmitter = Emitter();
		GlobalEmitter.name = 'global';

		function BaseComponent () {
			//create local instance of emitter
			this._emitter = Emitter();
			//this._emitter.name = this.inheritChain[this.inheritChain.length - 1] + '-local'; //for debugging with
			// base-frame-extends base-frame-extends
			this._emitter.name = 'local'; //for debugging

			//create container for signals
			this.emit = {};

			//create slots and signals
			if ( Object.prototype.toString.call( this.slots ) === '[object Function]' ) {
				this.slots = this.slots();
			}
			this._slots( this.slots );
			if ( Object.prototype.toString.call( this.signals ) === '[object Function]' ) {
				this.signals = this.signals();
			}
			this._signals( this.signals );
		}

		BaseComponent.prototype = {

			_slots: function ( channels ) {
				for ( var channel in channels ) {
					if ( channels.hasOwnProperty( channel ) ) {

						var slots = channels[ channel ];

						if ( typeof slots === 'function' ) {
							slots = slots.call( {} );
						}

						if ( Object.prototype.toString.call( slots ) !== '[object Object]' ) {
							throw new Error( "Slots must be (or return from func) hash object" );
						}

						var emitter = channel === 'global' ? this._globalEmitter : this._emitter;

						for ( var slot in slots ) {
							if ( slots.hasOwnProperty( slot ) ) {
								var _arr = slot.split( '@' );
								if ( _arr.length > 2 ) {
									throw new Error( "Incorrect name of slot" );
								}
								var method = _arr[ 0 ];
								var event = _arr[ 1 ];

								var promise;

								switch ( method ) {
									case 'on':
										promise = emitter.on( event, this );
										break;
									case 'once':
										promise = emitter.once( event, this );
										break;
									case 'command':
										promise = emitter.commandFrom( event, this );
										break;
								}

								if ( Object.prototype.toString.call( slots[ slot ] ) === '[object Function]' ) {
									slots[ slot ] = defer( slots[ slot ] );
								}

								slots[ slot ]._queue.forEach( function ( cb ) {
									promise = promise.then( cb.onFulfill, cb.onReject );
								} );
							}
						}
					}
				}
			},

			_signals: function ( channels ) {
				for ( var channel in channels ) {
					if ( channels.hasOwnProperty( channel ) ) {

						var signals = channels[ channel ];

						if ( typeof signals === 'function' ) {
							signals = signals.call( {} );
						}

						if ( Object.prototype.toString.call( signals ) !== '[object Object]' ) {
							throw new Error( "Signals must be (or return from func) hash object" );
						}

						var emitter = channel === 'global' ? this._globalEmitter : this._emitter;

						for ( var signal in signals ) {
							if ( signals.hasOwnProperty( signal ) ) {
								var _arr = signal.split( '@' );
								if ( _arr.length > 2 ) {
									throw new Error( "Incorrect name of signal" );
								}

								var method = _arr[ 0 ];
								var event = _arr[ 1 ];

								this.emit[ signals[ signal ] ] = function ( data, obj ) {
									var _event;
									if ( obj ) {
										_event = event.replace( /\{([^\}]+)\}/g, function ( i, f ) {
											return obj[ f ];
										} );
									} else {
										_event = event;
									}
									switch ( method ) {
										case 'trigger':
											emitter.trigger( _event, data );
											break;
										case 'command':
											return emitter.commandTo( _event, data );
											break;
									}
								};
							}
						}
					}
				}
			}

		};

		module.exports = BaseComponent;

		/***/
	},
	/* 4 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var FastEmitter = __webpack_require__( 5 );
		var Promise = __webpack_require__( 9 );

		"use strict";

		module.exports = function () {
			var emitter, emitterProxy;

			emitter = new FastEmitter();

			emitterProxy = {

				on: function ( event, context ) {
					var promise,
						queue = [];
					emitter.on( event, function ( data ) {
						promise = new Promise( function ( resolve ) {
							resolve( data );
						} );
						var self = this;
						queue.forEach( function ( obj ) {
							promise = promise.bind( self ).then( obj.onResolve, obj.onReject );
						} )
					}, context );
					return {
						then: function ( onResolve, onReject ) {
							queue.push( {
								onResolve: onResolve,
								onReject: onReject
							} );
						}
					}
				},

				off: function ( event ) {
					emitter.off( event );
				},

				trigger: function ( event, data ) {
					console.log( event, this.name );
					emitter.emit( event, data );
				},

				once: function ( event, context ) {
					return new Promise( function ( resolve ) {
						emitter.once( event, function ( data ) {
							resolve( data );
						}, context );
					} );
				},

				_commandTo: function ( event, data ) {
					this.trigger( event + ':up', data );
					return this.once( event + ':down' );
				},

				_commandFrom: function ( event, context ) {
					var promise = this.on( event + ':up', context );
					return {
						then: function ( onResolve, onReject ) {
							promise = promise.then( onResolve, onReject );
							return this;
						},
						end: function () {
							promise.then( function ( data ) {
								emitterProxy.trigger( event + ':down', data );
							} );
						}
					};
				},

				_commands: {},

				commandTo: function ( event, data ) {
					if ( !this._commands[ event ] ) {
						this._commands[ event ] = {
							id: 0
						};
					}
					var id = this._commands[ event ].id;
					this.trigger( event + ':uniqueBefore', this._commands[ event ].id++ );
					var self = this,
						queue = [];
					emitterProxy
						.once( event + ':uniqueAfter' )
						.then( function () {
							var promise = self._commandTo( event + ':' + id++, data );
							queue.forEach( function ( obj ) {
								promise = promise.then( obj.onResolve, obj.onReject );
							} );
						} );
					return {
						then: function ( onResolve, onReject ) {
							queue.push( {
								onResolve: onResolve,
								onReject: onReject
							} );
						}
					}
				},

				commandFrom: function ( event, context ) {
					var queue = [];
					this.on( event + ':uniqueBefore', context )
						.then( function ( id ) {
							var promise = emitterProxy.once( event + ':' + id + ':up', context );
							emitterProxy.trigger( event + ':uniqueAfter' );
							queue.forEach( function ( obj ) {
								promise = promise.bind( context ).then( obj.onResolve, obj.onReject );
							} );
							promise.then( function ( data ) {
								emitterProxy.trigger( event + ':' + id + ':down', data );
							} );
						} );
					return {
						then: function ( onResolve, onReject ) {
							queue.push( {
								onResolve: onResolve,
								onReject: onReject
							} );
							return this;
						}
					};
				},

				Promise: Promise,
			};

			return emitterProxy;
		};

		/***/
	},
	/* 5 */
	/***/ function ( module, exports, __webpack_require__ ) {

		/* WEBPACK VAR INJECTION */
		(function ( process ) {/* jshint -W014, -W116, -W106, -W064, -W097, -W079 */
			/**
			 * @preserve Copyright (c) 2013 Petka Antonov
			 *
			 * Permission is hereby granted, free of charge, to any person obtaining a copy
			 * of this software and associated documentation files (the "Software"), to deal
			 * in the Software without restriction, including without limitation the rights
			 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			 * copies of the Software, and to permit persons to whom the Software is
			 * furnished to do so, subject to the following conditions:</p>
			 *
			 * The above copyright notice and this permission notice shall be included in
			 * all copies or substantial portions of the Software.
			 *
			 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
			 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
			 * THE SOFTWARE.
			 */
			"use strict";
			//TODO Prevent passing the same function identity multiple times as a listener
			//for the same event

			//TODO maxListeners API

			var INITIAL_DISTINCT_HANDLER_TYPES = 6;
			var domain;
			var isArray = Array.isArray;
			var objectCreate = Object.create;

			function EventEmitter () {
				this.domain = null;
				if ( EventEmitter.usingDomains ) {
					domain = domain || __webpack_require__( 7 );
					if ( domain.active && !(this instanceof domain.Domain) ) {
						this.domain = domain.active;
					}
				}
				this._maybeInit();
			}

			EventEmitter.EventEmitter = EventEmitter;

			EventEmitter.usingDomains = false;
			EventEmitter.defaultMaxListeners = 10;

			EventEmitter.prototype.setMaxListeners =
				function EventEmitter$setMaxListeners ( n ) {
					if ( ( n >>> 0 ) !== n ) {
						throw TypeError( "n must be a positive integer" );
					}
					this._maxListeners = n;
					return this;
				};

			EventEmitter.prototype.emit = function EventEmitter$emit ( type, a1, a2 ) {
				if ( type === void 0 ) return false;
				if ( typeof type !== "string" ) type = ( "" + type );
				this._maybeInit();

				var index = this._indexOfEvent( type );

				if ( index < 0 ) {
					if ( type === "error" ) {
						this._emitError( a1 );
					}
					return false;
				}

				var k = index + 1;
				var len = k + this._eventSpace;
				var argc = arguments.length;

				if ( this.domain != null && this !== process ) {
					this.domain.enter();
				}

				var eventsWereFired = false;
				if ( argc > 3 ) {
					var args = new Array( argc - 1 );
					for ( var i = 0, len = args.length; i < len; ++i ) {
						args[ i ] = arguments[ i + 1 ];
					}
					eventsWereFired = this._emitApply( k, len, args );
				}
				else if ( len - k === 1 ) {
					switch ( argc ) {
						case 1:
							eventsWereFired = this._emitSingle0( k );
							break;
						case 2:
							eventsWereFired = this._emitSingle1( k, a1 );
							break;
						case 3:
							eventsWereFired = this._emitSingle2( k, a1, a2 );
							break;
					}
				}
				else {
					switch ( argc ) {
						case 1:
							eventsWereFired = this._emit0( k, len );
							break;
						case 2:
							eventsWereFired = this._emit1( k, len, a1 );
							break;
						case 3:
							eventsWereFired = this._emit2( k, len, a1, a2 );
							break;
					}
				}

				if ( this.domain != null && this !== process ) {
					this.domain.exit();
				}
				return eventsWereFired;
			};

			EventEmitter.prototype.addListener =
				EventEmitter.prototype.on =
					function EventEmitter$addListener ( type, listener, context ) {
						if ( typeof listener !== "function" )
							throw new TypeError( "listener must be a function" );
						if ( typeof type !== "string" )
							type = ( "" + type );

						this._maybeInit();
						this._emitNew( type, listener );
						var index = this._nextFreeIndex( type );
						var events = this._events;
						events[ index ] = listener;
						events[ index ].context = context;
						return this;
					};

			EventEmitter.prototype.once = function EventEmitter$once ( type, listener, context ) {
				if ( typeof listener !== "function" )
					throw new TypeError( "listener must be a function" );
				if ( typeof type !== "string" )
					type = ( "" + type );

				this._maybeInit();
				this._emitNew( type, listener );
				var index = this._nextFreeIndex( type );
				var events = this._events;
				var self = this;

				function s () {
					self.removeListener( type, s );
					return listener.apply( this, arguments );
				}

				events[ index ] = s;
				s.listener = listener;
				s.context = context;
				return this;
			};

			EventEmitter.prototype.listeners = function EventEmitter$listeners ( type ) {
				if ( typeof type !== "string" )
					type = ( "" + type );

				this._maybeInit();
				var index = this._indexOfEvent( type );
				if ( index < 0 ) {
					return [];
				}
				var ret = [];
				var k = index + 1;
				var m = k + this._eventSpace;
				var events = this._events;
				for ( ; k < m; ++k ) {
					if ( events[ k ] === void 0 ) {
						break;
					}
					ret.push( events[ k ] );
				}
				return ret;
			};

			EventEmitter.prototype.removeListener =
				function EventEmitter$removeListener ( type, listener ) {
					if ( typeof listener !== "function" )
						throw new TypeError( "listener must be a function" );
					if ( typeof type !== "string" )
						type = ( "" + type );

					this._maybeInit();
					var index = this._indexOfEvent( type );

					if ( index < 0 ) {
						return this;
					}
					var events = this._events;
					var eventSpace = this._eventSpace;
					var k = index + 1;
					var j = k;
					var len = k + eventSpace;
					var skips = 0;
					var removeListenerIndex = -2;

					for ( ; k < len; ++k ) {
						var item = events[ k ];
						if ( item === listener ||
							( item !== void 0 && item.listener === listener ) ) {
							skips++;
							events[ k ] = void 0;
							if ( removeListenerIndex === -2 ) {
								removeListenerIndex = this._indexOfEvent( "removeListener" );
							}
							if ( removeListenerIndex >= 0 ) {
								this._emitRemove( type, listener );
							}
						}
						else {
							events[ j++ ] = item;
						}
					}

					for ( k = len - skips; k < len; ++k ) {
						events[ k ] = void 0;
					}


					return this;
				};

			EventEmitter.prototype.removeAllListeners =
				function EventEmitter$removeAllListeners ( type ) {
					this._maybeInit();
					if ( type === void 0 ) {
						if ( this._indexOfEvent( "removeListener" ) >= 0 ) {
							this._emitRemoveAll( void 0 );
						}
						var events = this._events = new Array( this._events.length );
						this._initSpace( events );
						return this;
					}
					if ( typeof type !== "string" )
						type = ( "" + type );

					var index = this._indexOfEvent( type );
					if ( index < 0 ) {
						return this;
					}
					var events = this._events;
					var eventSpace = this._eventSpace;
					var k = index + 1;
					var len = k + eventSpace;
					if ( this._indexOfEvent( "removeListener" ) >= 0 ) {
						this._emitRemoveAll( type );
					}
					for ( ; k < len; ++k ) {
						events[ k ] = void 0;
					}

					return this;
				};

			EventEmitter.listenerCount = function ( emitter, type ) {
				if ( !( emitter instanceof EventEmitter ) ) {
					throw new TypeError( "Not an event emitter" );
				}

				var total = 0;
				var events = emitter._events;
				if ( !isArray( events ) ) {
					return 0;
				}
				var len = events.length;
				if ( type === void 0 ) {
					for ( var i = 0; i < len; ++i ) {
						if ( typeof events[ i ] === "function" ) total++;
					}
				}
				else {
					if ( typeof type !== "string" )
						type = ( "" + type );
					var index = this._indexOfEvent( type ) + 1;
					var eventSpace = this._eventSpace;
					var k = index;
					var m = index + eventSpace;
					for ( ; k < m; ++k ) {
						if ( typeof events[ k ] === "function" ) total++;
					}
				}
				return total;
			};

			EventEmitter.prototype._resizeForHandlers =
				function EventEmitter$_resizeForHandlers () {
					var events = this._events;
					var tmp = new Array( events.length );
					for ( var i = 0, len = tmp.length; i < len; ++i ) {
						tmp[ i ] = events[ i ];
					}
					var oldEventSpace = this._eventSpace;
					var newEventSpace = this._eventSpace = ( oldEventSpace * 2 + 2 );
					var length = events.length = ( ( newEventSpace + 1 ) *
						Math.max( this._eventCount, INITIAL_DISTINCT_HANDLER_TYPES ) ) | 0;

					newEventSpace++;
					oldEventSpace++;
					for ( var i = 0, j = 0;
						  i < length;
						  i += newEventSpace, j += oldEventSpace ) {

						var k = j;
						var m = k + oldEventSpace;
						var n = 0;
						for ( ; k < m; ++k ) {
							events[ i + n ] = tmp[ k ];
							n++;
						}

						k = i + n;
						m = i + newEventSpace;
						for ( ; k < m; ++k ) {
							events[ k ] = void 0;
						}
					}
				};


			EventEmitter.prototype._doCompact = function EventEmitter$_doCompact () {
				var j = 0;
				var eventSpace = this._eventSpace + 1;
				var eventCount = this._eventCount;
				var shouldCompact = false;
				var events = this._events;
				for ( var i = 0; i < eventCount; ++i ) {
					if ( events[ j + 1 ] === void 0 ) {
						shouldCompact = true;
						break;
					}
					j += eventSpace;
				}
				if ( !shouldCompact ) return false;
				j = 0;
				var len = events.length;
				var skips = 0;
				for ( var i = 0; i < len; i += eventSpace ) {
					var listener = events[ i + 1 ];
					if ( listener === void 0 ) {
						skips += eventSpace;
					}
					else {
						var k = i;
						var m = k + eventSpace;
						for ( ; k < m; ++k ) {
							events[ j++ ] = events[ k ];
						}
					}
				}
				for ( var i = len - skips; i < len; ++i ) {
					events[ i ] = void 0;
				}
				return true;
			};

			EventEmitter.prototype._resizeForEvents =
				function EventEmitter$_resizeForEvents () {
					if ( this._doCompact() ) {
						return;
					}
					var events = this._events;
					var oldLength = events.length;
					var newLength = ( ( this._eventSpace + 1 ) *
					Math.max( this._eventCount * 2, INITIAL_DISTINCT_HANDLER_TYPES ) );
					for ( var i = oldLength; i < newLength; ++i ) {
						events.push( void 0 );
					}
				};

			EventEmitter.prototype._emitRemoveAll =
				function EventEmitter$_emitRemoveAll ( type ) {
					var events = this._events;
					if ( type === void 0 ) {
						var len = events.length;
						var eventSpace = this._eventSpace + 1;
						for ( var i = 0; i < len; i += eventSpace ) {
							var emitType = events[ i ];
							var k = i + 1;
							var m = k + eventSpace;
							for ( ; k < m; ++k ) {
								var listener = events[ k ];
								if ( listener === void 0 ) {
									break;
								}
								this._emitRemove( emitType, listener.listener
									? listener.listener
									: listener );
							}

						}
					}
					else {
						var k = this._indexOfEvent( type ) + 1;
						var m = k + this._eventSpace + 1;

						for ( ; k < m; ++k ) {
							var listener = events[ k ];
							if ( listener === void 0 ) {
								break;
							}
							this._emitRemove( type, listener.listener
								? listener.listener
								: listener );
						}
					}
				};

			EventEmitter.prototype._emitRemove =
				function EventEmitter$_emitRemove ( type, fn ) {
					this.emit( "removeListener", type, fn );
				};

			EventEmitter.prototype._emitNew = function EventEmitter$_emitNew ( type, fn ) {
				var i = this._indexOfEvent( "newListener " );
				if ( i < 0 ) return;
				this.emit( "newListener", type, fn );
			};

			EventEmitter.prototype._indexOfEvent =
				function EventEmitter$_indexOfEvent ( eventName ) {
					var j = 0;
					var eventSpace = this._eventSpace + 1;
					var eventCount = this._eventCount;
					var events = this._events;
					for ( var i = 0; i < eventCount; ++i ) {
						if ( events[ j ] === eventName ) {
							return j;
						}
						j += eventSpace;
					}
					return -1;
				};

			EventEmitter.prototype._warn =
				function EventEmitter$_warn ( eventName, listenerCount ) {
					if ( !this.__warnMap ) {
						this.__warnMap = objectCreate( null );
					}
					if ( !this.__warnMap[ eventName ] ) {
						this.__warnMap[ eventName ] = true;
						console.error( "(node) warning: possible EventEmitter memory " +
							"leak detected. %d listeners added. " +
							"Use emitter.setMaxListeners() to increase limit.",
							listenerCount );
						console.trace();
					}
				};

			EventEmitter.prototype._checkListenerLeak =
				function EventEmitter$_checkListenerLeak ( eventName, listenerCount ) {
					var max = this._maxListeners;
					if ( max < 0 ) {
						max = EventEmitter.defaultMaxListeners;
					}
					if ( (max >>> 0) === max && max > 0 ) {
						if ( listenerCount > max ) {
							this._warn( eventName, listenerCount );
						}
					}
				};

			EventEmitter.prototype._nextFreeIndex =
				function EventEmitter$_nextFreeIndex ( eventName ) {
					var eventSpace = this._eventSpace + 1;
					var events = this._events;
					var length = events.length;
					for ( var i = 0; i < length; i += eventSpace ) {
						var event = events[ i ];
						if ( event === eventName ) {
							var k = i + 1;
							var len = i + eventSpace;
							for ( ; k < len; ++k ) {
								if ( events[ k ] === void 0 ) {
									this._checkListenerLeak( eventName, k - i );
									return k;
								}
							}
							this._resizeForHandlers();
							return this._nextFreeIndex( eventName );
						}
						//Don't check leaks when there is 1 listener
						else if ( event === void 0 ) {
							events[ i ] = eventName;
							this._eventCount++;
							return i + 1;
						}
						else if ( events[ i + 1 ] === void 0 ) {
							events[ i ] = eventName;
							return i + 1;
						}
					}
					this._resizeForEvents();
					return this._nextFreeIndex( eventName );
				};

			EventEmitter.prototype._emitError = function EventEmitter$_emitError ( e ) {
				if ( this.domain != null ) {
					if ( !e ) {
						e = new TypeError( "Uncaught, unspecified 'error' event." );
					}
					e.domainEmitter = this;
					e.domain = this.domain;
					e.domainThrown = false;
					this.domain.emit( "error", e );
				}
				else if ( e instanceof Error ) {
					throw e;
				}
				else {
					throw new TypeError( "Uncaught, unspecified 'error' event." );
				}
			};

			EventEmitter.prototype._emitApply =
				function EventEmitter$_emitApply ( index, length, args ) {
					var eventsWereFired = false;
					var multipleListeners = ( length - index ) > 1;
					var events = this._events;
					var event = events[ index ];
					if ( !multipleListeners ) {
						if ( event !== void 0 ) {
							event.apply( event.context, args );
							return true;
						}
						return false;
					}
					var next = void 0;
					for ( ; index < length; ++index ) {
						event = events[ index ];
						if ( event === void 0 ) {
							break;
						}
						eventsWereFired = true;
						if ( multipleListeners && ( ( index + 1 ) < length ) ) {
							next = events[ index + 1 ];
						}
						event.apply( event.context, args );
						//The current listener was removed from its own callback
						if ( multipleListeners && ( ( index + 1 ) < length ) &&
							next !== void 0 && next === events[ index ] ) {
							index--;
							length--;
						}
					}
					return eventsWereFired;
				};

			EventEmitter.prototype._emitSingle0 =
				function EventEmitter$_emitSingle0 ( index ) {
					var event = this._events[ index ];
					if ( event !== void 0 ) {
						event.call( event.context );
						return true;
					}
					return false;
				};

			EventEmitter.prototype._emitSingle1 =
				function EventEmitter$_emitSingle1 ( index, a1 ) {
					var event = this._events[ index ];
					if ( event !== void 0 ) {
						event.call( event.context, a1 );
						return true;
					}
					return false;
				};

			EventEmitter.prototype._emitSingle2 =
				function EventEmitter$_emitSingle2 ( index, a1, a2 ) {
					var event = this._events[ index ];
					if ( event !== void 0 ) {
						event.call( event.context, a1, a2 );
						return true;
					}
					return false;
				};

			EventEmitter.prototype._emit0 = function EventEmitter$_emit0 ( index, length ) {
				var eventsWereFired = false;
				var next = void 0;
				var events = this._events;
				var event;
				for ( ; index < length; ++index ) {
					event = events[ index ];
					if ( event === void 0 ) {
						break;
					}
					eventsWereFired = true;
					if ( ( ( index + 1 ) < length ) ) {
						next = events[ index + 1 ];
					}
					event.call( event.context );
					//The current listener was removed from its own callback
					if ( ( ( index + 1 ) < length ) &&
						next !== void 0 && next === events[ index ] ) {
						index--;
						length--;
					}
					else if ( next === void 0 ) {
						break;
					}
				}
				return eventsWereFired;
			};

			EventEmitter.prototype._emit1 =
				function EventEmitter$_emit1 ( index, length, a1 ) {
					var eventsWereFired = false;
					var next = void 0;
					var events = this._events;
					var event;
					for ( ; index < length; ++index ) {
						event = events[ index ];
						if ( event === void 0 ) {
							break;
						}
						eventsWereFired = true;
						if ( ( ( index + 1 ) < length ) ) {
							next = events[ index + 1 ];
						}
						event.call( event.context, a1 );
						//The current listener was removed from its own callback
						if ( ( ( index + 1 ) < length ) &&
							next !== void 0 && next === events[ index ] ) {
							index--;
							length--;
						}
						else if ( next === void 0 ) {
							break;
						}
					}
					return eventsWereFired;
				};

			EventEmitter.prototype._emit2 =
				function EventEmitter$_emit2 ( index, length, a1, a2 ) {
					var eventsWereFired = false;
					var next = void 0;
					var events = this._events;
					var event;
					for ( ; index < length; ++index ) {
						event = events[ index ];
						if ( event === void 0 ) {
							break;
						}
						eventsWereFired = true;
						if ( ( ( index + 1 ) < length ) ) {
							next = events[ index + 1 ];
						}
						event.call( event.context, a1, a2 );
						//The current listener was removed from its own callback
						if ( ( ( index + 1 ) < length ) &&
							next !== void 0 && next === events[ index ] ) {
							index--;
							length--;
						}
						else if ( next === void 0 ) {
							break;
						}
					}
					return eventsWereFired;
				};

			//eventSpace =
			//The reserved space for handlers of a distinct event type

			//eventCount =
			//The amount of unique event types currently registered.
			//Might not be the actual amount


			EventEmitter.prototype._maybeInit = function EventEmitter$_maybeInit () {
				if ( !isArray( this._events ) ) {
					if ( ( this._maxListeners >>> 0 ) !== this._maxListeners ) {
						this._maxListeners = -1;
					}
					this._eventSpace = 1;
					this._eventCount = 0;
					var events = this._events = new Array( ( ( this._eventSpace + 1 ) *
						INITIAL_DISTINCT_HANDLER_TYPES ) | 0 );
					this._initSpace( events );
				}
			};

			EventEmitter.prototype._initSpace = function EventEmitter$_initSpace ( events ) {
				var len = events.length;
				for ( var i = 0; i < len; ++i ) {
					events[ i ] = void 0;
				}
			};

			module.exports = EventEmitter;
			/* WEBPACK VAR INJECTION */
		}.call( exports, __webpack_require__( 6 ) ))

		/***/
	},
	/* 6 */
	/***/ function ( module, exports ) {

		// shim for using process in browser

		var process = module.exports = {};
		var queue = [];
		var draining = false;
		var currentQueue;
		var queueIndex = -1;

		function cleanUpNextTick () {
			draining = false;
			if ( currentQueue.length ) {
				queue = currentQueue.concat( queue );
			} else {
				queueIndex = -1;
			}
			if ( queue.length ) {
				drainQueue();
			}
		}

		function drainQueue () {
			if ( draining ) {
				return;
			}
			var timeout = setTimeout( cleanUpNextTick );
			draining = true;

			var len = queue.length;
			while ( len ) {
				currentQueue = queue;
				queue = [];
				while ( ++queueIndex < len ) {
					currentQueue[ queueIndex ].run();
				}
				queueIndex = -1;
				len = queue.length;
			}
			currentQueue = null;
			draining = false;
			clearTimeout( timeout );
		}

		process.nextTick = function ( fun ) {
			var args = new Array( arguments.length - 1 );
			if ( arguments.length > 1 ) {
				for ( var i = 1; i < arguments.length; i++ ) {
					args[ i - 1 ] = arguments[ i ];
				}
			}
			queue.push( new Item( fun, args ) );
			if ( queue.length === 1 && !draining ) {
				setTimeout( drainQueue, 0 );
			}
		};

		// v8 likes predictible objects
		function Item ( fun, array ) {
			this.fun = fun;
			this.array = array;
		}

		Item.prototype.run = function () {
			this.fun.apply( null, this.array );
		};
		process.title = 'browser';
		process.browser = true;
		process.env = {};
		process.argv = [];
		process.version = ''; // empty string to avoid regexp issues
		process.versions = {};

		function noop () {
		}

		process.on = noop;
		process.addListener = noop;
		process.once = noop;
		process.off = noop;
		process.removeListener = noop;
		process.removeAllListeners = noop;
		process.emit = noop;

		process.binding = function ( name ) {
			throw new Error( 'process.binding is not supported' );
		};

		// TODO(shtylman)
		process.cwd = function () {
			return '/'
		};
		process.chdir = function ( dir ) {
			throw new Error( 'process.chdir is not supported' );
		};
		process.umask = function () {
			return 0;
		};


		/***/
	},
	/* 7 */
	/***/ function ( module, exports, __webpack_require__ ) {

		/*global define:false require:false */
		module.exports = (function () {
			// Import Events
			var events = __webpack_require__( 8 )

			// Export Domain
			var domain = {}
			domain.createDomain = domain.create = function () {
				var d = new events.EventEmitter()

				function emitError ( e ) {
					d.emit( 'error', e )
				}

				d.add = function ( emitter ) {
					emitter.on( 'error', emitError )
				}
				d.remove = function ( emitter ) {
					emitter.removeListener( 'error', emitError )
				}
				d.bind = function ( fn ) {
					return function () {
						var args = Array.prototype.slice.call( arguments )
						try {
							fn.apply( null, args )
						}
						catch ( err ) {
							emitError( err )
						}
					}
				}
				d.intercept = function ( fn ) {
					return function ( err ) {
						if ( err ) {
							emitError( err )
						}
						else {
							var args = Array.prototype.slice.call( arguments, 1 )
							try {
								fn.apply( null, args )
							}
							catch ( err ) {
								emitError( err )
							}
						}
					}
				}
				d.run = function ( fn ) {
					try {
						fn()
					}
					catch ( err ) {
						emitError( err )
					}
					return this
				};
				d.dispose = function () {
					this.removeAllListeners()
					return this
				};
				d.enter = d.exit = function () {
					return this
				}
				return d
			};
			return domain
		}).call( this )

		/***/
	},
	/* 8 */
	/***/ function ( module, exports ) {

		// Copyright Joyent, Inc. and other Node contributors.
		//
		// Permission is hereby granted, free of charge, to any person obtaining a
		// copy of this software and associated documentation files (the
		// "Software"), to deal in the Software without restriction, including
		// without limitation the rights to use, copy, modify, merge, publish,
		// distribute, sublicense, and/or sell copies of the Software, and to permit
		// persons to whom the Software is furnished to do so, subject to the
		// following conditions:
		//
		// The above copyright notice and this permission notice shall be included
		// in all copies or substantial portions of the Software.
		//
		// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
		// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
		// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
		// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
		// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
		// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
		// USE OR OTHER DEALINGS IN THE SOFTWARE.

		function EventEmitter () {
			this._events = this._events || {};
			this._maxListeners = this._maxListeners || undefined;
		}

		module.exports = EventEmitter;

		// Backwards-compat with node 0.10.x
		EventEmitter.EventEmitter = EventEmitter;

		EventEmitter.prototype._events = undefined;
		EventEmitter.prototype._maxListeners = undefined;

		// By default EventEmitters will print a warning if more than 10 listeners are
		// added to it. This is a useful default which helps finding memory leaks.
		EventEmitter.defaultMaxListeners = 10;

		// Obviously not all Emitters should be limited to 10. This function allows
		// that to be increased. Set to zero for unlimited.
		EventEmitter.prototype.setMaxListeners = function ( n ) {
			if ( !isNumber( n ) || n < 0 || isNaN( n ) )
				throw TypeError( 'n must be a positive number' );
			this._maxListeners = n;
			return this;
		};

		EventEmitter.prototype.emit = function ( type ) {
			var er, handler, len, args, i, listeners;

			if ( !this._events )
				this._events = {};

			// If there is no 'error' event listener then throw.
			if ( type === 'error' ) {
				if ( !this._events.error ||
					(isObject( this._events.error ) && !this._events.error.length) ) {
					er = arguments[ 1 ];
					if ( er instanceof Error ) {
						throw er; // Unhandled 'error' event
					}
					throw TypeError( 'Uncaught, unspecified "error" event.' );
				}
			}

			handler = this._events[ type ];

			if ( isUndefined( handler ) )
				return false;

			if ( isFunction( handler ) ) {
				switch ( arguments.length ) {
					// fast cases
					case 1:
						handler.call( this );
						break;
					case 2:
						handler.call( this, arguments[ 1 ] );
						break;
					case 3:
						handler.call( this, arguments[ 1 ], arguments[ 2 ] );
						break;
					// slower
					default:
						len = arguments.length;
						args = new Array( len - 1 );
						for ( i = 1; i < len; i++ )
							args[ i - 1 ] = arguments[ i ];
						handler.apply( this, args );
				}
			} else if ( isObject( handler ) ) {
				len = arguments.length;
				args = new Array( len - 1 );
				for ( i = 1; i < len; i++ )
					args[ i - 1 ] = arguments[ i ];

				listeners = handler.slice();
				len = listeners.length;
				for ( i = 0; i < len; i++ )
					listeners[ i ].apply( this, args );
			}

			return true;
		};

		EventEmitter.prototype.addListener = function ( type, listener ) {
			var m;

			if ( !isFunction( listener ) )
				throw TypeError( 'listener must be a function' );

			if ( !this._events )
				this._events = {};

			// To avoid recursion in the case that type === "newListener"! Before
			// adding it to the listeners, first emit "newListener".
			if ( this._events.newListener )
				this.emit( 'newListener', type,
					isFunction( listener.listener ) ?
						listener.listener : listener );

			if ( !this._events[ type ] )
			// Optimize the case of one listener. Don't need the extra array object.
				this._events[ type ] = listener;
			else if ( isObject( this._events[ type ] ) )
			// If we've already got an array, just append.
				this._events[ type ].push( listener );
			else
			// Adding the second element, need to change to array.
				this._events[ type ] = [ this._events[ type ], listener ];

			// Check for listener leak
			if ( isObject( this._events[ type ] ) && !this._events[ type ].warned ) {
				var m;
				if ( !isUndefined( this._maxListeners ) ) {
					m = this._maxListeners;
				} else {
					m = EventEmitter.defaultMaxListeners;
				}

				if ( m && m > 0 && this._events[ type ].length > m ) {
					this._events[ type ].warned = true;
					console.error( '(node) warning: possible EventEmitter memory ' +
						'leak detected. %d listeners added. ' +
						'Use emitter.setMaxListeners() to increase limit.',
						this._events[ type ].length );
					if ( typeof console.trace === 'function' ) {
						// not supported in IE 10
						console.trace();
					}
				}
			}

			return this;
		};

		EventEmitter.prototype.on = EventEmitter.prototype.addListener;

		EventEmitter.prototype.once = function ( type, listener ) {
			if ( !isFunction( listener ) )
				throw TypeError( 'listener must be a function' );

			var fired = false;

			function g () {
				this.removeListener( type, g );

				if ( !fired ) {
					fired = true;
					listener.apply( this, arguments );
				}
			}

			g.listener = listener;
			this.on( type, g );

			return this;
		};

		// emits a 'removeListener' event iff the listener was removed
		EventEmitter.prototype.removeListener = function ( type, listener ) {
			var list, position, length, i;

			if ( !isFunction( listener ) )
				throw TypeError( 'listener must be a function' );

			if ( !this._events || !this._events[ type ] )
				return this;

			list = this._events[ type ];
			length = list.length;
			position = -1;

			if ( list === listener ||
				(isFunction( list.listener ) && list.listener === listener) ) {
				delete this._events[ type ];
				if ( this._events.removeListener )
					this.emit( 'removeListener', type, listener );

			} else if ( isObject( list ) ) {
				for ( i = length; i-- > 0; ) {
					if ( list[ i ] === listener ||
						(list[ i ].listener && list[ i ].listener === listener) ) {
						position = i;
						break;
					}
				}

				if ( position < 0 )
					return this;

				if ( list.length === 1 ) {
					list.length = 0;
					delete this._events[ type ];
				} else {
					list.splice( position, 1 );
				}

				if ( this._events.removeListener )
					this.emit( 'removeListener', type, listener );
			}

			return this;
		};

		EventEmitter.prototype.removeAllListeners = function ( type ) {
			var key, listeners;

			if ( !this._events )
				return this;

			// not listening for removeListener, no need to emit
			if ( !this._events.removeListener ) {
				if ( arguments.length === 0 )
					this._events = {};
				else if ( this._events[ type ] )
					delete this._events[ type ];
				return this;
			}

			// emit removeListener for all listeners on all events
			if ( arguments.length === 0 ) {
				for ( key in this._events ) {
					if ( key === 'removeListener' ) continue;
					this.removeAllListeners( key );
				}
				this.removeAllListeners( 'removeListener' );
				this._events = {};
				return this;
			}

			listeners = this._events[ type ];

			if ( isFunction( listeners ) ) {
				this.removeListener( type, listeners );
			} else {
				// LIFO order
				while ( listeners.length )
					this.removeListener( type, listeners[ listeners.length - 1 ] );
			}
			delete this._events[ type ];

			return this;
		};

		EventEmitter.prototype.listeners = function ( type ) {
			var ret;
			if ( !this._events || !this._events[ type ] )
				ret = [];
			else if ( isFunction( this._events[ type ] ) )
				ret = [ this._events[ type ] ];
			else
				ret = this._events[ type ].slice();
			return ret;
		};

		EventEmitter.listenerCount = function ( emitter, type ) {
			var ret;
			if ( !emitter._events || !emitter._events[ type ] )
				ret = 0;
			else if ( isFunction( emitter._events[ type ] ) )
				ret = 1;
			else
				ret = emitter._events[ type ].length;
			return ret;
		};

		function isFunction ( arg ) {
			return typeof arg === 'function';
		}

		function isNumber ( arg ) {
			return typeof arg === 'number';
		}

		function isObject ( arg ) {
			return typeof arg === 'object' && arg !== null;
		}

		function isUndefined ( arg ) {
			return arg === void 0;
		}


		/***/
	},
	/* 9 */
	/***/ function ( module, exports, __webpack_require__ ) {

		/* WEBPACK VAR INJECTION */
		(function ( process, global, setImmediate ) {/* @preserve
		 * The MIT License (MIT)
		 * 
		 * Copyright (c) 2014 Petka Antonov
		 * 
		 * Permission is hereby granted, free of charge, to any person obtaining a copy
		 * of this software and associated documentation files (the "Software"), to deal
		 * in the Software without restriction, including without limitation the rights
		 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		 * copies of the Software, and to permit persons to whom the Software is
		 * furnished to do so, subject to the following conditions:
		 * 
		 * The above copyright notice and this permission notice shall be included in
		 * all copies or substantial portions of the Software.
		 * 
		 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
		 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		 * THE SOFTWARE.
		 * 
		 */
			/**
			 * bluebird build version 2.9.34
			 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, cancel, using, filter, any, each, timers
			 */
			!function ( e ) {
				if ( true )module.exports = e(); else if ( "function" == typeof define && define.amd )define( [], e ); else {
					var f;
					"undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.Promise = e()
				}
			}( function () {
				var define, module, exports;
				return (function e ( t, n, r ) {
					function s ( o, u ) {
						if ( !n[ o ] ) {
							if ( !t[ o ] ) {
								var a = typeof _dereq_ == "function" && _dereq_;
								if ( !u && a )return a( o, !0 );
								if ( i )return i( o, !0 );
								var f = new Error( "Cannot find module '" + o + "'" );
								throw f.code = "MODULE_NOT_FOUND", f
							}
							var l = n[ o ] = { exports: {} };
							t[ o ][ 0 ].call( l.exports, function ( e ) {
								var n = t[ o ][ 1 ][ e ];
								return s( n ? n : e )
							}, l, l.exports, e, t, n, r )
						}
						return n[ o ].exports
					}

					var i = typeof _dereq_ == "function" && _dereq_;
					for ( var o = 0; o < r.length; o++ )s( r[ o ] );
					return s
				})( {
					1: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise ) {
							var SomePromiseArray = Promise._SomePromiseArray;

							function any ( promises ) {
								var ret = new SomePromiseArray( promises );
								var promise = ret.promise();
								ret.setHowMany( 1 );
								ret.setUnwrap();
								ret.init();
								return promise;
							}

							Promise.any = function ( promises ) {
								return any( promises );
							};

							Promise.prototype.any = function () {
								return any( this );
							};

						};

					}, {} ],
					2: [ function ( _dereq_, module, exports ) {
						"use strict";
						var firstLineError;
						try {
							throw new Error();
						} catch ( e ) {
							firstLineError = e;
						}
						var schedule = _dereq_( "./schedule.js" );
						var Queue = _dereq_( "./queue.js" );
						var util = _dereq_( "./util.js" );

						function Async () {
							this._isTickUsed = false;
							this._lateQueue = new Queue( 16 );
							this._normalQueue = new Queue( 16 );
							this._trampolineEnabled = true;
							var self = this;
							this.drainQueues = function () {
								self._drainQueues();
							};
							this._schedule =
								schedule.isStatic ? schedule( this.drainQueues ) : schedule;
						}

						Async.prototype.disableTrampolineIfNecessary = function () {
							if ( util.hasDevTools ) {
								this._trampolineEnabled = false;
							}
						};

						Async.prototype.enableTrampoline = function () {
							if ( !this._trampolineEnabled ) {
								this._trampolineEnabled = true;
								this._schedule = function ( fn ) {
									setTimeout( fn, 0 );
								};
							}
						};

						Async.prototype.haveItemsQueued = function () {
							return this._normalQueue.length() > 0;
						};

						Async.prototype.throwLater = function ( fn, arg ) {
							if ( arguments.length === 1 ) {
								arg = fn;
								fn = function () {
									throw arg;
								};
							}
							if ( typeof setTimeout !== "undefined" ) {
								setTimeout( function () {
									fn( arg );
								}, 0 );
							} else try {
								this._schedule( function () {
									fn( arg );
								} );
							} catch ( e ) {
								throw new Error( "No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a" );
							}
						};

						function AsyncInvokeLater ( fn, receiver, arg ) {
							this._lateQueue.push( fn, receiver, arg );
							this._queueTick();
						}

						function AsyncInvoke ( fn, receiver, arg ) {
							this._normalQueue.push( fn, receiver, arg );
							this._queueTick();
						}

						function AsyncSettlePromises ( promise ) {
							this._normalQueue._pushOne( promise );
							this._queueTick();
						}

						if ( !util.hasDevTools ) {
							Async.prototype.invokeLater = AsyncInvokeLater;
							Async.prototype.invoke = AsyncInvoke;
							Async.prototype.settlePromises = AsyncSettlePromises;
						} else {
							if ( schedule.isStatic ) {
								schedule = function ( fn ) {
									setTimeout( fn, 0 );
								};
							}
							Async.prototype.invokeLater = function ( fn, receiver, arg ) {
								if ( this._trampolineEnabled ) {
									AsyncInvokeLater.call( this, fn, receiver, arg );
								} else {
									this._schedule( function () {
										setTimeout( function () {
											fn.call( receiver, arg );
										}, 100 );
									} );
								}
							};

							Async.prototype.invoke = function ( fn, receiver, arg ) {
								if ( this._trampolineEnabled ) {
									AsyncInvoke.call( this, fn, receiver, arg );
								} else {
									this._schedule( function () {
										fn.call( receiver, arg );
									} );
								}
							};

							Async.prototype.settlePromises = function ( promise ) {
								if ( this._trampolineEnabled ) {
									AsyncSettlePromises.call( this, promise );
								} else {
									this._schedule( function () {
										promise._settlePromises();
									} );
								}
							};
						}

						Async.prototype.invokeFirst = function ( fn, receiver, arg ) {
							this._normalQueue.unshift( fn, receiver, arg );
							this._queueTick();
						};

						Async.prototype._drainQueue = function ( queue ) {
							while ( queue.length() > 0 ) {
								var fn = queue.shift();
								if ( typeof fn !== "function" ) {
									fn._settlePromises();
									continue;
								}
								var receiver = queue.shift();
								var arg = queue.shift();
								fn.call( receiver, arg );
							}
						};

						Async.prototype._drainQueues = function () {
							this._drainQueue( this._normalQueue );
							this._reset();
							this._drainQueue( this._lateQueue );
						};

						Async.prototype._queueTick = function () {
							if ( !this._isTickUsed ) {
								this._isTickUsed = true;
								this._schedule( this.drainQueues );
							}
						};

						Async.prototype._reset = function () {
							this._isTickUsed = false;
						};

						module.exports = new Async();
						module.exports.firstLineError = firstLineError;

					}, { "./queue.js": 28, "./schedule.js": 31, "./util.js": 38 } ],
					3: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL, tryConvertToPromise ) {
							var rejectThis = function ( _, e ) {
								this._reject( e );
							};

							var targetRejected = function ( e, context ) {
								context.promiseRejectionQueued = true;
								context.bindingPromise._then( rejectThis, rejectThis, null, this, e );
							};

							var bindingResolved = function ( thisArg, context ) {
								if ( this._isPending() ) {
									this._resolveCallback( context.target );
								}
							};

							var bindingRejected = function ( e, context ) {
								if ( !context.promiseRejectionQueued ) this._reject( e );
							};

							Promise.prototype.bind = function ( thisArg ) {
								var maybePromise = tryConvertToPromise( thisArg );
								var ret = new Promise( INTERNAL );
								ret._propagateFrom( this, 1 );
								var target = this._target();

								ret._setBoundTo( maybePromise );
								if ( maybePromise instanceof Promise ) {
									var context = {
										promiseRejectionQueued: false,
										promise: ret,
										target: target,
										bindingPromise: maybePromise
									};
									target._then( INTERNAL, targetRejected, ret._progress, ret, context );
									maybePromise._then(
										bindingResolved, bindingRejected, ret._progress, ret, context );
								} else {
									ret._resolveCallback( target );
								}
								return ret;
							};

							Promise.prototype._setBoundTo = function ( obj ) {
								if ( obj !== undefined ) {
									this._bitField = this._bitField | 131072;
									this._boundTo = obj;
								} else {
									this._bitField = this._bitField & (~131072);
								}
							};

							Promise.prototype._isBound = function () {
								return (this._bitField & 131072) === 131072;
							};

							Promise.bind = function ( thisArg, value ) {
								var maybePromise = tryConvertToPromise( thisArg );
								var ret = new Promise( INTERNAL );

								ret._setBoundTo( maybePromise );
								if ( maybePromise instanceof Promise ) {
									maybePromise._then( function () {
										ret._resolveCallback( value );
									}, ret._reject, ret._progress, ret, null );
								} else {
									ret._resolveCallback( value );
								}
								return ret;
							};
						};

					}, {} ],
					4: [ function ( _dereq_, module, exports ) {
						"use strict";
						var old;
						if ( typeof Promise !== "undefined" ) old = Promise;
						function noConflict () {
							try {
								if ( Promise === bluebird ) Promise = old;
							}
							catch ( e ) {
							}
							return bluebird;
						}

						var bluebird = _dereq_( "./promise.js" )();
						bluebird.noConflict = noConflict;
						module.exports = bluebird;

					}, { "./promise.js": 23 } ],
					5: [ function ( _dereq_, module, exports ) {
						"use strict";
						var cr = Object.create;
						if ( cr ) {
							var callerCache = cr( null );
							var getterCache = cr( null );
							callerCache[ " size" ] = getterCache[ " size" ] = 0;
						}

						module.exports = function ( Promise ) {
							var util = _dereq_( "./util.js" );
							var canEvaluate = util.canEvaluate;
							var isIdentifier = util.isIdentifier;

							var getMethodCaller;
							var getGetter;
							if ( false ) {
								var makeMethodCaller = function ( methodName ) {
									return new Function( "ensureMethod", "                                    \n\
	        return function(obj) {                                               \n\
	            'use strict'                                                     \n\
	            var len = this.length;                                           \n\
	            ensureMethod(obj, 'methodName');                                 \n\
	            switch(len) {                                                    \n\
	                case 1: return obj.methodName(this[0]);                      \n\
	                case 2: return obj.methodName(this[0], this[1]);             \n\
	                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
	                case 0: return obj.methodName();                             \n\
	                default:                                                     \n\
	                    return obj.methodName.apply(obj, this);                  \n\
	            }                                                                \n\
	        };                                                                   \n\
	        ".replace( /methodName/g, methodName ) )( ensureMethod );
								};

								var makeGetter = function ( propertyName ) {
									return new Function( "obj", "                                             \n\
	        'use strict';                                                        \n\
	        return obj.propertyName;                                             \n\
	        ".replace( "propertyName", propertyName ) );
								};

								var getCompiled = function ( name, compiler, cache ) {
									var ret = cache[ name ];
									if ( typeof ret !== "function" ) {
										if ( !isIdentifier( name ) ) {
											return null;
										}
										ret = compiler( name );
										cache[ name ] = ret;
										cache[ " size" ]++;
										if ( cache[ " size" ] > 512 ) {
											var keys = Object.keys( cache );
											for ( var i = 0; i < 256; ++i ) delete cache[ keys[ i ] ];
											cache[ " size" ] = keys.length - 256;
										}
									}
									return ret;
								};

								getMethodCaller = function ( name ) {
									return getCompiled( name, makeMethodCaller, callerCache );
								};

								getGetter = function ( name ) {
									return getCompiled( name, makeGetter, getterCache );
								};
							}

							function ensureMethod ( obj, methodName ) {
								var fn;
								if ( obj != null ) fn = obj[ methodName ];
								if ( typeof fn !== "function" ) {
									var message = "Object " + util.classString( obj ) + " has no method '" +
										util.toString( methodName ) + "'";
									throw new Promise.TypeError( message );
								}
								return fn;
							}

							function caller ( obj ) {
								var methodName = this.pop();
								var fn = ensureMethod( obj, methodName );
								return fn.apply( obj, this );
							}

							Promise.prototype.call = function ( methodName ) {
								var $_len = arguments.length;
								var args = new Array( $_len - 1 );
								for ( var $_i = 1; $_i < $_len; ++$_i ) {
									args[ $_i - 1 ] = arguments[ $_i ];
								}
								if ( false ) {
									if ( canEvaluate ) {
										var maybeCaller = getMethodCaller( methodName );
										if ( maybeCaller !== null ) {
											return this._then(
												maybeCaller, undefined, undefined, args, undefined );
										}
									}
								}
								args.push( methodName );
								return this._then( caller, undefined, undefined, args, undefined );
							};

							function namedGetter ( obj ) {
								return obj[ this ];
							}

							function indexedGetter ( obj ) {
								var index = +this;
								if ( index < 0 ) index = Math.max( 0, index + obj.length );
								return obj[ index ];
							}

							Promise.prototype.get = function ( propertyName ) {
								var isIndex = (typeof propertyName === "number");
								var getter;
								if ( !isIndex ) {
									if ( canEvaluate ) {
										var maybeGetter = getGetter( propertyName );
										getter = maybeGetter !== null ? maybeGetter : namedGetter;
									} else {
										getter = namedGetter;
									}
								} else {
									getter = indexedGetter;
								}
								return this._then( getter, undefined, undefined, propertyName, undefined );
							};
						};

					}, { "./util.js": 38 } ],
					6: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise ) {
							var errors = _dereq_( "./errors.js" );
							var async = _dereq_( "./async.js" );
							var CancellationError = errors.CancellationError;

							Promise.prototype._cancel = function ( reason ) {
								if ( !this.isCancellable() ) return this;
								var parent;
								var promiseToReject = this;
								while ( (parent = promiseToReject._cancellationParent) !== undefined &&
								parent.isCancellable() ) {
									promiseToReject = parent;
								}
								this._unsetCancellable();
								promiseToReject._target()._rejectCallback( reason, false, true );
							};

							Promise.prototype.cancel = function ( reason ) {
								if ( !this.isCancellable() ) return this;
								if ( reason === undefined ) reason = new CancellationError();
								async.invokeLater( this._cancel, this, reason );
								return this;
							};

							Promise.prototype.cancellable = function () {
								if ( this._cancellable() ) return this;
								async.enableTrampoline();
								this._setCancellable();
								this._cancellationParent = undefined;
								return this;
							};

							Promise.prototype.uncancellable = function () {
								var ret = this.then();
								ret._unsetCancellable();
								return ret;
							};

							Promise.prototype.fork = function ( didFulfill, didReject, didProgress ) {
								var ret = this._then( didFulfill, didReject, didProgress,
									undefined, undefined );

								ret._setCancellable();
								ret._cancellationParent = undefined;
								return ret;
							};
						};

					}, { "./async.js": 2, "./errors.js": 13 } ],
					7: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function () {
							var async = _dereq_( "./async.js" );
							var util = _dereq_( "./util.js" );
							var bluebirdFramePattern =
								/[\\\/]bluebird[\\\/]js[\\\/](main|debug|zalgo|instrumented)/;
							var stackFramePattern = null;
							var formatStack = null;
							var indentStackFrames = false;
							var warn;

							function CapturedTrace ( parent ) {
								this._parent = parent;
								var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
								captureStackTrace( this, CapturedTrace );
								if ( length > 32 ) this.uncycle();
							}

							util.inherits( CapturedTrace, Error );

							CapturedTrace.prototype.uncycle = function () {
								var length = this._length;
								if ( length < 2 ) return;
								var nodes = [];
								var stackToIndex = {};

								for ( var i = 0, node = this; node !== undefined; ++i ) {
									nodes.push( node );
									node = node._parent;
								}
								length = this._length = i;
								for ( var i = length - 1; i >= 0; --i ) {
									var stack = nodes[ i ].stack;
									if ( stackToIndex[ stack ] === undefined ) {
										stackToIndex[ stack ] = i;
									}
								}
								for ( var i = 0; i < length; ++i ) {
									var currentStack = nodes[ i ].stack;
									var index = stackToIndex[ currentStack ];
									if ( index !== undefined && index !== i ) {
										if ( index > 0 ) {
											nodes[ index - 1 ]._parent = undefined;
											nodes[ index - 1 ]._length = 1;
										}
										nodes[ i ]._parent = undefined;
										nodes[ i ]._length = 1;
										var cycleEdgeNode = i > 0 ? nodes[ i - 1 ] : this;

										if ( index < length - 1 ) {
											cycleEdgeNode._parent = nodes[ index + 1 ];
											cycleEdgeNode._parent.uncycle();
											cycleEdgeNode._length =
												cycleEdgeNode._parent._length + 1;
										} else {
											cycleEdgeNode._parent = undefined;
											cycleEdgeNode._length = 1;
										}
										var currentChildLength = cycleEdgeNode._length + 1;
										for ( var j = i - 2; j >= 0; --j ) {
											nodes[ j ]._length = currentChildLength;
											currentChildLength++;
										}
										return;
									}
								}
							};

							CapturedTrace.prototype.parent = function () {
								return this._parent;
							};

							CapturedTrace.prototype.hasParent = function () {
								return this._parent !== undefined;
							};

							CapturedTrace.prototype.attachExtraTrace = function ( error ) {
								if ( error.__stackCleaned__ ) return;
								this.uncycle();
								var parsed = CapturedTrace.parseStackAndMessage( error );
								var message = parsed.message;
								var stacks = [ parsed.stack ];

								var trace = this;
								while ( trace !== undefined ) {
									stacks.push( cleanStack( trace.stack.split( "\n" ) ) );
									trace = trace._parent;
								}
								removeCommonRoots( stacks );
								removeDuplicateOrEmptyJumps( stacks );
								util.notEnumerableProp( error, "stack", reconstructStack( message, stacks ) );
								util.notEnumerableProp( error, "__stackCleaned__", true );
							};

							function reconstructStack ( message, stacks ) {
								for ( var i = 0; i < stacks.length - 1; ++i ) {
									stacks[ i ].push( "From previous event:" );
									stacks[ i ] = stacks[ i ].join( "\n" );
								}
								if ( i < stacks.length ) {
									stacks[ i ] = stacks[ i ].join( "\n" );
								}
								return message + "\n" + stacks.join( "\n" );
							}

							function removeDuplicateOrEmptyJumps ( stacks ) {
								for ( var i = 0; i < stacks.length; ++i ) {
									if ( stacks[ i ].length === 0 ||
										((i + 1 < stacks.length) && stacks[ i ][ 0 ] === stacks[ i + 1 ][ 0 ]) ) {
										stacks.splice( i, 1 );
										i--;
									}
								}
							}

							function removeCommonRoots ( stacks ) {
								var current = stacks[ 0 ];
								for ( var i = 1; i < stacks.length; ++i ) {
									var prev = stacks[ i ];
									var currentLastIndex = current.length - 1;
									var currentLastLine = current[ currentLastIndex ];
									var commonRootMeetPoint = -1;

									for ( var j = prev.length - 1; j >= 0; --j ) {
										if ( prev[ j ] === currentLastLine ) {
											commonRootMeetPoint = j;
											break;
										}
									}

									for ( var j = commonRootMeetPoint; j >= 0; --j ) {
										var line = prev[ j ];
										if ( current[ currentLastIndex ] === line ) {
											current.pop();
											currentLastIndex--;
										} else {
											break;
										}
									}
									current = prev;
								}
							}

							function cleanStack ( stack ) {
								var ret = [];
								for ( var i = 0; i < stack.length; ++i ) {
									var line = stack[ i ];
									var isTraceLine = stackFramePattern.test( line ) ||
										"    (No stack trace)" === line;
									var isInternalFrame = isTraceLine && shouldIgnore( line );
									if ( isTraceLine && !isInternalFrame ) {
										if ( indentStackFrames && line.charAt( 0 ) !== " " ) {
											line = "    " + line;
										}
										ret.push( line );
									}
								}
								return ret;
							}

							function stackFramesAsArray ( error ) {
								var stack = error.stack.replace( /\s+$/g, "" ).split( "\n" );
								for ( var i = 0; i < stack.length; ++i ) {
									var line = stack[ i ];
									if ( "    (No stack trace)" === line || stackFramePattern.test( line ) ) {
										break;
									}
								}
								if ( i > 0 ) {
									stack = stack.slice( i );
								}
								return stack;
							}

							CapturedTrace.parseStackAndMessage = function ( error ) {
								var stack = error.stack;
								var message = error.toString();
								stack = typeof stack === "string" && stack.length > 0
									? stackFramesAsArray( error ) : [ "    (No stack trace)" ];
								return {
									message: message,
									stack: cleanStack( stack )
								};
							};

							CapturedTrace.formatAndLogError = function ( error, title ) {
								if ( typeof console !== "undefined" ) {
									var message;
									if ( typeof error === "object" || typeof error === "function" ) {
										var stack = error.stack;
										message = title + formatStack( stack, error );
									} else {
										message = title + String( error );
									}
									if ( typeof warn === "function" ) {
										warn( message );
									} else if ( typeof console.log === "function" ||
										typeof console.log === "object" ) {
										console.log( message );
									}
								}
							};

							CapturedTrace.unhandledRejection = function ( reason ) {
								CapturedTrace.formatAndLogError( reason, "^--- With additional stack trace: " );
							};

							CapturedTrace.isSupported = function () {
								return typeof captureStackTrace === "function";
							};

							CapturedTrace.fireRejectionEvent =
								function ( name, localHandler, reason, promise ) {
									var localEventFired = false;
									try {
										if ( typeof localHandler === "function" ) {
											localEventFired = true;
											if ( name === "rejectionHandled" ) {
												localHandler( promise );
											} else {
												localHandler( reason, promise );
											}
										}
									} catch ( e ) {
										async.throwLater( e );
									}

									var globalEventFired = false;
									try {
										globalEventFired = fireGlobalEvent( name, reason, promise );
									} catch ( e ) {
										globalEventFired = true;
										async.throwLater( e );
									}

									var domEventFired = false;
									if ( fireDomEvent ) {
										try {
											domEventFired = fireDomEvent( name.toLowerCase(), {
												reason: reason,
												promise: promise
											} );
										} catch ( e ) {
											domEventFired = true;
											async.throwLater( e );
										}
									}

									if ( !globalEventFired && !localEventFired && !domEventFired &&
										name === "unhandledRejection" ) {
										CapturedTrace.formatAndLogError( reason, "Unhandled rejection " );
									}
								};

							function formatNonError ( obj ) {
								var str;
								if ( typeof obj === "function" ) {
									str = "[function " +
										(obj.name || "anonymous") +
										"]";
								} else {
									str = obj.toString();
									var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
									if ( ruselessToString.test( str ) ) {
										try {
											var newStr = JSON.stringify( obj );
											str = newStr;
										}
										catch ( e ) {

										}
									}
									if ( str.length === 0 ) {
										str = "(empty array)";
									}
								}
								return ("(<" + snip( str ) + ">, no stack trace)");
							}

							function snip ( str ) {
								var maxChars = 41;
								if ( str.length < maxChars ) {
									return str;
								}
								return str.substr( 0, maxChars - 3 ) + "...";
							}

							var shouldIgnore = function () {
								return false;
							};
							var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;

							function parseLineInfo ( line ) {
								var matches = line.match( parseLineInfoRegex );
								if ( matches ) {
									return {
										fileName: matches[ 1 ],
										line: parseInt( matches[ 2 ], 10 )
									};
								}
							}

							CapturedTrace.setBounds = function ( firstLineError, lastLineError ) {
								if ( !CapturedTrace.isSupported() ) return;
								var firstStackLines = firstLineError.stack.split( "\n" );
								var lastStackLines = lastLineError.stack.split( "\n" );
								var firstIndex = -1;
								var lastIndex = -1;
								var firstFileName;
								var lastFileName;
								for ( var i = 0; i < firstStackLines.length; ++i ) {
									var result = parseLineInfo( firstStackLines[ i ] );
									if ( result ) {
										firstFileName = result.fileName;
										firstIndex = result.line;
										break;
									}
								}
								for ( var i = 0; i < lastStackLines.length; ++i ) {
									var result = parseLineInfo( lastStackLines[ i ] );
									if ( result ) {
										lastFileName = result.fileName;
										lastIndex = result.line;
										break;
									}
								}
								if ( firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
									firstFileName !== lastFileName || firstIndex >= lastIndex ) {
									return;
								}

								shouldIgnore = function ( line ) {
									if ( bluebirdFramePattern.test( line ) ) return true;
									var info = parseLineInfo( line );
									if ( info ) {
										if ( info.fileName === firstFileName &&
											(firstIndex <= info.line && info.line <= lastIndex) ) {
											return true;
										}
									}
									return false;
								};
							};

							var captureStackTrace = (function stackDetection () {
								var v8stackFramePattern = /^\s*at\s*/;
								var v8stackFormatter = function ( stack, error ) {
									if ( typeof stack === "string" ) return stack;

									if ( error.name !== undefined &&
										error.message !== undefined ) {
										return error.toString();
									}
									return formatNonError( error );
								};

								if ( typeof Error.stackTraceLimit === "number" &&
									typeof Error.captureStackTrace === "function" ) {
									Error.stackTraceLimit = Error.stackTraceLimit + 6;
									stackFramePattern = v8stackFramePattern;
									formatStack = v8stackFormatter;
									var captureStackTrace = Error.captureStackTrace;

									shouldIgnore = function ( line ) {
										return bluebirdFramePattern.test( line );
									};
									return function ( receiver, ignoreUntil ) {
										Error.stackTraceLimit = Error.stackTraceLimit + 6;
										captureStackTrace( receiver, ignoreUntil );
										Error.stackTraceLimit = Error.stackTraceLimit - 6;
									};
								}
								var err = new Error();

								if ( typeof err.stack === "string" &&
									err.stack.split( "\n" )[ 0 ].indexOf( "stackDetection@" ) >= 0 ) {
									stackFramePattern = /@/;
									formatStack = v8stackFormatter;
									indentStackFrames = true;
									return function captureStackTrace ( o ) {
										o.stack = new Error().stack;
									};
								}

								var hasStackAfterThrow;
								try {
									throw new Error();
								}
								catch ( e ) {
									hasStackAfterThrow = ("stack" in e);
								}
								if ( !("stack" in err) && hasStackAfterThrow &&
									typeof Error.stackTraceLimit === "number" ) {
									stackFramePattern = v8stackFramePattern;
									formatStack = v8stackFormatter;
									return function captureStackTrace ( o ) {
										Error.stackTraceLimit = Error.stackTraceLimit + 6;
										try {
											throw new Error();
										}
										catch ( e ) {
											o.stack = e.stack;
										}
										Error.stackTraceLimit = Error.stackTraceLimit - 6;
									};
								}

								formatStack = function ( stack, error ) {
									if ( typeof stack === "string" ) return stack;

									if ( (typeof error === "object" ||
										typeof error === "function") &&
										error.name !== undefined &&
										error.message !== undefined ) {
										return error.toString();
									}
									return formatNonError( error );
								};

								return null;

							})( [] );

							var fireDomEvent;
							var fireGlobalEvent = (function () {
								if ( util.isNode ) {
									return function ( name, reason, promise ) {
										if ( name === "rejectionHandled" ) {
											return process.emit( name, promise );
										} else {
											return process.emit( name, reason, promise );
										}
									};
								} else {
									var customEventWorks = false;
									var anyEventWorks = true;
									try {
										var ev = new self.CustomEvent( "test" );
										customEventWorks = ev instanceof CustomEvent;
									} catch ( e ) {
									}
									if ( !customEventWorks ) {
										try {
											var event = document.createEvent( "CustomEvent" );
											event.initCustomEvent( "testingtheevent", false, true, {} );
											self.dispatchEvent( event );
										} catch ( e ) {
											anyEventWorks = false;
										}
									}
									if ( anyEventWorks ) {
										fireDomEvent = function ( type, detail ) {
											var event;
											if ( customEventWorks ) {
												event = new self.CustomEvent( type, {
													detail: detail,
													bubbles: false,
													cancelable: true
												} );
											} else if ( self.dispatchEvent ) {
												event = document.createEvent( "CustomEvent" );
												event.initCustomEvent( type, false, true, detail );
											}

											return event ? !self.dispatchEvent( event ) : false;
										};
									}

									var toWindowMethodNameMap = {};
									toWindowMethodNameMap[ "unhandledRejection" ] = ("on" +
									"unhandledRejection").toLowerCase();
									toWindowMethodNameMap[ "rejectionHandled" ] = ("on" +
									"rejectionHandled").toLowerCase();

									return function ( name, reason, promise ) {
										var methodName = toWindowMethodNameMap[ name ];
										var method = self[ methodName ];
										if ( !method ) return false;
										if ( name === "rejectionHandled" ) {
											method.call( self, promise );
										} else {
											method.call( self, reason, promise );
										}
										return true;
									};
								}
							})();

							if ( typeof console !== "undefined" && typeof console.warn !== "undefined" ) {
								warn = function ( message ) {
									console.warn( message );
								};
								if ( util.isNode && process.stderr.isTTY ) {
									warn = function ( message ) {
										process.stderr.write( "\u001b[31m" + message + "\u001b[39m\n" );
									};
								} else if ( !util.isNode && typeof (new Error().stack) === "string" ) {
									warn = function ( message ) {
										console.warn( "%c" + message, "color: red" );
									};
								}
							}

							return CapturedTrace;
						};

					}, { "./async.js": 2, "./util.js": 38 } ],
					8: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( NEXT_FILTER ) {
							var util = _dereq_( "./util.js" );
							var errors = _dereq_( "./errors.js" );
							var tryCatch = util.tryCatch;
							var errorObj = util.errorObj;
							var keys = _dereq_( "./es5.js" ).keys;
							var TypeError = errors.TypeError;

							function CatchFilter ( instances, callback, promise ) {
								this._instances = instances;
								this._callback = callback;
								this._promise = promise;
							}

							function safePredicate ( predicate, e ) {
								var safeObject = {};
								var retfilter = tryCatch( predicate ).call( safeObject, e );

								if ( retfilter === errorObj ) return retfilter;

								var safeKeys = keys( safeObject );
								if ( safeKeys.length ) {
									errorObj.e = new TypeError( "Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a" );
									return errorObj;
								}
								return retfilter;
							}

							CatchFilter.prototype.doFilter = function ( e ) {
								var cb = this._callback;
								var promise = this._promise;
								var boundTo = promise._boundValue();
								for ( var i = 0, len = this._instances.length; i < len; ++i ) {
									var item = this._instances[ i ];
									var itemIsErrorType = item === Error ||
										(item != null && item.prototype instanceof Error);

									if ( itemIsErrorType && e instanceof item ) {
										var ret = tryCatch( cb ).call( boundTo, e );
										if ( ret === errorObj ) {
											NEXT_FILTER.e = ret.e;
											return NEXT_FILTER;
										}
										return ret;
									} else if ( typeof item === "function" && !itemIsErrorType ) {
										var shouldHandle = safePredicate( item, e );
										if ( shouldHandle === errorObj ) {
											e = errorObj.e;
											break;
										} else if ( shouldHandle ) {
											var ret = tryCatch( cb ).call( boundTo, e );
											if ( ret === errorObj ) {
												NEXT_FILTER.e = ret.e;
												return NEXT_FILTER;
											}
											return ret;
										}
									}
								}
								NEXT_FILTER.e = e;
								return NEXT_FILTER;
							};

							return CatchFilter;
						};

					}, { "./errors.js": 13, "./es5.js": 14, "./util.js": 38 } ],
					9: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, CapturedTrace, isDebugging ) {
							var contextStack = [];

							function Context () {
								this._trace = new CapturedTrace( peekContext() );
							}

							Context.prototype._pushContext = function () {
								if ( !isDebugging() ) return;
								if ( this._trace !== undefined ) {
									contextStack.push( this._trace );
								}
							};

							Context.prototype._popContext = function () {
								if ( !isDebugging() ) return;
								if ( this._trace !== undefined ) {
									contextStack.pop();
								}
							};

							function createContext () {
								if ( isDebugging() ) return new Context();
							}

							function peekContext () {
								var lastIndex = contextStack.length - 1;
								if ( lastIndex >= 0 ) {
									return contextStack[ lastIndex ];
								}
								return undefined;
							}

							Promise.prototype._peekContext = peekContext;
							Promise.prototype._pushContext = Context.prototype._pushContext;
							Promise.prototype._popContext = Context.prototype._popContext;

							return createContext;
						};

					}, {} ],
					10: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, CapturedTrace ) {
							var getDomain = Promise._getDomain;
							var async = _dereq_( "./async.js" );
							var Warning = _dereq_( "./errors.js" ).Warning;
							var util = _dereq_( "./util.js" );
							var canAttachTrace = util.canAttachTrace;
							var unhandledRejectionHandled;
							var possiblyUnhandledRejection;
							var debugging = false || (util.isNode &&
								(!!process.env[ "BLUEBIRD_DEBUG" ] ||
								process.env[ "NODE_ENV" ] === "development"));

							if ( debugging ) {
								async.disableTrampolineIfNecessary();
							}

							Promise.prototype._ignoreRejections = function () {
								this._unsetRejectionIsUnhandled();
								this._bitField = this._bitField | 16777216;
							};

							Promise.prototype._ensurePossibleRejectionHandled = function () {
								if ( (this._bitField & 16777216) !== 0 ) return;
								this._setRejectionIsUnhandled();
								async.invokeLater( this._notifyUnhandledRejection, this, undefined );
							};

							Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
								CapturedTrace.fireRejectionEvent( "rejectionHandled",
									unhandledRejectionHandled, undefined, this );
							};

							Promise.prototype._notifyUnhandledRejection = function () {
								if ( this._isRejectionUnhandled() ) {
									var reason = this._getCarriedStackTrace() || this._settledValue;
									this._setUnhandledRejectionIsNotified();
									CapturedTrace.fireRejectionEvent( "unhandledRejection",
										possiblyUnhandledRejection, reason, this );
								}
							};

							Promise.prototype._setUnhandledRejectionIsNotified = function () {
								this._bitField = this._bitField | 524288;
							};

							Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
								this._bitField = this._bitField & (~524288);
							};

							Promise.prototype._isUnhandledRejectionNotified = function () {
								return (this._bitField & 524288) > 0;
							};

							Promise.prototype._setRejectionIsUnhandled = function () {
								this._bitField = this._bitField | 2097152;
							};

							Promise.prototype._unsetRejectionIsUnhandled = function () {
								this._bitField = this._bitField & (~2097152);
								if ( this._isUnhandledRejectionNotified() ) {
									this._unsetUnhandledRejectionIsNotified();
									this._notifyUnhandledRejectionIsHandled();
								}
							};

							Promise.prototype._isRejectionUnhandled = function () {
								return (this._bitField & 2097152) > 0;
							};

							Promise.prototype._setCarriedStackTrace = function ( capturedTrace ) {
								this._bitField = this._bitField | 1048576;
								this._fulfillmentHandler0 = capturedTrace;
							};

							Promise.prototype._isCarryingStackTrace = function () {
								return (this._bitField & 1048576) > 0;
							};

							Promise.prototype._getCarriedStackTrace = function () {
								return this._isCarryingStackTrace()
									? this._fulfillmentHandler0
									: undefined;
							};

							Promise.prototype._captureStackTrace = function () {
								if ( debugging ) {
									this._trace = new CapturedTrace( this._peekContext() );
								}
								return this;
							};

							Promise.prototype._attachExtraTrace = function ( error, ignoreSelf ) {
								if ( debugging && canAttachTrace( error ) ) {
									var trace = this._trace;
									if ( trace !== undefined ) {
										if ( ignoreSelf ) trace = trace._parent;
									}
									if ( trace !== undefined ) {
										trace.attachExtraTrace( error );
									} else if ( !error.__stackCleaned__ ) {
										var parsed = CapturedTrace.parseStackAndMessage( error );
										util.notEnumerableProp( error, "stack",
											parsed.message + "\n" + parsed.stack.join( "\n" ) );
										util.notEnumerableProp( error, "__stackCleaned__", true );
									}
								}
							};

							Promise.prototype._warn = function ( message ) {
								var warning = new Warning( message );
								var ctx = this._peekContext();
								if ( ctx ) {
									ctx.attachExtraTrace( warning );
								} else {
									var parsed = CapturedTrace.parseStackAndMessage( warning );
									warning.stack = parsed.message + "\n" + parsed.stack.join( "\n" );
								}
								CapturedTrace.formatAndLogError( warning, "" );
							};

							Promise.onPossiblyUnhandledRejection = function ( fn ) {
								var domain = getDomain();
								possiblyUnhandledRejection =
									typeof fn === "function" ? (domain === null ? fn : domain.bind( fn ))
										: undefined;
							};

							Promise.onUnhandledRejectionHandled = function ( fn ) {
								var domain = getDomain();
								unhandledRejectionHandled =
									typeof fn === "function" ? (domain === null ? fn : domain.bind( fn ))
										: undefined;
							};

							Promise.longStackTraces = function () {
								if ( async.haveItemsQueued() &&
									debugging === false
								) {
									throw new Error( "cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/DT1qyG\u000a" );
								}
								debugging = CapturedTrace.isSupported();
								if ( debugging ) {
									async.disableTrampolineIfNecessary();
								}
							};

							Promise.hasLongStackTraces = function () {
								return debugging && CapturedTrace.isSupported();
							};

							if ( !CapturedTrace.isSupported() ) {
								Promise.longStackTraces = function () {
								};
								debugging = false;
							}

							return function () {
								return debugging;
							};
						};

					}, { "./async.js": 2, "./errors.js": 13, "./util.js": 38 } ],
					11: [ function ( _dereq_, module, exports ) {
						"use strict";
						var util = _dereq_( "./util.js" );
						var isPrimitive = util.isPrimitive;

						module.exports = function ( Promise ) {
							var returner = function () {
								return this;
							};
							var thrower = function () {
								throw this;
							};
							var returnUndefined = function () {
							};
							var throwUndefined = function () {
								throw undefined;
							};

							var wrapper = function ( value, action ) {
								if ( action === 1 ) {
									return function () {
										throw value;
									};
								} else if ( action === 2 ) {
									return function () {
										return value;
									};
								}
							};


							Promise.prototype[ "return" ] =
								Promise.prototype.thenReturn = function ( value ) {
									if ( value === undefined ) return this.then( returnUndefined );

									if ( isPrimitive( value ) ) {
										return this._then(
											wrapper( value, 2 ),
											undefined,
											undefined,
											undefined,
											undefined
										);
									}
									return this._then( returner, undefined, undefined, value, undefined );
								};

							Promise.prototype[ "throw" ] =
								Promise.prototype.thenThrow = function ( reason ) {
									if ( reason === undefined ) return this.then( throwUndefined );

									if ( isPrimitive( reason ) ) {
										return this._then(
											wrapper( reason, 1 ),
											undefined,
											undefined,
											undefined,
											undefined
										);
									}
									return this._then( thrower, undefined, undefined, reason, undefined );
								};
						};

					}, { "./util.js": 38 } ],
					12: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL ) {
							var PromiseReduce = Promise.reduce;

							Promise.prototype.each = function ( fn ) {
								return PromiseReduce( this, fn, null, INTERNAL );
							};

							Promise.each = function ( promises, fn ) {
								return PromiseReduce( promises, fn, null, INTERNAL );
							};
						};

					}, {} ],
					13: [ function ( _dereq_, module, exports ) {
						"use strict";
						var es5 = _dereq_( "./es5.js" );
						var Objectfreeze = es5.freeze;
						var util = _dereq_( "./util.js" );
						var inherits = util.inherits;
						var notEnumerableProp = util.notEnumerableProp;

						function subError ( nameProperty, defaultMessage ) {
							function SubError ( message ) {
								if ( !(this instanceof SubError) ) return new SubError( message );
								notEnumerableProp( this, "message",
									typeof message === "string" ? message : defaultMessage );
								notEnumerableProp( this, "name", nameProperty );
								if ( Error.captureStackTrace ) {
									Error.captureStackTrace( this, this.constructor );
								} else {
									Error.call( this );
								}
							}

							inherits( SubError, Error );
							return SubError;
						}

						var _TypeError, _RangeError;
						var Warning = subError( "Warning", "warning" );
						var CancellationError = subError( "CancellationError", "cancellation error" );
						var TimeoutError = subError( "TimeoutError", "timeout error" );
						var AggregateError = subError( "AggregateError", "aggregate error" );
						try {
							_TypeError = TypeError;
							_RangeError = RangeError;
						} catch ( e ) {
							_TypeError = subError( "TypeError", "type error" );
							_RangeError = subError( "RangeError", "range error" );
						}

						var methods = ("join pop push shift unshift slice filter forEach some " +
						"every map indexOf lastIndexOf reduce reduceRight sort reverse").split( " " );

						for ( var i = 0; i < methods.length; ++i ) {
							if ( typeof Array.prototype[ methods[ i ] ] === "function" ) {
								AggregateError.prototype[ methods[ i ] ] = Array.prototype[ methods[ i ] ];
							}
						}

						es5.defineProperty( AggregateError.prototype, "length", {
							value: 0,
							configurable: false,
							writable: true,
							enumerable: true
						} );
						AggregateError.prototype[ "isOperational" ] = true;
						var level = 0;
						AggregateError.prototype.toString = function () {
							var indent = Array( level * 4 + 1 ).join( " " );
							var ret = "\n" + indent + "AggregateError of:" + "\n";
							level++;
							indent = Array( level * 4 + 1 ).join( " " );
							for ( var i = 0; i < this.length; ++i ) {
								var str = this[ i ] === this ? "[Circular AggregateError]" : this[ i ] + "";
								var lines = str.split( "\n" );
								for ( var j = 0; j < lines.length; ++j ) {
									lines[ j ] = indent + lines[ j ];
								}
								str = lines.join( "\n" );
								ret += str + "\n";
							}
							level--;
							return ret;
						};

						function OperationalError ( message ) {
							if ( !(this instanceof OperationalError) )
								return new OperationalError( message );
							notEnumerableProp( this, "name", "OperationalError" );
							notEnumerableProp( this, "message", message );
							this.cause = message;
							this[ "isOperational" ] = true;

							if ( message instanceof Error ) {
								notEnumerableProp( this, "message", message.message );
								notEnumerableProp( this, "stack", message.stack );
							} else if ( Error.captureStackTrace ) {
								Error.captureStackTrace( this, this.constructor );
							}

						}

						inherits( OperationalError, Error );

						var errorTypes = Error[ "__BluebirdErrorTypes__" ];
						if ( !errorTypes ) {
							errorTypes = Objectfreeze( {
								CancellationError: CancellationError,
								TimeoutError: TimeoutError,
								OperationalError: OperationalError,
								RejectionError: OperationalError,
								AggregateError: AggregateError
							} );
							notEnumerableProp( Error, "__BluebirdErrorTypes__", errorTypes );
						}

						module.exports = {
							Error: Error,
							TypeError: _TypeError,
							RangeError: _RangeError,
							CancellationError: errorTypes.CancellationError,
							OperationalError: errorTypes.OperationalError,
							TimeoutError: errorTypes.TimeoutError,
							AggregateError: errorTypes.AggregateError,
							Warning: Warning
						};

					}, { "./es5.js": 14, "./util.js": 38 } ],
					14: [ function ( _dereq_, module, exports ) {
						var isES5 = (function () {
							"use strict";
							return this === undefined;
						})();

						if ( isES5 ) {
							module.exports = {
								freeze: Object.freeze,
								defineProperty: Object.defineProperty,
								getDescriptor: Object.getOwnPropertyDescriptor,
								keys: Object.keys,
								names: Object.getOwnPropertyNames,
								getPrototypeOf: Object.getPrototypeOf,
								isArray: Array.isArray,
								isES5: isES5,
								propertyIsWritable: function ( obj, prop ) {
									var descriptor = Object.getOwnPropertyDescriptor( obj, prop );
									return !!(!descriptor || descriptor.writable || descriptor.set);
								}
							};
						} else {
							var has = {}.hasOwnProperty;
							var str = {}.toString;
							var proto = {}.constructor.prototype;

							var ObjectKeys = function ( o ) {
								var ret = [];
								for ( var key in o ) {
									if ( has.call( o, key ) ) {
										ret.push( key );
									}
								}
								return ret;
							};

							var ObjectGetDescriptor = function ( o, key ) {
								return { value: o[ key ] };
							};

							var ObjectDefineProperty = function ( o, key, desc ) {
								o[ key ] = desc.value;
								return o;
							};

							var ObjectFreeze = function ( obj ) {
								return obj;
							};

							var ObjectGetPrototypeOf = function ( obj ) {
								try {
									return Object( obj ).constructor.prototype;
								}
								catch ( e ) {
									return proto;
								}
							};

							var ArrayIsArray = function ( obj ) {
								try {
									return str.call( obj ) === "[object Array]";
								}
								catch ( e ) {
									return false;
								}
							};

							module.exports = {
								isArray: ArrayIsArray,
								keys: ObjectKeys,
								names: ObjectKeys,
								defineProperty: ObjectDefineProperty,
								getDescriptor: ObjectGetDescriptor,
								freeze: ObjectFreeze,
								getPrototypeOf: ObjectGetPrototypeOf,
								isES5: isES5,
								propertyIsWritable: function () {
									return true;
								}
							};
						}

					}, {} ],
					15: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL ) {
							var PromiseMap = Promise.map;

							Promise.prototype.filter = function ( fn, options ) {
								return PromiseMap( this, fn, options, INTERNAL );
							};

							Promise.filter = function ( promises, fn, options ) {
								return PromiseMap( promises, fn, options, INTERNAL );
							};
						};

					}, {} ],
					16: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, NEXT_FILTER, tryConvertToPromise ) {
							var util = _dereq_( "./util.js" );
							var isPrimitive = util.isPrimitive;
							var thrower = util.thrower;

							function returnThis () {
								return this;
							}

							function throwThis () {
								throw this;
							}

							function return$ ( r ) {
								return function () {
									return r;
								};
							}

							function throw$ ( r ) {
								return function () {
									throw r;
								};
							}

							function promisedFinally ( ret, reasonOrValue, isFulfilled ) {
								var then;
								if ( isPrimitive( reasonOrValue ) ) {
									then = isFulfilled ? return$( reasonOrValue ) : throw$( reasonOrValue );
								} else {
									then = isFulfilled ? returnThis : throwThis;
								}
								return ret._then( then, thrower, undefined, reasonOrValue, undefined );
							}

							function finallyHandler ( reasonOrValue ) {
								var promise = this.promise;
								var handler = this.handler;

								var ret = promise._isBound()
									? handler.call( promise._boundValue() )
									: handler();

								if ( ret !== undefined ) {
									var maybePromise = tryConvertToPromise( ret, promise );
									if ( maybePromise instanceof Promise ) {
										maybePromise = maybePromise._target();
										return promisedFinally( maybePromise, reasonOrValue,
											promise.isFulfilled() );
									}
								}

								if ( promise.isRejected() ) {
									NEXT_FILTER.e = reasonOrValue;
									return NEXT_FILTER;
								} else {
									return reasonOrValue;
								}
							}

							function tapHandler ( value ) {
								var promise = this.promise;
								var handler = this.handler;

								var ret = promise._isBound()
									? handler.call( promise._boundValue(), value )
									: handler( value );

								if ( ret !== undefined ) {
									var maybePromise = tryConvertToPromise( ret, promise );
									if ( maybePromise instanceof Promise ) {
										maybePromise = maybePromise._target();
										return promisedFinally( maybePromise, value, true );
									}
								}
								return value;
							}

							Promise.prototype._passThroughHandler = function ( handler, isFinally ) {
								if ( typeof handler !== "function" ) return this.then();

								var promiseAndHandler = {
									promise: this,
									handler: handler
								};

								return this._then(
									isFinally ? finallyHandler : tapHandler,
									isFinally ? finallyHandler : undefined, undefined,
									promiseAndHandler, undefined );
							};

							Promise.prototype.lastly =
								Promise.prototype[ "finally" ] = function ( handler ) {
									return this._passThroughHandler( handler, true );
								};

							Promise.prototype.tap = function ( handler ) {
								return this._passThroughHandler( handler, false );
							};
						};

					}, { "./util.js": 38 } ],
					17: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise,
													apiRejection,
													INTERNAL,
													tryConvertToPromise ) {
							var errors = _dereq_( "./errors.js" );
							var TypeError = errors.TypeError;
							var util = _dereq_( "./util.js" );
							var errorObj = util.errorObj;
							var tryCatch = util.tryCatch;
							var yieldHandlers = [];

							function promiseFromYieldHandler ( value, yieldHandlers, traceParent ) {
								for ( var i = 0; i < yieldHandlers.length; ++i ) {
									traceParent._pushContext();
									var result = tryCatch( yieldHandlers[ i ] )( value );
									traceParent._popContext();
									if ( result === errorObj ) {
										traceParent._pushContext();
										var ret = Promise.reject( errorObj.e );
										traceParent._popContext();
										return ret;
									}
									var maybePromise = tryConvertToPromise( result, traceParent );
									if ( maybePromise instanceof Promise ) return maybePromise;
								}
								return null;
							}

							function PromiseSpawn ( generatorFunction, receiver, yieldHandler, stack ) {
								var promise = this._promise = new Promise( INTERNAL );
								promise._captureStackTrace();
								this._stack = stack;
								this._generatorFunction = generatorFunction;
								this._receiver = receiver;
								this._generator = undefined;
								this._yieldHandlers = typeof yieldHandler === "function"
									? [ yieldHandler ].concat( yieldHandlers )
									: yieldHandlers;
							}

							PromiseSpawn.prototype.promise = function () {
								return this._promise;
							};

							PromiseSpawn.prototype._run = function () {
								this._generator = this._generatorFunction.call( this._receiver );
								this._receiver =
									this._generatorFunction = undefined;
								this._next( undefined );
							};

							PromiseSpawn.prototype._continue = function ( result ) {
								if ( result === errorObj ) {
									return this._promise._rejectCallback( result.e, false, true );
								}

								var value = result.value;
								if ( result.done === true ) {
									this._promise._resolveCallback( value );
								} else {
									var maybePromise = tryConvertToPromise( value, this._promise );
									if ( !(maybePromise instanceof Promise) ) {
										maybePromise =
											promiseFromYieldHandler( maybePromise,
												this._yieldHandlers,
												this._promise );
										if ( maybePromise === null ) {
											this._throw(
												new TypeError(
													"A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/4Y4pDk\u000a\u000a".replace( "%s", value ) +
													"From coroutine:\u000a" +
													this._stack.split( "\n" ).slice( 1, -7 ).join( "\n" )
												)
											);
											return;
										}
									}
									maybePromise._then(
										this._next,
										this._throw,
										undefined,
										this,
										null
									);
								}
							};

							PromiseSpawn.prototype._throw = function ( reason ) {
								this._promise._attachExtraTrace( reason );
								this._promise._pushContext();
								var result = tryCatch( this._generator[ "throw" ] )
									.call( this._generator, reason );
								this._promise._popContext();
								this._continue( result );
							};

							PromiseSpawn.prototype._next = function ( value ) {
								this._promise._pushContext();
								var result = tryCatch( this._generator.next ).call( this._generator, value );
								this._promise._popContext();
								this._continue( result );
							};

							Promise.coroutine = function ( generatorFunction, options ) {
								if ( typeof generatorFunction !== "function" ) {
									throw new TypeError( "generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a" );
								}
								var yieldHandler = Object( options ).yieldHandler;
								var PromiseSpawn$ = PromiseSpawn;
								var stack = new Error().stack;
								return function () {
									var generator = generatorFunction.apply( this, arguments );
									var spawn = new PromiseSpawn$( undefined, undefined, yieldHandler,
										stack );
									spawn._generator = generator;
									spawn._next( undefined );
									return spawn.promise();
								};
							};

							Promise.coroutine.addYieldHandler = function ( fn ) {
								if ( typeof fn !== "function" ) throw new TypeError( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								yieldHandlers.push( fn );
							};

							Promise.spawn = function ( generatorFunction ) {
								if ( typeof generatorFunction !== "function" ) {
									return apiRejection( "generatorFunction must be a function\u000a\u000a    See http://goo.gl/6Vqhm0\u000a" );
								}
								var spawn = new PromiseSpawn( generatorFunction, this );
								var ret = spawn.promise();
								spawn._run( Promise.spawn );
								return ret;
							};
						};

					}, { "./errors.js": 13, "./util.js": 38 } ],
					18: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports =
							function ( Promise, PromiseArray, tryConvertToPromise, INTERNAL ) {
								var util = _dereq_( "./util.js" );
								var canEvaluate = util.canEvaluate;
								var tryCatch = util.tryCatch;
								var errorObj = util.errorObj;
								var reject;

								if ( false ) {
									if ( canEvaluate ) {
										var thenCallback = function ( i ) {
											return new Function( "value", "holder", "                             \n\
	            'use strict';                                                    \n\
	            holder.pIndex = value;                                           \n\
	            holder.checkFulfillment(this);                                   \n\
	            ".replace( /Index/g, i ) );
										};

										var caller = function ( count ) {
											var values = [];
											for ( var i = 1; i <= count; ++i ) values.push( "holder.p" + i );
											return new Function( "holder", "                                      \n\
	            'use strict';                                                    \n\
	            var callback = holder.fn;                                        \n\
	            return callback(values);                                         \n\
	            ".replace( /values/g, values.join( ", " ) ) );
										};
										var thenCallbacks = [];
										var callers = [ undefined ];
										for ( var i = 1; i <= 5; ++i ) {
											thenCallbacks.push( thenCallback( i ) );
											callers.push( caller( i ) );
										}

										var Holder = function ( total, fn ) {
											this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
											this.fn = fn;
											this.total = total;
											this.now = 0;
										};

										Holder.prototype.callers = callers;
										Holder.prototype.checkFulfillment = function ( promise ) {
											var now = this.now;
											now++;
											var total = this.total;
											if ( now >= total ) {
												var handler = this.callers[ total ];
												promise._pushContext();
												var ret = tryCatch( handler )( this );
												promise._popContext();
												if ( ret === errorObj ) {
													promise._rejectCallback( ret.e, false, true );
												} else {
													promise._resolveCallback( ret );
												}
											} else {
												this.now = now;
											}
										};

										var reject = function ( reason ) {
											this._reject( reason );
										};
									}
								}

								Promise.join = function () {
									var last = arguments.length - 1;
									var fn;
									if ( last > 0 && typeof arguments[ last ] === "function" ) {
										fn = arguments[ last ];
										if ( false ) {
											if ( last < 6 && canEvaluate ) {
												var ret = new Promise( INTERNAL );
												ret._captureStackTrace();
												var holder = new Holder( last, fn );
												var callbacks = thenCallbacks;
												for ( var i = 0; i < last; ++i ) {
													var maybePromise = tryConvertToPromise( arguments[ i ], ret );
													if ( maybePromise instanceof Promise ) {
														maybePromise = maybePromise._target();
														if ( maybePromise._isPending() ) {
															maybePromise._then( callbacks[ i ], reject,
																undefined, ret, holder );
														} else if ( maybePromise._isFulfilled() ) {
															callbacks[ i ].call( ret,
																maybePromise._value(), holder );
														} else {
															ret._reject( maybePromise._reason() );
														}
													} else {
														callbacks[ i ].call( ret, maybePromise, holder );
													}
												}
												return ret;
											}
										}
									}
									var $_len = arguments.length;
									var args = new Array( $_len );
									for ( var $_i = 0; $_i < $_len; ++$_i ) {
										args[ $_i ] = arguments[ $_i ];
									}
									if ( fn ) args.pop();
									var ret = new PromiseArray( args ).promise();
									return fn !== undefined ? ret.spread( fn ) : ret;
								};

							};

					}, { "./util.js": 38 } ],
					19: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise,
													PromiseArray,
													apiRejection,
													tryConvertToPromise,
													INTERNAL ) {
							var getDomain = Promise._getDomain;
							var async = _dereq_( "./async.js" );
							var util = _dereq_( "./util.js" );
							var tryCatch = util.tryCatch;
							var errorObj = util.errorObj;
							var PENDING = {};
							var EMPTY_ARRAY = [];

							function MappingPromiseArray ( promises, fn, limit, _filter ) {
								this.constructor$( promises );
								this._promise._captureStackTrace();
								var domain = getDomain();
								this._callback = domain === null ? fn : domain.bind( fn );
								this._preservedValues = _filter === INTERNAL
									? new Array( this.length() )
									: null;
								this._limit = limit;
								this._inFlight = 0;
								this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
								async.invoke( init, this, undefined );
							}

							util.inherits( MappingPromiseArray, PromiseArray );
							function init () {
								this._init$( undefined, -2 );
							}

							MappingPromiseArray.prototype._init = function () {
							};

							MappingPromiseArray.prototype._promiseFulfilled = function ( value, index ) {
								var values = this._values;
								var length = this.length();
								var preservedValues = this._preservedValues;
								var limit = this._limit;
								if ( values[ index ] === PENDING ) {
									values[ index ] = value;
									if ( limit >= 1 ) {
										this._inFlight--;
										this._drainQueue();
										if ( this._isResolved() ) return;
									}
								} else {
									if ( limit >= 1 && this._inFlight >= limit ) {
										values[ index ] = value;
										this._queue.push( index );
										return;
									}
									if ( preservedValues !== null ) preservedValues[ index ] = value;

									var callback = this._callback;
									var receiver = this._promise._boundValue();
									this._promise._pushContext();
									var ret = tryCatch( callback ).call( receiver, value, index, length );
									this._promise._popContext();
									if ( ret === errorObj ) return this._reject( ret.e );

									var maybePromise = tryConvertToPromise( ret, this._promise );
									if ( maybePromise instanceof Promise ) {
										maybePromise = maybePromise._target();
										if ( maybePromise._isPending() ) {
											if ( limit >= 1 ) this._inFlight++;
											values[ index ] = PENDING;
											return maybePromise._proxyPromiseArray( this, index );
										} else if ( maybePromise._isFulfilled() ) {
											ret = maybePromise._value();
										} else {
											return this._reject( maybePromise._reason() );
										}
									}
									values[ index ] = ret;
								}
								var totalResolved = ++this._totalResolved;
								if ( totalResolved >= length ) {
									if ( preservedValues !== null ) {
										this._filter( values, preservedValues );
									} else {
										this._resolve( values );
									}

								}
							};

							MappingPromiseArray.prototype._drainQueue = function () {
								var queue = this._queue;
								var limit = this._limit;
								var values = this._values;
								while ( queue.length > 0 && this._inFlight < limit ) {
									if ( this._isResolved() ) return;
									var index = queue.pop();
									this._promiseFulfilled( values[ index ], index );
								}
							};

							MappingPromiseArray.prototype._filter = function ( booleans, values ) {
								var len = values.length;
								var ret = new Array( len );
								var j = 0;
								for ( var i = 0; i < len; ++i ) {
									if ( booleans[ i ] ) ret[ j++ ] = values[ i ];
								}
								ret.length = j;
								this._resolve( ret );
							};

							MappingPromiseArray.prototype.preservedValues = function () {
								return this._preservedValues;
							};

							function map ( promises, fn, options, _filter ) {
								var limit = typeof options === "object" && options !== null
									? options.concurrency
									: 0;
								limit = typeof limit === "number" &&
								isFinite( limit ) && limit >= 1 ? limit : 0;
								return new MappingPromiseArray( promises, fn, limit, _filter );
							}

							Promise.prototype.map = function ( fn, options ) {
								if ( typeof fn !== "function" ) return apiRejection( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );

								return map( this, fn, options, null ).promise();
							};

							Promise.map = function ( promises, fn, options, _filter ) {
								if ( typeof fn !== "function" ) return apiRejection( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								return map( promises, fn, options, _filter ).promise();
							};


						};

					}, { "./async.js": 2, "./util.js": 38 } ],
					20: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports =
							function ( Promise, INTERNAL, tryConvertToPromise, apiRejection ) {
								var util = _dereq_( "./util.js" );
								var tryCatch = util.tryCatch;

								Promise.method = function ( fn ) {
									if ( typeof fn !== "function" ) {
										throw new Promise.TypeError( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
									}
									return function () {
										var ret = new Promise( INTERNAL );
										ret._captureStackTrace();
										ret._pushContext();
										var value = tryCatch( fn ).apply( this, arguments );
										ret._popContext();
										ret._resolveFromSyncValue( value );
										return ret;
									};
								};

								Promise.attempt = Promise[ "try" ] = function ( fn, args, ctx ) {
									if ( typeof fn !== "function" ) {
										return apiRejection( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
									}
									var ret = new Promise( INTERNAL );
									ret._captureStackTrace();
									ret._pushContext();
									var value = util.isArray( args )
										? tryCatch( fn ).apply( ctx, args )
										: tryCatch( fn ).call( ctx, args );
									ret._popContext();
									ret._resolveFromSyncValue( value );
									return ret;
								};

								Promise.prototype._resolveFromSyncValue = function ( value ) {
									if ( value === util.errorObj ) {
										this._rejectCallback( value.e, false, true );
									} else {
										this._resolveCallback( value, true );
									}
								};
							};

					}, { "./util.js": 38 } ],
					21: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise ) {
							var util = _dereq_( "./util.js" );
							var async = _dereq_( "./async.js" );
							var tryCatch = util.tryCatch;
							var errorObj = util.errorObj;

							function spreadAdapter ( val, nodeback ) {
								var promise = this;
								if ( !util.isArray( val ) ) return successAdapter.call( promise, val, nodeback );
								var ret =
									tryCatch( nodeback ).apply( promise._boundValue(), [ null ].concat( val ) );
								if ( ret === errorObj ) {
									async.throwLater( ret.e );
								}
							}

							function successAdapter ( val, nodeback ) {
								var promise = this;
								var receiver = promise._boundValue();
								var ret = val === undefined
									? tryCatch( nodeback ).call( receiver, null )
									: tryCatch( nodeback ).call( receiver, null, val );
								if ( ret === errorObj ) {
									async.throwLater( ret.e );
								}
							}

							function errorAdapter ( reason, nodeback ) {
								var promise = this;
								if ( !reason ) {
									var target = promise._target();
									var newReason = target._getCarriedStackTrace();
									newReason.cause = reason;
									reason = newReason;
								}
								var ret = tryCatch( nodeback ).call( promise._boundValue(), reason );
								if ( ret === errorObj ) {
									async.throwLater( ret.e );
								}
							}

							Promise.prototype.asCallback =
								Promise.prototype.nodeify = function ( nodeback, options ) {
									if ( typeof nodeback == "function" ) {
										var adapter = successAdapter;
										if ( options !== undefined && Object( options ).spread ) {
											adapter = spreadAdapter;
										}
										this._then(
											adapter,
											errorAdapter,
											undefined,
											this,
											nodeback
										);
									}
									return this;
								};
						};

					}, { "./async.js": 2, "./util.js": 38 } ],
					22: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, PromiseArray ) {
							var util = _dereq_( "./util.js" );
							var async = _dereq_( "./async.js" );
							var tryCatch = util.tryCatch;
							var errorObj = util.errorObj;

							Promise.prototype.progressed = function ( handler ) {
								return this._then( undefined, undefined, handler, undefined, undefined );
							};

							Promise.prototype._progress = function ( progressValue ) {
								if ( this._isFollowingOrFulfilledOrRejected() ) return;
								this._target()._progressUnchecked( progressValue );

							};

							Promise.prototype._progressHandlerAt = function ( index ) {
								return index === 0
									? this._progressHandler0
									: this[ (index << 2) + index - 5 + 2 ];
							};

							Promise.prototype._doProgressWith = function ( progression ) {
								var progressValue = progression.value;
								var handler = progression.handler;
								var promise = progression.promise;
								var receiver = progression.receiver;

								var ret = tryCatch( handler ).call( receiver, progressValue );
								if ( ret === errorObj ) {
									if ( ret.e != null &&
										ret.e.name !== "StopProgressPropagation" ) {
										var trace = util.canAttachTrace( ret.e )
											? ret.e : new Error( util.toString( ret.e ) );
										promise._attachExtraTrace( trace );
										promise._progress( ret.e );
									}
								} else if ( ret instanceof Promise ) {
									ret._then( promise._progress, null, null, promise, undefined );
								} else {
									promise._progress( ret );
								}
							};


							Promise.prototype._progressUnchecked = function ( progressValue ) {
								var len = this._length();
								var progress = this._progress;
								for ( var i = 0; i < len; i++ ) {
									var handler = this._progressHandlerAt( i );
									var promise = this._promiseAt( i );
									if ( !(promise instanceof Promise) ) {
										var receiver = this._receiverAt( i );
										if ( typeof handler === "function" ) {
											handler.call( receiver, progressValue, promise );
										} else if ( receiver instanceof PromiseArray && !receiver._isResolved() ) {
											receiver._promiseProgressed( progressValue, promise );
										}
										continue;
									}

									if ( typeof handler === "function" ) {
										async.invoke( this._doProgressWith, this, {
											handler: handler,
											promise: promise,
											receiver: this._receiverAt( i ),
											value: progressValue
										} );
									} else {
										async.invoke( progress, promise, progressValue );
									}
								}
							};
						};

					}, { "./async.js": 2, "./util.js": 38 } ],
					23: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function () {
							var makeSelfResolutionError = function () {
								return new TypeError( "circular promise resolution chain\u000a\u000a    See http://goo.gl/LhFpo0\u000a" );
							};
							var reflect = function () {
								return new Promise.PromiseInspection( this._target() );
							};
							var apiRejection = function ( msg ) {
								return Promise.reject( new TypeError( msg ) );
							};

							var util = _dereq_( "./util.js" );

							var getDomain;
							if ( util.isNode ) {
								getDomain = function () {
									var ret = process.domain;
									if ( ret === undefined ) ret = null;
									return ret;
								};
							} else {
								getDomain = function () {
									return null;
								};
							}
							util.notEnumerableProp( Promise, "_getDomain", getDomain );

							var async = _dereq_( "./async.js" );
							var errors = _dereq_( "./errors.js" );
							var TypeError = Promise.TypeError = errors.TypeError;
							Promise.RangeError = errors.RangeError;
							Promise.CancellationError = errors.CancellationError;
							Promise.TimeoutError = errors.TimeoutError;
							Promise.OperationalError = errors.OperationalError;
							Promise.RejectionError = errors.OperationalError;
							Promise.AggregateError = errors.AggregateError;
							var INTERNAL = function () {
							};
							var APPLY = {};
							var NEXT_FILTER = { e: null };
							var tryConvertToPromise = _dereq_( "./thenables.js" )( Promise, INTERNAL );
							var PromiseArray =
								_dereq_( "./promise_array.js" )( Promise, INTERNAL,
									tryConvertToPromise, apiRejection );
							var CapturedTrace = _dereq_( "./captured_trace.js" )();
							var isDebugging = _dereq_( "./debuggability.js" )( Promise, CapturedTrace );
							/*jshint unused:false*/
							var createContext =
								_dereq_( "./context.js" )( Promise, CapturedTrace, isDebugging );
							var CatchFilter = _dereq_( "./catch_filter.js" )( NEXT_FILTER );
							var PromiseResolver = _dereq_( "./promise_resolver.js" );
							var nodebackForPromise = PromiseResolver._nodebackForPromise;
							var errorObj = util.errorObj;
							var tryCatch = util.tryCatch;

							function Promise ( resolver ) {
								if ( typeof resolver !== "function" ) {
									throw new TypeError( "the promise constructor requires a resolver function\u000a\u000a    See http://goo.gl/EC22Yn\u000a" );
								}
								if ( this.constructor !== Promise ) {
									throw new TypeError( "the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/KsIlge\u000a" );
								}
								this._bitField = 0;
								this._fulfillmentHandler0 = undefined;
								this._rejectionHandler0 = undefined;
								this._progressHandler0 = undefined;
								this._promise0 = undefined;
								this._receiver0 = undefined;
								this._settledValue = undefined;
								if ( resolver !== INTERNAL ) this._resolveFromResolver( resolver );
							}

							Promise.prototype.toString = function () {
								return "[object Promise]";
							};

							Promise.prototype.caught = Promise.prototype[ "catch" ] = function ( fn ) {
								var len = arguments.length;
								if ( len > 1 ) {
									var catchInstances = new Array( len - 1 ),
										j = 0, i;
									for ( i = 0; i < len - 1; ++i ) {
										var item = arguments[ i ];
										if ( typeof item === "function" ) {
											catchInstances[ j++ ] = item;
										} else {
											return Promise.reject(
												new TypeError( "Catch filter must inherit from Error or be a simple predicate function\u000a\u000a    See http://goo.gl/o84o68\u000a" ) );
										}
									}
									catchInstances.length = j;
									fn = arguments[ i ];
									var catchFilter = new CatchFilter( catchInstances, fn, this );
									return this._then( undefined, catchFilter.doFilter, undefined,
										catchFilter, undefined );
								}
								return this._then( undefined, fn, undefined, undefined, undefined );
							};

							Promise.prototype.reflect = function () {
								return this._then( reflect, reflect, undefined, this, undefined );
							};

							Promise.prototype.then = function ( didFulfill, didReject, didProgress ) {
								if ( isDebugging() && arguments.length > 0 &&
									typeof didFulfill !== "function" &&
									typeof didReject !== "function" ) {
									var msg = ".then() only accepts functions but was passed: " +
										util.classString( didFulfill );
									if ( arguments.length > 1 ) {
										msg += ", " + util.classString( didReject );
									}
									this._warn( msg );
								}
								return this._then( didFulfill, didReject, didProgress,
									undefined, undefined );
							};

							Promise.prototype.done = function ( didFulfill, didReject, didProgress ) {
								var promise = this._then( didFulfill, didReject, didProgress,
									undefined, undefined );
								promise._setIsFinal();
							};

							Promise.prototype.spread = function ( didFulfill, didReject ) {
								return this.all()._then( didFulfill, didReject, undefined, APPLY, undefined );
							};

							Promise.prototype.isCancellable = function () {
								return !this.isResolved() &&
									this._cancellable();
							};

							Promise.prototype.toJSON = function () {
								var ret = {
									isFulfilled: false,
									isRejected: false,
									fulfillmentValue: undefined,
									rejectionReason: undefined
								};
								if ( this.isFulfilled() ) {
									ret.fulfillmentValue = this.value();
									ret.isFulfilled = true;
								} else if ( this.isRejected() ) {
									ret.rejectionReason = this.reason();
									ret.isRejected = true;
								}
								return ret;
							};

							Promise.prototype.all = function () {
								return new PromiseArray( this ).promise();
							};

							Promise.prototype.error = function ( fn ) {
								return this.caught( util.originatesFromRejection, fn );
							};

							Promise.is = function ( val ) {
								return val instanceof Promise;
							};

							Promise.fromNode = function ( fn ) {
								var ret = new Promise( INTERNAL );
								var result = tryCatch( fn )( nodebackForPromise( ret ) );
								if ( result === errorObj ) {
									ret._rejectCallback( result.e, true, true );
								}
								return ret;
							};

							Promise.all = function ( promises ) {
								return new PromiseArray( promises ).promise();
							};

							Promise.defer = Promise.pending = function () {
								var promise = new Promise( INTERNAL );
								return new PromiseResolver( promise );
							};

							Promise.cast = function ( obj ) {
								var ret = tryConvertToPromise( obj );
								if ( !(ret instanceof Promise) ) {
									var val = ret;
									ret = new Promise( INTERNAL );
									ret._fulfillUnchecked( val );
								}
								return ret;
							};

							Promise.resolve = Promise.fulfilled = Promise.cast;

							Promise.reject = Promise.rejected = function ( reason ) {
								var ret = new Promise( INTERNAL );
								ret._captureStackTrace();
								ret._rejectCallback( reason, true );
								return ret;
							};

							Promise.setScheduler = function ( fn ) {
								if ( typeof fn !== "function" ) throw new TypeError( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								var prev = async._schedule;
								async._schedule = fn;
								return prev;
							};

							Promise.prototype._then = function ( didFulfill,
																 didReject,
																 didProgress,
																 receiver,
																 internalData ) {
								var haveInternalData = internalData !== undefined;
								var ret = haveInternalData ? internalData : new Promise( INTERNAL );

								if ( !haveInternalData ) {
									ret._propagateFrom( this, 4 | 1 );
									ret._captureStackTrace();
								}

								var target = this._target();
								if ( target !== this ) {
									if ( receiver === undefined ) receiver = this._boundTo;
									if ( !haveInternalData ) ret._setIsMigrated();
								}

								var callbackIndex = target._addCallbacks( didFulfill,
									didReject,
									didProgress,
									ret,
									receiver,
									getDomain() );

								if ( target._isResolved() && !target._isSettlePromisesQueued() ) {
									async.invoke(
										target._settlePromiseAtPostResolution, target, callbackIndex );
								}

								return ret;
							};

							Promise.prototype._settlePromiseAtPostResolution = function ( index ) {
								if ( this._isRejectionUnhandled() ) this._unsetRejectionIsUnhandled();
								this._settlePromiseAt( index );
							};

							Promise.prototype._length = function () {
								return this._bitField & 131071;
							};

							Promise.prototype._isFollowingOrFulfilledOrRejected = function () {
								return (this._bitField & 939524096) > 0;
							};

							Promise.prototype._isFollowing = function () {
								return (this._bitField & 536870912) === 536870912;
							};

							Promise.prototype._setLength = function ( len ) {
								this._bitField = (this._bitField & -131072) |
									(len & 131071);
							};

							Promise.prototype._setFulfilled = function () {
								this._bitField = this._bitField | 268435456;
							};

							Promise.prototype._setRejected = function () {
								this._bitField = this._bitField | 134217728;
							};

							Promise.prototype._setFollowing = function () {
								this._bitField = this._bitField | 536870912;
							};

							Promise.prototype._setIsFinal = function () {
								this._bitField = this._bitField | 33554432;
							};

							Promise.prototype._isFinal = function () {
								return (this._bitField & 33554432) > 0;
							};

							Promise.prototype._cancellable = function () {
								return (this._bitField & 67108864) > 0;
							};

							Promise.prototype._setCancellable = function () {
								this._bitField = this._bitField | 67108864;
							};

							Promise.prototype._unsetCancellable = function () {
								this._bitField = this._bitField & (~67108864);
							};

							Promise.prototype._setIsMigrated = function () {
								this._bitField = this._bitField | 4194304;
							};

							Promise.prototype._unsetIsMigrated = function () {
								this._bitField = this._bitField & (~4194304);
							};

							Promise.prototype._isMigrated = function () {
								return (this._bitField & 4194304) > 0;
							};

							Promise.prototype._receiverAt = function ( index ) {
								var ret = index === 0
									? this._receiver0
									: this[
								index * 5 - 5 + 4 ];
								if ( ret === undefined && this._isBound() ) {
									return this._boundValue();
								}
								return ret;
							};

							Promise.prototype._promiseAt = function ( index ) {
								return index === 0
									? this._promise0
									: this[ index * 5 - 5 + 3 ];
							};

							Promise.prototype._fulfillmentHandlerAt = function ( index ) {
								return index === 0
									? this._fulfillmentHandler0
									: this[ index * 5 - 5 + 0 ];
							};

							Promise.prototype._rejectionHandlerAt = function ( index ) {
								return index === 0
									? this._rejectionHandler0
									: this[ index * 5 - 5 + 1 ];
							};

							Promise.prototype._boundValue = function () {
								var ret = this._boundTo;
								if ( ret !== undefined ) {
									if ( ret instanceof Promise ) {
										if ( ret.isFulfilled() ) {
											return ret.value();
										} else {
											return undefined;
										}
									}
								}
								return ret;
							};

							Promise.prototype._migrateCallbacks = function ( follower, index ) {
								var fulfill = follower._fulfillmentHandlerAt( index );
								var reject = follower._rejectionHandlerAt( index );
								var progress = follower._progressHandlerAt( index );
								var promise = follower._promiseAt( index );
								var receiver = follower._receiverAt( index );
								if ( promise instanceof Promise ) promise._setIsMigrated();
								this._addCallbacks( fulfill, reject, progress, promise, receiver, null );
							};

							Promise.prototype._addCallbacks = function ( fulfill,
																		 reject,
																		 progress,
																		 promise,
																		 receiver,
																		 domain ) {
								var index = this._length();

								if ( index >= 131071 - 5 ) {
									index = 0;
									this._setLength( 0 );
								}

								if ( index === 0 ) {
									this._promise0 = promise;
									if ( receiver !== undefined ) this._receiver0 = receiver;
									if ( typeof fulfill === "function" && !this._isCarryingStackTrace() ) {
										this._fulfillmentHandler0 =
											domain === null ? fulfill : domain.bind( fulfill );
									}
									if ( typeof reject === "function" ) {
										this._rejectionHandler0 =
											domain === null ? reject : domain.bind( reject );
									}
									if ( typeof progress === "function" ) {
										this._progressHandler0 =
											domain === null ? progress : domain.bind( progress );
									}
								} else {
									var base = index * 5 - 5;
									this[ base + 3 ] = promise;
									this[ base + 4 ] = receiver;
									if ( typeof fulfill === "function" ) {
										this[ base + 0 ] =
											domain === null ? fulfill : domain.bind( fulfill );
									}
									if ( typeof reject === "function" ) {
										this[ base + 1 ] =
											domain === null ? reject : domain.bind( reject );
									}
									if ( typeof progress === "function" ) {
										this[ base + 2 ] =
											domain === null ? progress : domain.bind( progress );
									}
								}
								this._setLength( index + 1 );
								return index;
							};

							Promise.prototype._setProxyHandlers = function ( receiver, promiseSlotValue ) {
								var index = this._length();

								if ( index >= 131071 - 5 ) {
									index = 0;
									this._setLength( 0 );
								}
								if ( index === 0 ) {
									this._promise0 = promiseSlotValue;
									this._receiver0 = receiver;
								} else {
									var base = index * 5 - 5;
									this[ base + 3 ] = promiseSlotValue;
									this[ base + 4 ] = receiver;
								}
								this._setLength( index + 1 );
							};

							Promise.prototype._proxyPromiseArray = function ( promiseArray, index ) {
								this._setProxyHandlers( promiseArray, index );
							};

							Promise.prototype._resolveCallback = function ( value, shouldBind ) {
								if ( this._isFollowingOrFulfilledOrRejected() ) return;
								if ( value === this )
									return this._rejectCallback( makeSelfResolutionError(), false, true );
								var maybePromise = tryConvertToPromise( value, this );
								if ( !(maybePromise instanceof Promise) ) return this._fulfill( value );

								var propagationFlags = 1 | (shouldBind ? 4 : 0);
								this._propagateFrom( maybePromise, propagationFlags );
								var promise = maybePromise._target();
								if ( promise._isPending() ) {
									var len = this._length();
									for ( var i = 0; i < len; ++i ) {
										promise._migrateCallbacks( this, i );
									}
									this._setFollowing();
									this._setLength( 0 );
									this._setFollowee( promise );
								} else if ( promise._isFulfilled() ) {
									this._fulfillUnchecked( promise._value() );
								} else {
									this._rejectUnchecked( promise._reason(),
										promise._getCarriedStackTrace() );
								}
							};

							Promise.prototype._rejectCallback =
								function ( reason, synchronous, shouldNotMarkOriginatingFromRejection ) {
									if ( !shouldNotMarkOriginatingFromRejection ) {
										util.markAsOriginatingFromRejection( reason );
									}
									var trace = util.ensureErrorObject( reason );
									var hasStack = trace === reason;
									this._attachExtraTrace( trace, synchronous ? hasStack : false );
									this._reject( reason, hasStack ? undefined : trace );
								};

							Promise.prototype._resolveFromResolver = function ( resolver ) {
								var promise = this;
								this._captureStackTrace();
								this._pushContext();
								var synchronous = true;
								var r = tryCatch( resolver )( function ( value ) {
									if ( promise === null ) return;
									promise._resolveCallback( value );
									promise = null;
								}, function ( reason ) {
									if ( promise === null ) return;
									promise._rejectCallback( reason, synchronous );
									promise = null;
								} );
								synchronous = false;
								this._popContext();

								if ( r !== undefined && r === errorObj && promise !== null ) {
									promise._rejectCallback( r.e, true, true );
									promise = null;
								}
							};

							Promise.prototype._settlePromiseFromHandler = function ( handler, receiver, value, promise ) {
								if ( promise._isRejected() ) return;
								promise._pushContext();
								var x;
								if ( receiver === APPLY && !this._isRejected() ) {
									x = tryCatch( handler ).apply( this._boundValue(), value );
								} else {
									x = tryCatch( handler ).call( receiver, value );
								}
								promise._popContext();

								if ( x === errorObj || x === promise || x === NEXT_FILTER ) {
									var err = x === promise ? makeSelfResolutionError() : x.e;
									promise._rejectCallback( err, false, true );
								} else {
									promise._resolveCallback( x );
								}
							};

							Promise.prototype._target = function () {
								var ret = this;
								while ( ret._isFollowing() ) ret = ret._followee();
								return ret;
							};

							Promise.prototype._followee = function () {
								return this._rejectionHandler0;
							};

							Promise.prototype._setFollowee = function ( promise ) {
								this._rejectionHandler0 = promise;
							};

							Promise.prototype._cleanValues = function () {
								if ( this._cancellable() ) {
									this._cancellationParent = undefined;
								}
							};

							Promise.prototype._propagateFrom = function ( parent, flags ) {
								if ( (flags & 1) > 0 && parent._cancellable() ) {
									this._setCancellable();
									this._cancellationParent = parent;
								}
								if ( (flags & 4) > 0 && parent._isBound() ) {
									this._setBoundTo( parent._boundTo );
								}
							};

							Promise.prototype._fulfill = function ( value ) {
								if ( this._isFollowingOrFulfilledOrRejected() ) return;
								this._fulfillUnchecked( value );
							};

							Promise.prototype._reject = function ( reason, carriedStackTrace ) {
								if ( this._isFollowingOrFulfilledOrRejected() ) return;
								this._rejectUnchecked( reason, carriedStackTrace );
							};

							Promise.prototype._settlePromiseAt = function ( index ) {
								var promise = this._promiseAt( index );
								var isPromise = promise instanceof Promise;

								if ( isPromise && promise._isMigrated() ) {
									promise._unsetIsMigrated();
									return async.invoke( this._settlePromiseAt, this, index );
								}
								var handler = this._isFulfilled()
									? this._fulfillmentHandlerAt( index )
									: this._rejectionHandlerAt( index );

								var carriedStackTrace =
									this._isCarryingStackTrace() ? this._getCarriedStackTrace() : undefined;
								var value = this._settledValue;
								var receiver = this._receiverAt( index );
								this._clearCallbackDataAtIndex( index );

								if ( typeof handler === "function" ) {
									if ( !isPromise ) {
										handler.call( receiver, value, promise );
									} else {
										this._settlePromiseFromHandler( handler, receiver, value, promise );
									}
								} else if ( receiver instanceof PromiseArray ) {
									if ( !receiver._isResolved() ) {
										if ( this._isFulfilled() ) {
											receiver._promiseFulfilled( value, promise );
										}
										else {
											receiver._promiseRejected( value, promise );
										}
									}
								} else if ( isPromise ) {
									if ( this._isFulfilled() ) {
										promise._fulfill( value );
									} else {
										promise._reject( value, carriedStackTrace );
									}
								}

								if ( index >= 4 && (index & 31) === 4 )
									async.invokeLater( this._setLength, this, 0 );
							};

							Promise.prototype._clearCallbackDataAtIndex = function ( index ) {
								if ( index === 0 ) {
									if ( !this._isCarryingStackTrace() ) {
										this._fulfillmentHandler0 = undefined;
									}
									this._rejectionHandler0 =
										this._progressHandler0 =
											this._receiver0 =
												this._promise0 = undefined;
								} else {
									var base = index * 5 - 5;
									this[ base + 3 ] =
										this[ base + 4 ] =
											this[ base + 0 ] =
												this[ base + 1 ] =
													this[ base + 2 ] = undefined;
								}
							};

							Promise.prototype._isSettlePromisesQueued = function () {
								return (this._bitField & -1073741824) === -1073741824;
							};

							Promise.prototype._setSettlePromisesQueued = function () {
								this._bitField = this._bitField | -1073741824;
							};

							Promise.prototype._unsetSettlePromisesQueued = function () {
								this._bitField = this._bitField & (~-1073741824);
							};

							Promise.prototype._queueSettlePromises = function () {
								async.settlePromises( this );
								this._setSettlePromisesQueued();
							};

							Promise.prototype._fulfillUnchecked = function ( value ) {
								if ( value === this ) {
									var err = makeSelfResolutionError();
									this._attachExtraTrace( err );
									return this._rejectUnchecked( err, undefined );
								}
								this._setFulfilled();
								this._settledValue = value;
								this._cleanValues();

								if ( this._length() > 0 ) {
									this._queueSettlePromises();
								}
							};

							Promise.prototype._rejectUncheckedCheckError = function ( reason ) {
								var trace = util.ensureErrorObject( reason );
								this._rejectUnchecked( reason, trace === reason ? undefined : trace );
							};

							Promise.prototype._rejectUnchecked = function ( reason, trace ) {
								if ( reason === this ) {
									var err = makeSelfResolutionError();
									this._attachExtraTrace( err );
									return this._rejectUnchecked( err );
								}
								this._setRejected();
								this._settledValue = reason;
								this._cleanValues();

								if ( this._isFinal() ) {
									async.throwLater( function ( e ) {
										if ( "stack" in e ) {
											async.invokeFirst(
												CapturedTrace.unhandledRejection, undefined, e );
										}
										throw e;
									}, trace === undefined ? reason : trace );
									return;
								}

								if ( trace !== undefined && trace !== reason ) {
									this._setCarriedStackTrace( trace );
								}

								if ( this._length() > 0 ) {
									this._queueSettlePromises();
								} else {
									this._ensurePossibleRejectionHandled();
								}
							};

							Promise.prototype._settlePromises = function () {
								this._unsetSettlePromisesQueued();
								var len = this._length();
								for ( var i = 0; i < len; i++ ) {
									this._settlePromiseAt( i );
								}
							};

							util.notEnumerableProp( Promise,
								"_makeSelfResolutionError",
								makeSelfResolutionError );

							_dereq_( "./progress.js" )( Promise, PromiseArray );
							_dereq_( "./method.js" )( Promise, INTERNAL, tryConvertToPromise, apiRejection );
							_dereq_( "./bind.js" )( Promise, INTERNAL, tryConvertToPromise );
							_dereq_( "./finally.js" )( Promise, NEXT_FILTER, tryConvertToPromise );
							_dereq_( "./direct_resolve.js" )( Promise );
							_dereq_( "./synchronous_inspection.js" )( Promise );
							_dereq_( "./join.js" )( Promise, PromiseArray, tryConvertToPromise, INTERNAL );
							Promise.Promise = Promise;
							_dereq_( './map.js' )( Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL );
							_dereq_( './cancel.js' )( Promise );
							_dereq_( './using.js' )( Promise, apiRejection, tryConvertToPromise, createContext );
							_dereq_( './generators.js' )( Promise, apiRejection, INTERNAL, tryConvertToPromise );
							_dereq_( './nodeify.js' )( Promise );
							_dereq_( './call_get.js' )( Promise );
							_dereq_( './props.js' )( Promise, PromiseArray, tryConvertToPromise, apiRejection );
							_dereq_( './race.js' )( Promise, INTERNAL, tryConvertToPromise, apiRejection );
							_dereq_( './reduce.js' )( Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL );
							_dereq_( './settle.js' )( Promise, PromiseArray );
							_dereq_( './some.js' )( Promise, PromiseArray, apiRejection );
							_dereq_( './promisify.js' )( Promise, INTERNAL );
							_dereq_( './any.js' )( Promise );
							_dereq_( './each.js' )( Promise, INTERNAL );
							_dereq_( './timers.js' )( Promise, INTERNAL );
							_dereq_( './filter.js' )( Promise, INTERNAL );

							util.toFastProperties( Promise );
							util.toFastProperties( Promise.prototype );
							function fillTypes ( value ) {
								var p = new Promise( INTERNAL );
								p._fulfillmentHandler0 = value;
								p._rejectionHandler0 = value;
								p._progressHandler0 = value;
								p._promise0 = value;
								p._receiver0 = value;
								p._settledValue = value;
							}

							// Complete slack tracking, opt out of field-type tracking and           
							// stabilize map                                                         
							fillTypes( { a: 1 } );
							fillTypes( { b: 2 } );
							fillTypes( { c: 3 } );
							fillTypes( 1 );
							fillTypes( function () {
							} );
							fillTypes( undefined );
							fillTypes( false );
							fillTypes( new Promise( INTERNAL ) );
							CapturedTrace.setBounds( async.firstLineError, util.lastLineError );
							return Promise;

						};

					}, {
						"./any.js": 1,
						"./async.js": 2,
						"./bind.js": 3,
						"./call_get.js": 5,
						"./cancel.js": 6,
						"./captured_trace.js": 7,
						"./catch_filter.js": 8,
						"./context.js": 9,
						"./debuggability.js": 10,
						"./direct_resolve.js": 11,
						"./each.js": 12,
						"./errors.js": 13,
						"./filter.js": 15,
						"./finally.js": 16,
						"./generators.js": 17,
						"./join.js": 18,
						"./map.js": 19,
						"./method.js": 20,
						"./nodeify.js": 21,
						"./progress.js": 22,
						"./promise_array.js": 24,
						"./promise_resolver.js": 25,
						"./promisify.js": 26,
						"./props.js": 27,
						"./race.js": 29,
						"./reduce.js": 30,
						"./settle.js": 32,
						"./some.js": 33,
						"./synchronous_inspection.js": 34,
						"./thenables.js": 35,
						"./timers.js": 36,
						"./using.js": 37,
						"./util.js": 38
					} ],
					24: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL, tryConvertToPromise,
													apiRejection ) {
							var util = _dereq_( "./util.js" );
							var isArray = util.isArray;

							function toResolutionValue ( val ) {
								switch ( val ) {
									case -2:
										return [];
									case -3:
										return {};
								}
							}

							function PromiseArray ( values ) {
								var promise = this._promise = new Promise( INTERNAL );
								var parent;
								if ( values instanceof Promise ) {
									parent = values;
									promise._propagateFrom( parent, 1 | 4 );
								}
								this._values = values;
								this._length = 0;
								this._totalResolved = 0;
								this._init( undefined, -2 );
							}

							PromiseArray.prototype.length = function () {
								return this._length;
							};

							PromiseArray.prototype.promise = function () {
								return this._promise;
							};

							PromiseArray.prototype._init = function init ( _, resolveValueIfEmpty ) {
								var values = tryConvertToPromise( this._values, this._promise );
								if ( values instanceof Promise ) {
									values = values._target();
									this._values = values;
									if ( values._isFulfilled() ) {
										values = values._value();
										if ( !isArray( values ) ) {
											var err = new Promise.TypeError( "expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a" );
											this.__hardReject__( err );
											return;
										}
									} else if ( values._isPending() ) {
										values._then(
											init,
											this._reject,
											undefined,
											this,
											resolveValueIfEmpty
										);
										return;
									} else {
										this._reject( values._reason() );
										return;
									}
								} else if ( !isArray( values ) ) {
									this._promise._reject( apiRejection( "expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a" )._reason() );
									return;
								}

								if ( values.length === 0 ) {
									if ( resolveValueIfEmpty === -5 ) {
										this._resolveEmptyArray();
									}
									else {
										this._resolve( toResolutionValue( resolveValueIfEmpty ) );
									}
									return;
								}
								var len = this.getActualLength( values.length );
								this._length = len;
								this._values = this.shouldCopyValues() ? new Array( len ) : this._values;
								var promise = this._promise;
								for ( var i = 0; i < len; ++i ) {
									var isResolved = this._isResolved();
									var maybePromise = tryConvertToPromise( values[ i ], promise );
									if ( maybePromise instanceof Promise ) {
										maybePromise = maybePromise._target();
										if ( isResolved ) {
											maybePromise._ignoreRejections();
										} else if ( maybePromise._isPending() ) {
											maybePromise._proxyPromiseArray( this, i );
										} else if ( maybePromise._isFulfilled() ) {
											this._promiseFulfilled( maybePromise._value(), i );
										} else {
											this._promiseRejected( maybePromise._reason(), i );
										}
									} else if ( !isResolved ) {
										this._promiseFulfilled( maybePromise, i );
									}
								}
							};

							PromiseArray.prototype._isResolved = function () {
								return this._values === null;
							};

							PromiseArray.prototype._resolve = function ( value ) {
								this._values = null;
								this._promise._fulfill( value );
							};

							PromiseArray.prototype.__hardReject__ =
								PromiseArray.prototype._reject = function ( reason ) {
									this._values = null;
									this._promise._rejectCallback( reason, false, true );
								};

							PromiseArray.prototype._promiseProgressed = function ( progressValue, index ) {
								this._promise._progress( {
									index: index,
									value: progressValue
								} );
							};


							PromiseArray.prototype._promiseFulfilled = function ( value, index ) {
								this._values[ index ] = value;
								var totalResolved = ++this._totalResolved;
								if ( totalResolved >= this._length ) {
									this._resolve( this._values );
								}
							};

							PromiseArray.prototype._promiseRejected = function ( reason, index ) {
								this._totalResolved++;
								this._reject( reason );
							};

							PromiseArray.prototype.shouldCopyValues = function () {
								return true;
							};

							PromiseArray.prototype.getActualLength = function ( len ) {
								return len;
							};

							return PromiseArray;
						};

					}, { "./util.js": 38 } ],
					25: [ function ( _dereq_, module, exports ) {
						"use strict";
						var util = _dereq_( "./util.js" );
						var maybeWrapAsError = util.maybeWrapAsError;
						var errors = _dereq_( "./errors.js" );
						var TimeoutError = errors.TimeoutError;
						var OperationalError = errors.OperationalError;
						var haveGetters = util.haveGetters;
						var es5 = _dereq_( "./es5.js" );

						function isUntypedError ( obj ) {
							return obj instanceof Error &&
								es5.getPrototypeOf( obj ) === Error.prototype;
						}

						var rErrorKey = /^(?:name|message|stack|cause)$/;

						function wrapAsOperationalError ( obj ) {
							var ret;
							if ( isUntypedError( obj ) ) {
								ret = new OperationalError( obj );
								ret.name = obj.name;
								ret.message = obj.message;
								ret.stack = obj.stack;
								var keys = es5.keys( obj );
								for ( var i = 0; i < keys.length; ++i ) {
									var key = keys[ i ];
									if ( !rErrorKey.test( key ) ) {
										ret[ key ] = obj[ key ];
									}
								}
								return ret;
							}
							util.markAsOriginatingFromRejection( obj );
							return obj;
						}

						function nodebackForPromise ( promise ) {
							return function ( err, value ) {
								if ( promise === null ) return;

								if ( err ) {
									var wrapped = wrapAsOperationalError( maybeWrapAsError( err ) );
									promise._attachExtraTrace( wrapped );
									promise._reject( wrapped );
								} else if ( arguments.length > 2 ) {
									var $_len = arguments.length;
									var args = new Array( $_len - 1 );
									for ( var $_i = 1; $_i < $_len; ++$_i ) {
										args[ $_i - 1 ] = arguments[ $_i ];
									}
									promise._fulfill( args );
								} else {
									promise._fulfill( value );
								}

								promise = null;
							};
						}


						var PromiseResolver;
						if ( !haveGetters ) {
							PromiseResolver = function ( promise ) {
								this.promise = promise;
								this.asCallback = nodebackForPromise( promise );
								this.callback = this.asCallback;
							};
						}
						else {
							PromiseResolver = function ( promise ) {
								this.promise = promise;
							};
						}
						if ( haveGetters ) {
							var prop = {
								get: function () {
									return nodebackForPromise( this.promise );
								}
							};
							es5.defineProperty( PromiseResolver.prototype, "asCallback", prop );
							es5.defineProperty( PromiseResolver.prototype, "callback", prop );
						}

						PromiseResolver._nodebackForPromise = nodebackForPromise;

						PromiseResolver.prototype.toString = function () {
							return "[object PromiseResolver]";
						};

						PromiseResolver.prototype.resolve =
							PromiseResolver.prototype.fulfill = function ( value ) {
								if ( !(this instanceof PromiseResolver) ) {
									throw new TypeError( "Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a" );
								}
								this.promise._resolveCallback( value );
							};

						PromiseResolver.prototype.reject = function ( reason ) {
							if ( !(this instanceof PromiseResolver) ) {
								throw new TypeError( "Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a" );
							}
							this.promise._rejectCallback( reason );
						};

						PromiseResolver.prototype.progress = function ( value ) {
							if ( !(this instanceof PromiseResolver) ) {
								throw new TypeError( "Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.\u000a\u000a    See http://goo.gl/sdkXL9\u000a" );
							}
							this.promise._progress( value );
						};

						PromiseResolver.prototype.cancel = function ( err ) {
							this.promise.cancel( err );
						};

						PromiseResolver.prototype.timeout = function () {
							this.reject( new TimeoutError( "timeout" ) );
						};

						PromiseResolver.prototype.isResolved = function () {
							return this.promise.isResolved();
						};

						PromiseResolver.prototype.toJSON = function () {
							return this.promise.toJSON();
						};

						module.exports = PromiseResolver;

					}, { "./errors.js": 13, "./es5.js": 14, "./util.js": 38 } ],
					26: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL ) {
							var THIS = {};
							var util = _dereq_( "./util.js" );
							var nodebackForPromise = _dereq_( "./promise_resolver.js" )
								._nodebackForPromise;
							var withAppended = util.withAppended;
							var maybeWrapAsError = util.maybeWrapAsError;
							var canEvaluate = util.canEvaluate;
							var TypeError = _dereq_( "./errors" ).TypeError;
							var defaultSuffix = "Async";
							var defaultPromisified = { __isPromisified__: true };
							var noCopyProps = [
								"arity", "length",
								"name",
								"arguments",
								"caller",
								"callee",
								"prototype",
								"__isPromisified__"
							];
							var noCopyPropsPattern = new RegExp( "^(?:" + noCopyProps.join( "|" ) + ")$" );

							var defaultFilter = function ( name ) {
								return util.isIdentifier( name ) &&
									name.charAt( 0 ) !== "_" &&
									name !== "constructor";
							};

							function propsFilter ( key ) {
								return !noCopyPropsPattern.test( key );
							}

							function isPromisified ( fn ) {
								try {
									return fn.__isPromisified__ === true;
								}
								catch ( e ) {
									return false;
								}
							}

							function hasPromisified ( obj, key, suffix ) {
								var val = util.getDataPropertyOrDefault( obj, key + suffix,
									defaultPromisified );
								return val ? isPromisified( val ) : false;
							}

							function checkValid ( ret, suffix, suffixRegexp ) {
								for ( var i = 0; i < ret.length; i += 2 ) {
									var key = ret[ i ];
									if ( suffixRegexp.test( key ) ) {
										var keyWithoutAsyncSuffix = key.replace( suffixRegexp, "" );
										for ( var j = 0; j < ret.length; j += 2 ) {
											if ( ret[ j ] === keyWithoutAsyncSuffix ) {
												throw new TypeError( "Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/iWrZbw\u000a"
													.replace( "%s", suffix ) );
											}
										}
									}
								}
							}

							function promisifiableMethods ( obj, suffix, suffixRegexp, filter ) {
								var keys = util.inheritedDataKeys( obj );
								var ret = [];
								for ( var i = 0; i < keys.length; ++i ) {
									var key = keys[ i ];
									var value = obj[ key ];
									var passesDefaultFilter = filter === defaultFilter
										? true : defaultFilter( key, value, obj );
									if ( typeof value === "function" && !isPromisified( value ) && !hasPromisified( obj, key, suffix ) &&
										filter( key, value, obj, passesDefaultFilter ) ) {
										ret.push( key, value );
									}
								}
								checkValid( ret, suffix, suffixRegexp );
								return ret;
							}

							var escapeIdentRegex = function ( str ) {
								return str.replace( /([$])/, "\\$" );
							};

							var makeNodePromisifiedEval;
							if ( false ) {
								var switchCaseArgumentOrder = function ( likelyArgumentCount ) {
									var ret = [ likelyArgumentCount ];
									var min = Math.max( 0, likelyArgumentCount - 1 - 3 );
									for ( var i = likelyArgumentCount - 1; i >= min; --i ) {
										ret.push( i );
									}
									for ( var i = likelyArgumentCount + 1; i <= 3; ++i ) {
										ret.push( i );
									}
									return ret;
								};

								var argumentSequence = function ( argumentCount ) {
									return util.filledRange( argumentCount, "_arg", "" );
								};

								var parameterDeclaration = function ( parameterCount ) {
									return util.filledRange(
										Math.max( parameterCount, 3 ), "_arg", "" );
								};

								var parameterCount = function ( fn ) {
									if ( typeof fn.length === "number" ) {
										return Math.max( Math.min( fn.length, 1023 + 1 ), 0 );
									}
									return 0;
								};

								makeNodePromisifiedEval =
									function ( callback, receiver, originalName, fn ) {
										var newParameterCount = Math.max( 0, parameterCount( fn ) - 1 );
										var argumentOrder = switchCaseArgumentOrder( newParameterCount );
										var shouldProxyThis = typeof callback === "string" || receiver === THIS;

										function generateCallForArgumentCount ( count ) {
											var args = argumentSequence( count ).join( ", " );
											var comma = count > 0 ? ", " : "";
											var ret;
											if ( shouldProxyThis ) {
												ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
											} else {
												ret = receiver === undefined
													? "ret = callback({{args}}, nodeback); break;\n"
													: "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
											}
											return ret.replace( "{{args}}", args ).replace( ", ", comma );
										}

										function generateArgumentSwitchCase () {
											var ret = "";
											for ( var i = 0; i < argumentOrder.length; ++i ) {
												ret += "case " + argumentOrder[ i ] + ":" +
													generateCallForArgumentCount( argumentOrder[ i ] );
											}

											ret += "                                                             \n\
	        default:                                                             \n\
	            var args = new Array(len + 1);                                   \n\
	            var i = 0;                                                       \n\
	            for (var i = 0; i < len; ++i) {                                  \n\
	               args[i] = arguments[i];                                       \n\
	            }                                                                \n\
	            args[i] = nodeback;                                              \n\
	            [CodeForCall]                                                    \n\
	            break;                                                           \n\
	        ".replace( "[CodeForCall]", (shouldProxyThis
													? "ret = callback.apply(this, args);\n"
													: "ret = callback.apply(receiver, args);\n") );
											return ret;
										}

										var getFunctionCode = typeof callback === "string"
											? ("this != null ? this['" + callback + "'] : fn")
											: "fn";

										return new Function( "Promise",
											"fn",
											"receiver",
											"withAppended",
											"maybeWrapAsError",
											"nodebackForPromise",
											"tryCatch",
											"errorObj",
											"notEnumerableProp",
											"INTERNAL", "'use strict';                            \n\
	        var ret = function (Parameters) {                                    \n\
	            'use strict';                                                    \n\
	            var len = arguments.length;                                      \n\
	            var promise = new Promise(INTERNAL);                             \n\
	            promise._captureStackTrace();                                    \n\
	            var nodeback = nodebackForPromise(promise);                      \n\
	            var ret;                                                         \n\
	            var callback = tryCatch([GetFunctionCode]);                      \n\
	            switch(len) {                                                    \n\
	                [CodeForSwitchCase]                                          \n\
	            }                                                                \n\
	            if (ret === errorObj) {                                          \n\
	                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
	            }                                                                \n\
	            return promise;                                                  \n\
	        };                                                                   \n\
	        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
	        return ret;                                                          \n\
	        "
												.replace( "Parameters", parameterDeclaration( newParameterCount ) )
												.replace( "[CodeForSwitchCase]", generateArgumentSwitchCase() )
												.replace( "[GetFunctionCode]", getFunctionCode ) )(
											Promise,
											fn,
											receiver,
											withAppended,
											maybeWrapAsError,
											nodebackForPromise,
											util.tryCatch,
											util.errorObj,
											util.notEnumerableProp,
											INTERNAL
										);
									};
							}

							function makeNodePromisifiedClosure ( callback, receiver, _, fn ) {
								var defaultThis = (function () {
									return this;
								})();
								var method = callback;
								if ( typeof method === "string" ) {
									callback = fn;
								}
								function promisified () {
									var _receiver = receiver;
									if ( receiver === THIS ) _receiver = this;
									var promise = new Promise( INTERNAL );
									promise._captureStackTrace();
									var cb = typeof method === "string" && this !== defaultThis
										? this[ method ] : callback;
									var fn = nodebackForPromise( promise );
									try {
										cb.apply( _receiver, withAppended( arguments, fn ) );
									} catch ( e ) {
										promise._rejectCallback( maybeWrapAsError( e ), true, true );
									}
									return promise;
								}

								util.notEnumerableProp( promisified, "__isPromisified__", true );
								return promisified;
							}

							var makeNodePromisified = canEvaluate
								? makeNodePromisifiedEval
								: makeNodePromisifiedClosure;

							function promisifyAll ( obj, suffix, filter, promisifier ) {
								var suffixRegexp = new RegExp( escapeIdentRegex( suffix ) + "$" );
								var methods =
									promisifiableMethods( obj, suffix, suffixRegexp, filter );

								for ( var i = 0, len = methods.length; i < len; i += 2 ) {
									var key = methods[ i ];
									var fn = methods[ i + 1 ];
									var promisifiedKey = key + suffix;
									obj[ promisifiedKey ] = promisifier === makeNodePromisified
										? makeNodePromisified( key, THIS, key, fn, suffix )
										: promisifier( fn, function () {
										return makeNodePromisified( key, THIS, key, fn, suffix );
									} );
								}
								util.toFastProperties( obj );
								return obj;
							}

							function promisify ( callback, receiver ) {
								return makeNodePromisified( callback, receiver, undefined, callback );
							}

							Promise.promisify = function ( fn, receiver ) {
								if ( typeof fn !== "function" ) {
									throw new TypeError( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								}
								if ( isPromisified( fn ) ) {
									return fn;
								}
								var ret = promisify( fn, arguments.length < 2 ? THIS : receiver );
								util.copyDescriptors( fn, ret, propsFilter );
								return ret;
							};

							Promise.promisifyAll = function ( target, options ) {
								if ( typeof target !== "function" && typeof target !== "object" ) {
									throw new TypeError( "the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/9ITlV0\u000a" );
								}
								options = Object( options );
								var suffix = options.suffix;
								if ( typeof suffix !== "string" ) suffix = defaultSuffix;
								var filter = options.filter;
								if ( typeof filter !== "function" ) filter = defaultFilter;
								var promisifier = options.promisifier;
								if ( typeof promisifier !== "function" ) promisifier = makeNodePromisified;

								if ( !util.isIdentifier( suffix ) ) {
									throw new RangeError( "suffix must be a valid identifier\u000a\u000a    See http://goo.gl/8FZo5V\u000a" );
								}

								var keys = util.inheritedDataKeys( target );
								for ( var i = 0; i < keys.length; ++i ) {
									var value = target[ keys[ i ] ];
									if ( keys[ i ] !== "constructor" &&
										util.isClass( value ) ) {
										promisifyAll( value.prototype, suffix, filter, promisifier );
										promisifyAll( value, suffix, filter, promisifier );
									}
								}

								return promisifyAll( target, suffix, filter, promisifier );
							};
						};


					}, { "./errors": 13, "./promise_resolver.js": 25, "./util.js": 38 } ],
					27: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, PromiseArray, tryConvertToPromise, apiRejection ) {
							var util = _dereq_( "./util.js" );
							var isObject = util.isObject;
							var es5 = _dereq_( "./es5.js" );

							function PropertiesPromiseArray ( obj ) {
								var keys = es5.keys( obj );
								var len = keys.length;
								var values = new Array( len * 2 );
								for ( var i = 0; i < len; ++i ) {
									var key = keys[ i ];
									values[ i ] = obj[ key ];
									values[ i + len ] = key;
								}
								this.constructor$( values );
							}

							util.inherits( PropertiesPromiseArray, PromiseArray );

							PropertiesPromiseArray.prototype._init = function () {
								this._init$( undefined, -3 );
							};

							PropertiesPromiseArray.prototype._promiseFulfilled = function ( value, index ) {
								this._values[ index ] = value;
								var totalResolved = ++this._totalResolved;
								if ( totalResolved >= this._length ) {
									var val = {};
									var keyOffset = this.length();
									for ( var i = 0, len = this.length(); i < len; ++i ) {
										val[ this._values[ i + keyOffset ] ] = this._values[ i ];
									}
									this._resolve( val );
								}
							};

							PropertiesPromiseArray.prototype._promiseProgressed = function ( value, index ) {
								this._promise._progress( {
									key: this._values[ index + this.length() ],
									value: value
								} );
							};

							PropertiesPromiseArray.prototype.shouldCopyValues = function () {
								return false;
							};

							PropertiesPromiseArray.prototype.getActualLength = function ( len ) {
								return len >> 1;
							};

							function props ( promises ) {
								var ret;
								var castValue = tryConvertToPromise( promises );

								if ( !isObject( castValue ) ) {
									return apiRejection( "cannot await properties of a non-object\u000a\u000a    See http://goo.gl/OsFKC8\u000a" );
								} else if ( castValue instanceof Promise ) {
									ret = castValue._then(
										Promise.props, undefined, undefined, undefined, undefined );
								} else {
									ret = new PropertiesPromiseArray( castValue ).promise();
								}

								if ( castValue instanceof Promise ) {
									ret._propagateFrom( castValue, 4 );
								}
								return ret;
							}

							Promise.prototype.props = function () {
								return props( this );
							};

							Promise.props = function ( promises ) {
								return props( promises );
							};
						};

					}, { "./es5.js": 14, "./util.js": 38 } ],
					28: [ function ( _dereq_, module, exports ) {
						"use strict";
						function arrayMove ( src, srcIndex, dst, dstIndex, len ) {
							for ( var j = 0; j < len; ++j ) {
								dst[ j + dstIndex ] = src[ j + srcIndex ];
								src[ j + srcIndex ] = void 0;
							}
						}

						function Queue ( capacity ) {
							this._capacity = capacity;
							this._length = 0;
							this._front = 0;
						}

						Queue.prototype._willBeOverCapacity = function ( size ) {
							return this._capacity < size;
						};

						Queue.prototype._pushOne = function ( arg ) {
							var length = this.length();
							this._checkCapacity( length + 1 );
							var i = (this._front + length) & (this._capacity - 1);
							this[ i ] = arg;
							this._length = length + 1;
						};

						Queue.prototype._unshiftOne = function ( value ) {
							var capacity = this._capacity;
							this._checkCapacity( this.length() + 1 );
							var front = this._front;
							var i = (((( front - 1 ) &
							( capacity - 1) ) ^ capacity ) - capacity );
							this[ i ] = value;
							this._front = i;
							this._length = this.length() + 1;
						};

						Queue.prototype.unshift = function ( fn, receiver, arg ) {
							this._unshiftOne( arg );
							this._unshiftOne( receiver );
							this._unshiftOne( fn );
						};

						Queue.prototype.push = function ( fn, receiver, arg ) {
							var length = this.length() + 3;
							if ( this._willBeOverCapacity( length ) ) {
								this._pushOne( fn );
								this._pushOne( receiver );
								this._pushOne( arg );
								return;
							}
							var j = this._front + length - 3;
							this._checkCapacity( length );
							var wrapMask = this._capacity - 1;
							this[ (j + 0) & wrapMask ] = fn;
							this[ (j + 1) & wrapMask ] = receiver;
							this[ (j + 2) & wrapMask ] = arg;
							this._length = length;
						};

						Queue.prototype.shift = function () {
							var front = this._front,
								ret = this[ front ];

							this[ front ] = undefined;
							this._front = (front + 1) & (this._capacity - 1);
							this._length--;
							return ret;
						};

						Queue.prototype.length = function () {
							return this._length;
						};

						Queue.prototype._checkCapacity = function ( size ) {
							if ( this._capacity < size ) {
								this._resizeTo( this._capacity << 1 );
							}
						};

						Queue.prototype._resizeTo = function ( capacity ) {
							var oldCapacity = this._capacity;
							this._capacity = capacity;
							var front = this._front;
							var length = this._length;
							var moveItemsCount = (front + length) & (oldCapacity - 1);
							arrayMove( this, 0, this, oldCapacity, moveItemsCount );
						};

						module.exports = Queue;

					}, {} ],
					29: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL, tryConvertToPromise, apiRejection ) {
							var isArray = _dereq_( "./util.js" ).isArray;

							var raceLater = function ( promise ) {
								return promise.then( function ( array ) {
									return race( array, promise );
								} );
							};

							function race ( promises, parent ) {
								var maybePromise = tryConvertToPromise( promises );

								if ( maybePromise instanceof Promise ) {
									return raceLater( maybePromise );
								} else if ( !isArray( promises ) ) {
									return apiRejection( "expecting an array, a promise or a thenable\u000a\u000a    See http://goo.gl/s8MMhc\u000a" );
								}

								var ret = new Promise( INTERNAL );
								if ( parent !== undefined ) {
									ret._propagateFrom( parent, 4 | 1 );
								}
								var fulfill = ret._fulfill;
								var reject = ret._reject;
								for ( var i = 0, len = promises.length; i < len; ++i ) {
									var val = promises[ i ];

									if ( val === undefined && !(i in promises) ) {
										continue;
									}

									Promise.cast( val )._then( fulfill, reject, undefined, ret, null );
								}
								return ret;
							}

							Promise.race = function ( promises ) {
								return race( promises, undefined );
							};

							Promise.prototype.race = function () {
								return race( this, undefined );
							};

						};

					}, { "./util.js": 38 } ],
					30: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise,
													PromiseArray,
													apiRejection,
													tryConvertToPromise,
													INTERNAL ) {
							var getDomain = Promise._getDomain;
							var async = _dereq_( "./async.js" );
							var util = _dereq_( "./util.js" );
							var tryCatch = util.tryCatch;
							var errorObj = util.errorObj;

							function ReductionPromiseArray ( promises, fn, accum, _each ) {
								this.constructor$( promises );
								this._promise._captureStackTrace();
								this._preservedValues = _each === INTERNAL ? [] : null;
								this._zerothIsAccum = (accum === undefined);
								this._gotAccum = false;
								this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
								this._valuesPhase = undefined;
								var maybePromise = tryConvertToPromise( accum, this._promise );
								var rejected = false;
								var isPromise = maybePromise instanceof Promise;
								if ( isPromise ) {
									maybePromise = maybePromise._target();
									if ( maybePromise._isPending() ) {
										maybePromise._proxyPromiseArray( this, -1 );
									} else if ( maybePromise._isFulfilled() ) {
										accum = maybePromise._value();
										this._gotAccum = true;
									} else {
										this._reject( maybePromise._reason() );
										rejected = true;
									}
								}
								if ( !(isPromise || this._zerothIsAccum) ) this._gotAccum = true;
								var domain = getDomain();
								this._callback = domain === null ? fn : domain.bind( fn );
								this._accum = accum;
								if ( !rejected ) async.invoke( init, this, undefined );
							}

							function init () {
								this._init$( undefined, -5 );
							}

							util.inherits( ReductionPromiseArray, PromiseArray );

							ReductionPromiseArray.prototype._init = function () {
							};

							ReductionPromiseArray.prototype._resolveEmptyArray = function () {
								if ( this._gotAccum || this._zerothIsAccum ) {
									this._resolve( this._preservedValues !== null
										? [] : this._accum );
								}
							};

							ReductionPromiseArray.prototype._promiseFulfilled = function ( value, index ) {
								var values = this._values;
								values[ index ] = value;
								var length = this.length();
								var preservedValues = this._preservedValues;
								var isEach = preservedValues !== null;
								var gotAccum = this._gotAccum;
								var valuesPhase = this._valuesPhase;
								var valuesPhaseIndex;
								if ( !valuesPhase ) {
									valuesPhase = this._valuesPhase = new Array( length );
									for ( valuesPhaseIndex = 0; valuesPhaseIndex < length; ++valuesPhaseIndex ) {
										valuesPhase[ valuesPhaseIndex ] = 0;
									}
								}
								valuesPhaseIndex = valuesPhase[ index ];

								if ( index === 0 && this._zerothIsAccum ) {
									this._accum = value;
									this._gotAccum = gotAccum = true;
									valuesPhase[ index ] = ((valuesPhaseIndex === 0)
										? 1 : 2);
								} else if ( index === -1 ) {
									this._accum = value;
									this._gotAccum = gotAccum = true;
								} else {
									if ( valuesPhaseIndex === 0 ) {
										valuesPhase[ index ] = 1;
									} else {
										valuesPhase[ index ] = 2;
										this._accum = value;
									}
								}
								if ( !gotAccum ) return;

								var callback = this._callback;
								var receiver = this._promise._boundValue();
								var ret;

								for ( var i = this._reducingIndex; i < length; ++i ) {
									valuesPhaseIndex = valuesPhase[ i ];
									if ( valuesPhaseIndex === 2 ) {
										this._reducingIndex = i + 1;
										continue;
									}
									if ( valuesPhaseIndex !== 1 ) return;
									value = values[ i ];
									this._promise._pushContext();
									if ( isEach ) {
										preservedValues.push( value );
										ret = tryCatch( callback ).call( receiver, value, i, length );
									}
									else {
										ret = tryCatch( callback )
											.call( receiver, this._accum, value, i, length );
									}
									this._promise._popContext();

									if ( ret === errorObj ) return this._reject( ret.e );

									var maybePromise = tryConvertToPromise( ret, this._promise );
									if ( maybePromise instanceof Promise ) {
										maybePromise = maybePromise._target();
										if ( maybePromise._isPending() ) {
											valuesPhase[ i ] = 4;
											return maybePromise._proxyPromiseArray( this, i );
										} else if ( maybePromise._isFulfilled() ) {
											ret = maybePromise._value();
										} else {
											return this._reject( maybePromise._reason() );
										}
									}

									this._reducingIndex = i + 1;
									this._accum = ret;
								}

								this._resolve( isEach ? preservedValues : this._accum );
							};

							function reduce ( promises, fn, initialValue, _each ) {
								if ( typeof fn !== "function" ) return apiRejection( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								var array = new ReductionPromiseArray( promises, fn, initialValue, _each );
								return array.promise();
							}

							Promise.prototype.reduce = function ( fn, initialValue ) {
								return reduce( this, fn, initialValue, null );
							};

							Promise.reduce = function ( promises, fn, initialValue, _each ) {
								return reduce( promises, fn, initialValue, _each );
							};
						};

					}, { "./async.js": 2, "./util.js": 38 } ],
					31: [ function ( _dereq_, module, exports ) {
						"use strict";
						var schedule;
						var util = _dereq_( "./util" );
						var noAsyncScheduler = function () {
							throw new Error( "No async scheduler available\u000a\u000a    See http://goo.gl/m3OTXk\u000a" );
						};
						if ( util.isNode && typeof MutationObserver === "undefined" ) {
							var GlobalSetImmediate = global.setImmediate;
							var ProcessNextTick = process.nextTick;
							schedule = util.isRecentNode
								? function ( fn ) {
								GlobalSetImmediate.call( global, fn );
							}
								: function ( fn ) {
								ProcessNextTick.call( process, fn );
							};
						} else if ( (typeof MutationObserver !== "undefined") && !(typeof window !== "undefined" &&
							window.navigator &&
							window.navigator.standalone) ) {
							schedule = function ( fn ) {
								var div = document.createElement( "div" );
								var observer = new MutationObserver( fn );
								observer.observe( div, { attributes: true } );
								return function () {
									div.classList.toggle( "foo" );
								};
							};
							schedule.isStatic = true;
						} else if ( typeof setImmediate !== "undefined" ) {
							schedule = function ( fn ) {
								setImmediate( fn );
							};
						} else if ( typeof setTimeout !== "undefined" ) {
							schedule = function ( fn ) {
								setTimeout( fn, 0 );
							};
						} else {
							schedule = noAsyncScheduler;
						}
						module.exports = schedule;

					}, { "./util": 38 } ],
					32: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports =
							function ( Promise, PromiseArray ) {
								var PromiseInspection = Promise.PromiseInspection;
								var util = _dereq_( "./util.js" );

								function SettledPromiseArray ( values ) {
									this.constructor$( values );
								}

								util.inherits( SettledPromiseArray, PromiseArray );

								SettledPromiseArray.prototype._promiseResolved = function ( index, inspection ) {
									this._values[ index ] = inspection;
									var totalResolved = ++this._totalResolved;
									if ( totalResolved >= this._length ) {
										this._resolve( this._values );
									}
								};

								SettledPromiseArray.prototype._promiseFulfilled = function ( value, index ) {
									var ret = new PromiseInspection();
									ret._bitField = 268435456;
									ret._settledValue = value;
									this._promiseResolved( index, ret );
								};
								SettledPromiseArray.prototype._promiseRejected = function ( reason, index ) {
									var ret = new PromiseInspection();
									ret._bitField = 134217728;
									ret._settledValue = reason;
									this._promiseResolved( index, ret );
								};

								Promise.settle = function ( promises ) {
									return new SettledPromiseArray( promises ).promise();
								};

								Promise.prototype.settle = function () {
									return new SettledPromiseArray( this ).promise();
								};
							};

					}, { "./util.js": 38 } ],
					33: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports =
							function ( Promise, PromiseArray, apiRejection ) {
								var util = _dereq_( "./util.js" );
								var RangeError = _dereq_( "./errors.js" ).RangeError;
								var AggregateError = _dereq_( "./errors.js" ).AggregateError;
								var isArray = util.isArray;


								function SomePromiseArray ( values ) {
									this.constructor$( values );
									this._howMany = 0;
									this._unwrap = false;
									this._initialized = false;
								}

								util.inherits( SomePromiseArray, PromiseArray );

								SomePromiseArray.prototype._init = function () {
									if ( !this._initialized ) {
										return;
									}
									if ( this._howMany === 0 ) {
										this._resolve( [] );
										return;
									}
									this._init$( undefined, -5 );
									var isArrayResolved = isArray( this._values );
									if ( !this._isResolved() &&
										isArrayResolved &&
										this._howMany > this._canPossiblyFulfill() ) {
										this._reject( this._getRangeError( this.length() ) );
									}
								};

								SomePromiseArray.prototype.init = function () {
									this._initialized = true;
									this._init();
								};

								SomePromiseArray.prototype.setUnwrap = function () {
									this._unwrap = true;
								};

								SomePromiseArray.prototype.howMany = function () {
									return this._howMany;
								};

								SomePromiseArray.prototype.setHowMany = function ( count ) {
									this._howMany = count;
								};

								SomePromiseArray.prototype._promiseFulfilled = function ( value ) {
									this._addFulfilled( value );
									if ( this._fulfilled() === this.howMany() ) {
										this._values.length = this.howMany();
										if ( this.howMany() === 1 && this._unwrap ) {
											this._resolve( this._values[ 0 ] );
										} else {
											this._resolve( this._values );
										}
									}

								};
								SomePromiseArray.prototype._promiseRejected = function ( reason ) {
									this._addRejected( reason );
									if ( this.howMany() > this._canPossiblyFulfill() ) {
										var e = new AggregateError();
										for ( var i = this.length(); i < this._values.length; ++i ) {
											e.push( this._values[ i ] );
										}
										this._reject( e );
									}
								};

								SomePromiseArray.prototype._fulfilled = function () {
									return this._totalResolved;
								};

								SomePromiseArray.prototype._rejected = function () {
									return this._values.length - this.length();
								};

								SomePromiseArray.prototype._addRejected = function ( reason ) {
									this._values.push( reason );
								};

								SomePromiseArray.prototype._addFulfilled = function ( value ) {
									this._values[ this._totalResolved++ ] = value;
								};

								SomePromiseArray.prototype._canPossiblyFulfill = function () {
									return this.length() - this._rejected();
								};

								SomePromiseArray.prototype._getRangeError = function ( count ) {
									var message = "Input array must contain at least " +
										this._howMany + " items but contains only " + count + " items";
									return new RangeError( message );
								};

								SomePromiseArray.prototype._resolveEmptyArray = function () {
									this._reject( this._getRangeError( 0 ) );
								};

								function some ( promises, howMany ) {
									if ( (howMany | 0) !== howMany || howMany < 0 ) {
										return apiRejection( "expecting a positive integer\u000a\u000a    See http://goo.gl/1wAmHx\u000a" );
									}
									var ret = new SomePromiseArray( promises );
									var promise = ret.promise();
									ret.setHowMany( howMany );
									ret.init();
									return promise;
								}

								Promise.some = function ( promises, howMany ) {
									return some( promises, howMany );
								};

								Promise.prototype.some = function ( howMany ) {
									return some( this, howMany );
								};

								Promise._SomePromiseArray = SomePromiseArray;
							};

					}, { "./errors.js": 13, "./util.js": 38 } ],
					34: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise ) {
							function PromiseInspection ( promise ) {
								if ( promise !== undefined ) {
									promise = promise._target();
									this._bitField = promise._bitField;
									this._settledValue = promise._settledValue;
								}
								else {
									this._bitField = 0;
									this._settledValue = undefined;
								}
							}

							PromiseInspection.prototype.value = function () {
								if ( !this.isFulfilled() ) {
									throw new TypeError( "cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a" );
								}
								return this._settledValue;
							};

							PromiseInspection.prototype.error =
								PromiseInspection.prototype.reason = function () {
									if ( !this.isRejected() ) {
										throw new TypeError( "cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a" );
									}
									return this._settledValue;
								};

							PromiseInspection.prototype.isFulfilled =
								Promise.prototype._isFulfilled = function () {
									return (this._bitField & 268435456) > 0;
								};

							PromiseInspection.prototype.isRejected =
								Promise.prototype._isRejected = function () {
									return (this._bitField & 134217728) > 0;
								};

							PromiseInspection.prototype.isPending =
								Promise.prototype._isPending = function () {
									return (this._bitField & 402653184) === 0;
								};

							PromiseInspection.prototype.isResolved =
								Promise.prototype._isResolved = function () {
									return (this._bitField & 402653184) > 0;
								};

							Promise.prototype.isPending = function () {
								return this._target()._isPending();
							};

							Promise.prototype.isRejected = function () {
								return this._target()._isRejected();
							};

							Promise.prototype.isFulfilled = function () {
								return this._target()._isFulfilled();
							};

							Promise.prototype.isResolved = function () {
								return this._target()._isResolved();
							};

							Promise.prototype._value = function () {
								return this._settledValue;
							};

							Promise.prototype._reason = function () {
								this._unsetRejectionIsUnhandled();
								return this._settledValue;
							};

							Promise.prototype.value = function () {
								var target = this._target();
								if ( !target.isFulfilled() ) {
									throw new TypeError( "cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/hc1DLj\u000a" );
								}
								return target._settledValue;
							};

							Promise.prototype.reason = function () {
								var target = this._target();
								if ( !target.isRejected() ) {
									throw new TypeError( "cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/hPuiwB\u000a" );
								}
								target._unsetRejectionIsUnhandled();
								return target._settledValue;
							};


							Promise.PromiseInspection = PromiseInspection;
						};

					}, {} ],
					35: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL ) {
							var util = _dereq_( "./util.js" );
							var errorObj = util.errorObj;
							var isObject = util.isObject;

							function tryConvertToPromise ( obj, context ) {
								if ( isObject( obj ) ) {
									if ( obj instanceof Promise ) {
										return obj;
									}
									else if ( isAnyBluebirdPromise( obj ) ) {
										var ret = new Promise( INTERNAL );
										obj._then(
											ret._fulfillUnchecked,
											ret._rejectUncheckedCheckError,
											ret._progressUnchecked,
											ret,
											null
										);
										return ret;
									}
									var then = util.tryCatch( getThen )( obj );
									if ( then === errorObj ) {
										if ( context ) context._pushContext();
										var ret = Promise.reject( then.e );
										if ( context ) context._popContext();
										return ret;
									} else if ( typeof then === "function" ) {
										return doThenable( obj, then, context );
									}
								}
								return obj;
							}

							function getThen ( obj ) {
								return obj.then;
							}

							var hasProp = {}.hasOwnProperty;

							function isAnyBluebirdPromise ( obj ) {
								return hasProp.call( obj, "_promise0" );
							}

							function doThenable ( x, then, context ) {
								var promise = new Promise( INTERNAL );
								var ret = promise;
								if ( context ) context._pushContext();
								promise._captureStackTrace();
								if ( context ) context._popContext();
								var synchronous = true;
								var result = util.tryCatch( then ).call( x,
									resolveFromThenable,
									rejectFromThenable,
									progressFromThenable );
								synchronous = false;
								if ( promise && result === errorObj ) {
									promise._rejectCallback( result.e, true, true );
									promise = null;
								}

								function resolveFromThenable ( value ) {
									if ( !promise ) return;
									promise._resolveCallback( value );
									promise = null;
								}

								function rejectFromThenable ( reason ) {
									if ( !promise ) return;
									promise._rejectCallback( reason, synchronous, true );
									promise = null;
								}

								function progressFromThenable ( value ) {
									if ( !promise ) return;
									if ( typeof promise._progress === "function" ) {
										promise._progress( value );
									}
								}

								return ret;
							}

							return tryConvertToPromise;
						};

					}, { "./util.js": 38 } ],
					36: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, INTERNAL ) {
							var util = _dereq_( "./util.js" );
							var TimeoutError = Promise.TimeoutError;

							var afterTimeout = function ( promise, message ) {
								if ( !promise.isPending() ) return;
								if ( typeof message !== "string" ) {
									message = "operation timed out";
								}
								var err = new TimeoutError( message );
								util.markAsOriginatingFromRejection( err );
								promise._attachExtraTrace( err );
								promise._cancel( err );
							};

							var afterValue = function ( value ) {
								return delay( +this ).thenReturn( value );
							};
							var delay = Promise.delay = function ( value, ms ) {
								if ( ms === undefined ) {
									ms = value;
									value = undefined;
									var ret = new Promise( INTERNAL );
									setTimeout( function () {
										ret._fulfill();
									}, ms );
									return ret;
								}
								ms = +ms;
								return Promise.resolve( value )._then( afterValue, null, null, ms, undefined );
							};

							Promise.prototype.delay = function ( ms ) {
								return delay( this, ms );
							};

							function successClear ( value ) {
								var handle = this;
								if ( handle instanceof Number ) handle = +handle;
								clearTimeout( handle );
								return value;
							}

							function failureClear ( reason ) {
								var handle = this;
								if ( handle instanceof Number ) handle = +handle;
								clearTimeout( handle );
								throw reason;
							}

							Promise.prototype.timeout = function ( ms, message ) {
								ms = +ms;
								var ret = this.then().cancellable();
								ret._cancellationParent = this;
								var handle = setTimeout( function timeoutTimeout () {
									afterTimeout( ret, message );
								}, ms );
								return ret._then( successClear, failureClear, undefined, handle, undefined );
							};

						};

					}, { "./util.js": 38 } ],
					37: [ function ( _dereq_, module, exports ) {
						"use strict";
						module.exports = function ( Promise, apiRejection, tryConvertToPromise,
													createContext ) {
							var TypeError = _dereq_( "./errors.js" ).TypeError;
							var inherits = _dereq_( "./util.js" ).inherits;
							var PromiseInspection = Promise.PromiseInspection;

							function inspectionMapper ( inspections ) {
								var len = inspections.length;
								for ( var i = 0; i < len; ++i ) {
									var inspection = inspections[ i ];
									if ( inspection.isRejected() ) {
										return Promise.reject( inspection.error() );
									}
									inspections[ i ] = inspection._settledValue;
								}
								return inspections;
							}

							function thrower ( e ) {
								setTimeout( function () {
									throw e;
								}, 0 );
							}

							function castPreservingDisposable ( thenable ) {
								var maybePromise = tryConvertToPromise( thenable );
								if ( maybePromise !== thenable &&
									typeof thenable._isDisposable === "function" &&
									typeof thenable._getDisposer === "function" &&
									thenable._isDisposable() ) {
									maybePromise._setDisposable( thenable._getDisposer() );
								}
								return maybePromise;
							}

							function dispose ( resources, inspection ) {
								var i = 0;
								var len = resources.length;
								var ret = Promise.defer();

								function iterator () {
									if ( i >= len ) return ret.resolve();
									var maybePromise = castPreservingDisposable( resources[ i++ ] );
									if ( maybePromise instanceof Promise &&
										maybePromise._isDisposable() ) {
										try {
											maybePromise = tryConvertToPromise(
												maybePromise._getDisposer().tryDispose( inspection ),
												resources.promise );
										} catch ( e ) {
											return thrower( e );
										}
										if ( maybePromise instanceof Promise ) {
											return maybePromise._then( iterator, thrower,
												null, null, null );
										}
									}
									iterator();
								}

								iterator();
								return ret.promise;
							}

							function disposerSuccess ( value ) {
								var inspection = new PromiseInspection();
								inspection._settledValue = value;
								inspection._bitField = 268435456;
								return dispose( this, inspection ).thenReturn( value );
							}

							function disposerFail ( reason ) {
								var inspection = new PromiseInspection();
								inspection._settledValue = reason;
								inspection._bitField = 134217728;
								return dispose( this, inspection ).thenThrow( reason );
							}

							function Disposer ( data, promise, context ) {
								this._data = data;
								this._promise = promise;
								this._context = context;
							}

							Disposer.prototype.data = function () {
								return this._data;
							};

							Disposer.prototype.promise = function () {
								return this._promise;
							};

							Disposer.prototype.resource = function () {
								if ( this.promise().isFulfilled() ) {
									return this.promise().value();
								}
								return null;
							};

							Disposer.prototype.tryDispose = function ( inspection ) {
								var resource = this.resource();
								var context = this._context;
								if ( context !== undefined ) context._pushContext();
								var ret = resource !== null
									? this.doDispose( resource, inspection ) : null;
								if ( context !== undefined ) context._popContext();
								this._promise._unsetDisposable();
								this._data = null;
								return ret;
							};

							Disposer.isDisposer = function ( d ) {
								return (d != null &&
								typeof d.resource === "function" &&
								typeof d.tryDispose === "function");
							};

							function FunctionDisposer ( fn, promise, context ) {
								this.constructor$( fn, promise, context );
							}

							inherits( FunctionDisposer, Disposer );

							FunctionDisposer.prototype.doDispose = function ( resource, inspection ) {
								var fn = this.data();
								return fn.call( resource, resource, inspection );
							};

							function maybeUnwrapDisposer ( value ) {
								if ( Disposer.isDisposer( value ) ) {
									this.resources[ this.index ]._setDisposable( value );
									return value.promise();
								}
								return value;
							}

							Promise.using = function () {
								var len = arguments.length;
								if ( len < 2 ) return apiRejection(
									"you must pass at least 2 arguments to Promise.using" );
								var fn = arguments[ len - 1 ];
								if ( typeof fn !== "function" ) return apiRejection( "fn must be a function\u000a\u000a    See http://goo.gl/916lJJ\u000a" );
								len--;
								var resources = new Array( len );
								for ( var i = 0; i < len; ++i ) {
									var resource = arguments[ i ];
									if ( Disposer.isDisposer( resource ) ) {
										var disposer = resource;
										resource = resource.promise();
										resource._setDisposable( disposer );
									} else {
										var maybePromise = tryConvertToPromise( resource );
										if ( maybePromise instanceof Promise ) {
											resource =
												maybePromise._then( maybeUnwrapDisposer, null, null, {
													resources: resources,
													index: i
												}, undefined );
										}
									}
									resources[ i ] = resource;
								}

								var promise = Promise.settle( resources )
									.then( inspectionMapper )
									.then( function ( vals ) {
										promise._pushContext();
										var ret;
										try {
											ret = fn.apply( undefined, vals );
										} finally {
											promise._popContext();
										}
										return ret;
									} )
									._then(
									disposerSuccess, disposerFail, undefined, resources, undefined );
								resources.promise = promise;
								return promise;
							};

							Promise.prototype._setDisposable = function ( disposer ) {
								this._bitField = this._bitField | 262144;
								this._disposer = disposer;
							};

							Promise.prototype._isDisposable = function () {
								return (this._bitField & 262144) > 0;
							};

							Promise.prototype._getDisposer = function () {
								return this._disposer;
							};

							Promise.prototype._unsetDisposable = function () {
								this._bitField = this._bitField & (~262144);
								this._disposer = undefined;
							};

							Promise.prototype.disposer = function ( fn ) {
								if ( typeof fn === "function" ) {
									return new FunctionDisposer( fn, this, createContext() );
								}
								throw new TypeError();
							};

						};

					}, { "./errors.js": 13, "./util.js": 38 } ],
					38: [ function ( _dereq_, module, exports ) {
						"use strict";
						var es5 = _dereq_( "./es5.js" );
						var canEvaluate = typeof navigator == "undefined";
						var haveGetters = (function () {
							try {
								var o = {};
								es5.defineProperty( o, "f", {
									get: function () {
										return 3;
									}
								} );
								return o.f === 3;
							}
							catch ( e ) {
								return false;
							}

						})();

						var errorObj = { e: {} };
						var tryCatchTarget;

						function tryCatcher () {
							try {
								var target = tryCatchTarget;
								tryCatchTarget = null;
								return target.apply( this, arguments );
							} catch ( e ) {
								errorObj.e = e;
								return errorObj;
							}
						}

						function tryCatch ( fn ) {
							tryCatchTarget = fn;
							return tryCatcher;
						}

						var inherits = function ( Child, Parent ) {
							var hasProp = {}.hasOwnProperty;

							function T () {
								this.constructor = Child;
								this.constructor$ = Parent;
								for ( var propertyName in Parent.prototype ) {
									if ( hasProp.call( Parent.prototype, propertyName ) &&
										propertyName.charAt( propertyName.length - 1 ) !== "$"
									) {
										this[ propertyName + "$" ] = Parent.prototype[ propertyName ];
									}
								}
							}

							T.prototype = Parent.prototype;
							Child.prototype = new T();
							return Child.prototype;
						};


						function isPrimitive ( val ) {
							return val == null || val === true || val === false ||
								typeof val === "string" || typeof val === "number";

						}

						function isObject ( value ) {
							return !isPrimitive( value );
						}

						function maybeWrapAsError ( maybeError ) {
							if ( !isPrimitive( maybeError ) ) return maybeError;

							return new Error( safeToString( maybeError ) );
						}

						function withAppended ( target, appendee ) {
							var len = target.length;
							var ret = new Array( len + 1 );
							var i;
							for ( i = 0; i < len; ++i ) {
								ret[ i ] = target[ i ];
							}
							ret[ i ] = appendee;
							return ret;
						}

						function getDataPropertyOrDefault ( obj, key, defaultValue ) {
							if ( es5.isES5 ) {
								var desc = Object.getOwnPropertyDescriptor( obj, key );

								if ( desc != null ) {
									return desc.get == null && desc.set == null
										? desc.value
										: defaultValue;
								}
							} else {
								return {}.hasOwnProperty.call( obj, key ) ? obj[ key ] : undefined;
							}
						}

						function notEnumerableProp ( obj, name, value ) {
							if ( isPrimitive( obj ) ) return obj;
							var descriptor = {
								value: value,
								configurable: true,
								enumerable: false,
								writable: true
							};
							es5.defineProperty( obj, name, descriptor );
							return obj;
						}

						function thrower ( r ) {
							throw r;
						}

						var inheritedDataKeys = (function () {
							var excludedPrototypes = [
								Array.prototype,
								Object.prototype,
								Function.prototype
							];

							var isExcludedProto = function ( val ) {
								for ( var i = 0; i < excludedPrototypes.length; ++i ) {
									if ( excludedPrototypes[ i ] === val ) {
										return true;
									}
								}
								return false;
							};

							if ( es5.isES5 ) {
								var getKeys = Object.getOwnPropertyNames;
								return function ( obj ) {
									var ret = [];
									var visitedKeys = Object.create( null );
									while ( obj != null && !isExcludedProto( obj ) ) {
										var keys;
										try {
											keys = getKeys( obj );
										} catch ( e ) {
											return ret;
										}
										for ( var i = 0; i < keys.length; ++i ) {
											var key = keys[ i ];
											if ( visitedKeys[ key ] ) continue;
											visitedKeys[ key ] = true;
											var desc = Object.getOwnPropertyDescriptor( obj, key );
											if ( desc != null && desc.get == null && desc.set == null ) {
												ret.push( key );
											}
										}
										obj = es5.getPrototypeOf( obj );
									}
									return ret;
								};
							} else {
								var hasProp = {}.hasOwnProperty;
								return function ( obj ) {
									if ( isExcludedProto( obj ) ) return [];
									var ret = [];

									/*jshint forin:false */
									enumeration: for ( var key in obj ) {
										if ( hasProp.call( obj, key ) ) {
											ret.push( key );
										} else {
											for ( var i = 0; i < excludedPrototypes.length; ++i ) {
												if ( hasProp.call( excludedPrototypes[ i ], key ) ) {
													continue enumeration;
												}
											}
											ret.push( key );
										}
									}
									return ret;
								};
							}

						})();

						var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;

						function isClass ( fn ) {
							try {
								if ( typeof fn === "function" ) {
									var keys = es5.names( fn.prototype );

									var hasMethods = es5.isES5 && keys.length > 1;
									var hasMethodsOtherThanConstructor = keys.length > 0 && !(keys.length === 1 && keys[ 0 ] === "constructor");
									var hasThisAssignmentAndStaticMethods =
										thisAssignmentPattern.test( fn + "" ) && es5.names( fn ).length > 0;

									if ( hasMethods || hasMethodsOtherThanConstructor ||
										hasThisAssignmentAndStaticMethods ) {
										return true;
									}
								}
								return false;
							} catch ( e ) {
								return false;
							}
						}

						function toFastProperties ( obj ) {
							/*jshint -W027,-W055,-W031*/
							function f () {
							}

							f.prototype = obj;
							var l = 8;
							while ( l-- ) new f();
							return obj;
							eval( obj );
						}

						var rident = /^[a-z$_][a-z$_0-9]*$/i;

						function isIdentifier ( str ) {
							return rident.test( str );
						}

						function filledRange ( count, prefix, suffix ) {
							var ret = new Array( count );
							for ( var i = 0; i < count; ++i ) {
								ret[ i ] = prefix + i + suffix;
							}
							return ret;
						}

						function safeToString ( obj ) {
							try {
								return obj + "";
							} catch ( e ) {
								return "[no string representation]";
							}
						}

						function markAsOriginatingFromRejection ( e ) {
							try {
								notEnumerableProp( e, "isOperational", true );
							}
							catch ( ignore ) {
							}
						}

						function originatesFromRejection ( e ) {
							if ( e == null ) return false;
							return ((e instanceof Error[ "__BluebirdErrorTypes__" ].OperationalError) ||
							e[ "isOperational" ] === true);
						}

						function canAttachTrace ( obj ) {
							return obj instanceof Error && es5.propertyIsWritable( obj, "stack" );
						}

						var ensureErrorObject = (function () {
							if ( !("stack" in new Error()) ) {
								return function ( value ) {
									if ( canAttachTrace( value ) ) return value;
									try {
										throw new Error( safeToString( value ) );
									}
									catch ( err ) {
										return err;
									}
								};
							} else {
								return function ( value ) {
									if ( canAttachTrace( value ) ) return value;
									return new Error( safeToString( value ) );
								};
							}
						})();

						function classString ( obj ) {
							return {}.toString.call( obj );
						}

						function copyDescriptors ( from, to, filter ) {
							var keys = es5.names( from );
							for ( var i = 0; i < keys.length; ++i ) {
								var key = keys[ i ];
								if ( filter( key ) ) {
									try {
										es5.defineProperty( to, key, es5.getDescriptor( from, key ) );
									} catch ( ignore ) {
									}
								}
							}
						}

						var ret = {
							isClass: isClass,
							isIdentifier: isIdentifier,
							inheritedDataKeys: inheritedDataKeys,
							getDataPropertyOrDefault: getDataPropertyOrDefault,
							thrower: thrower,
							isArray: es5.isArray,
							haveGetters: haveGetters,
							notEnumerableProp: notEnumerableProp,
							isPrimitive: isPrimitive,
							isObject: isObject,
							canEvaluate: canEvaluate,
							errorObj: errorObj,
							tryCatch: tryCatch,
							inherits: inherits,
							withAppended: withAppended,
							maybeWrapAsError: maybeWrapAsError,
							toFastProperties: toFastProperties,
							filledRange: filledRange,
							toString: safeToString,
							canAttachTrace: canAttachTrace,
							ensureErrorObject: ensureErrorObject,
							originatesFromRejection: originatesFromRejection,
							markAsOriginatingFromRejection: markAsOriginatingFromRejection,
							classString: classString,
							copyDescriptors: copyDescriptors,
							hasDevTools: typeof chrome !== "undefined" && chrome &&
							typeof chrome.loadTimes === "function",
							isNode: typeof process !== "undefined" &&
							classString( process ).toLowerCase() === "[object process]"
						};
						ret.isRecentNode = ret.isNode && (function () {
								var version = process.versions.node.split( "." ).map( Number );
								return (version[ 0 ] === 0 && version[ 1 ] > 10) || (version[ 0 ] > 0);
							})();

						if ( ret.isNode ) ret.toFastProperties( process );

						try {
							throw new Error();
						} catch ( e ) {
							ret.lastLineError = e;
						}
						module.exports = ret;

					}, { "./es5.js": 14 } ]
				}, {}, [ 4 ] )( 4 )
			} );
			;
			if ( typeof window !== 'undefined' && window !== null ) {
				window.P = window.Promise;
			} else if ( typeof self !== 'undefined' && self !== null ) {
				self.P = self.Promise;
			}
			/* WEBPACK VAR INJECTION */
		}.call( exports, __webpack_require__( 6 ), (function () {
				return this;
			}()), __webpack_require__( 10 ).setImmediate ))

		/***/
	},
	/* 10 */
	/***/ function ( module, exports, __webpack_require__ ) {

		/* WEBPACK VAR INJECTION */
		(function ( setImmediate, clearImmediate ) {
			var nextTick = __webpack_require__( 6 ).nextTick;
			var apply = Function.prototype.apply;
			var slice = Array.prototype.slice;
			var immediateIds = {};
			var nextImmediateId = 0;

			// DOM APIs, for completeness

			exports.setTimeout = function () {
				return new Timeout( apply.call( setTimeout, window, arguments ), clearTimeout );
			};
			exports.setInterval = function () {
				return new Timeout( apply.call( setInterval, window, arguments ), clearInterval );
			};
			exports.clearTimeout =
				exports.clearInterval = function ( timeout ) {
					timeout.close();
				};

			function Timeout ( id, clearFn ) {
				this._id = id;
				this._clearFn = clearFn;
			}

			Timeout.prototype.unref = Timeout.prototype.ref = function () {
			};
			Timeout.prototype.close = function () {
				this._clearFn.call( window, this._id );
			};

			// Does not start the time, just sets up the members needed.
			exports.enroll = function ( item, msecs ) {
				clearTimeout( item._idleTimeoutId );
				item._idleTimeout = msecs;
			};

			exports.unenroll = function ( item ) {
				clearTimeout( item._idleTimeoutId );
				item._idleTimeout = -1;
			};

			exports._unrefActive = exports.active = function ( item ) {
				clearTimeout( item._idleTimeoutId );

				var msecs = item._idleTimeout;
				if ( msecs >= 0 ) {
					item._idleTimeoutId = setTimeout( function onTimeout () {
						if ( item._onTimeout )
							item._onTimeout();
					}, msecs );
				}
			};

			// That's not how node.js implements it but the exposed api is the same.
			exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function ( fn ) {
				var id = nextImmediateId++;
				var args = arguments.length < 2 ? false : slice.call( arguments, 1 );

				immediateIds[ id ] = true;

				nextTick( function onNextTick () {
					if ( immediateIds[ id ] ) {
						// fn.call() is faster so we optimize for the common use-case
						// @see http://jsperf.com/call-apply-segu
						if ( args ) {
							fn.apply( null, args );
						} else {
							fn.call( null );
						}
						// Prevent ids from leaking
						exports.clearImmediate( id );
					}
				} );

				return id;
			};

			exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function ( id ) {
				delete immediateIds[ id ];
			};
			/* WEBPACK VAR INJECTION */
		}.call( exports, __webpack_require__( 10 ).setImmediate, __webpack_require__( 10 ).clearImmediate ))

		/***/
	},
	/* 11 */
	/***/ function ( module, exports ) {

		"use strict";

		module.exports.defer = function ( onFulfill, onReject ) {
			return {
				_queue: [ {
					onFulfill: onFulfill,
					onReject: onReject
				} ],
				then: function ( onFulfill, onReject ) {
					this._queue.push( {
						onFulfill: onFulfill,
						onReject: onReject
					} );

					return this;
				}
			}
		};

		/***/
	},
	/* 12 */
	/***/ function ( module, exports ) {

		Object.defineProperty( Function.prototype, 'extends', {
			value: extend,
			writable: false,
			enumerable: false,
			configurable: false
		} );

		function extend ( Parent ) {

			var thisClassName = this.name || getFuncName( this ),
				parentClassName = Parent.name || getFuncName( Parent );

			function getFuncName ( func ) {
				var funcNameRegExp = /^function\s*([^\s(]+)/;
				return funcNameRegExp.exec( func.toString() )[ 1 ];
			}

			function getFunctionArgs ( func ) {
				var result = /function[\w\s\$_]*\(([\w\s,]*)[\/\*]*\)/g.exec( func.toString() );

				return {
					args: result[ 1 ].trim()
				}
			}

			function rootClass ( func ) {
				var thisClassName = func.name,
					thisProtoKeys = Object.keys( func.prototype ),
					thisProtoKeysLength = thisProtoKeys.length,
					i;

				if ( !thisClassName ) { //if function.name not working
					var functionNameRegExp = /^function\s*([^\s(]+)/;
					thisClassName = functionNameRegExp.exec( func.toString() )[ 1 ];
				}

				func.prototype.inheritChain = [ thisClassName ];

				for ( i = 0; i < thisProtoKeysLength; i++ ) {
					if ( typeof func.prototype[ thisProtoKeys[ i ] ] === 'function' ) {
						func.prototype[ thisClassName + '$' + thisProtoKeys[ i ] ] = func.prototype[ thisProtoKeys[ i ] ];
						func.prototype[ thisProtoKeys[ i ] ] = func.prototype[ thisClassName + '$' + thisProtoKeys[ i ] ];

						func.prototype[ thisClassName + '$' + thisProtoKeys[ i ] ].inherited = true;
					}
				}
			}


			if ( !Parent.prototype.inheritChain ) {
				rootClass( Parent );
			}

			//extend this prototype
			this.prototype.inheritChain = Array.prototype.slice.call( Parent.prototype.inheritChain );
			this.prototype.inheritChain.push( thisClassName );

			this.prototype.activeSuperContext = thisClassName;
			this.prototype.changeSuperContext = function () {
				var inheritChainLen = this.inheritChain.length;

				for ( var i = inheritChainLen; i > -1; i-- ) {
					if ( this.activeSuperContext === this.inheritChain[ i ] ) break;
				}

				this.activeSuperContext = this.inheritChain[ i - 1 ];
			};

			var parentConstructor = getFunctionArgs( Parent.toString() );

			this.prototype[ parentClassName + '$constructor' ] = Parent;

			this.prototype[ parentClassName + '$constructor' ].inherited = true;

			this.prototype.super = eval.call( null, '(function superFn(' + parentConstructor.args + ') {' +
				'this.changeSuperContext(); ' +
				'var i = this.activeSuperContext + \'$constructor\';' +
				'this[i](' + parentConstructor.args + ');' +
				'this.activeSuperContext = \'' + thisClassName + '\'; })' );

			var thisProtoKeys = Object.keys( this.prototype ),
				parentProtoKeys = Object.keys( Parent.prototype ),
				thisProtoKeysLength = thisProtoKeys.length,
				parentProtoKeysLength = parentProtoKeys.length,
				funcInStr,
				i;

			function intersect ( x, y ) {
				var ret = [],
					x_len = x.length,
					y_len = y.length;

				for ( var i = 0; i < x_len; i++ ) {
					for ( var z = 0; z < y_len; z++ ) {
						if ( x[ i ] === y[ z ] ) {
							ret.push( x[ i ] );
							break;
						}
					}
				}

				return ret;
			}

			var hasInThisPrototype = (function ( thisProto, parentProto ) {
				var intersection = intersect( parentProto, thisProto ),
					inter_len = intersection.length,
					result = {};

				for ( var i = 0; i < inter_len; i++ ) {
					result[ intersection[ i ] ] = true;
				}

				return result;
			})( thisProtoKeys, parentProtoKeys );

			for ( i = 0; i < parentProtoKeysLength; i++ ) {
				if ( !hasInThisPrototype[ parentProtoKeys[ i ] ] ) {
					if ( typeof Parent.prototype[ parentProtoKeys[ i ] ] === 'function' ) {
						if ( Parent.prototype[ parentProtoKeys[ i ] ].inherited ) {
							this.prototype[ parentProtoKeys[ i ] ] = Parent.prototype[ parentProtoKeys[ i ] ];
						} else {
							this.prototype[ parentClassName + '$' + parentProtoKeys[ i ] ] = Parent.prototype[ parentProtoKeys[ i ] ];

							this.prototype[ parentProtoKeys[ i ] ] = this.prototype[ parentClassName + '$' + parentProtoKeys[ i ] ];

							this.prototype[ parentProtoKeys[ i ] ].inherited = true;
						}
					} else {
						this.prototype[ parentProtoKeys[ i ] ] = Parent.prototype[ parentProtoKeys[ i ] ];
					}
				}
			}

			if ( Parent.prototype.super ) {
				var superKeys = Object.keys( Parent.prototype.super ),
					superKeysLen = superKeys.length;

				for ( i = 0; i < superKeysLen; i++ ) {
					this.prototype.super[ superKeys[ i ] ] = Parent.prototype.super[ superKeys[ i ] ];
				}
			}

			for ( i = 0; i < thisProtoKeysLength; i++ ) {
				if ( typeof this.prototype[ thisProtoKeys[ i ] ] === 'function' ) {
					funcInStr = getFunctionArgs( this.prototype[ thisProtoKeys[ i ] ] );

					this.prototype[ thisClassName + '$' + thisProtoKeys[ i ] ] = this.prototype[ thisProtoKeys[ i ] ];

					this.prototype[ thisProtoKeys[ i ] ] = this.prototype[ thisClassName + '$' + thisProtoKeys[ i ] ];

					this.prototype.super[ thisProtoKeys[ i ] ] = eval.call( null, '(function super$' + thisProtoKeys[ i ] + '(' + funcInStr.args + ') {' +
						'this.activeSuperContext = \'' + thisClassName + '\';' +
						'this.changeSuperContext(); ' +
						'var i = this.activeSuperContext + \'$' + thisProtoKeys[ i ] + '\';' +
						'var res = this[i](' + funcInStr.args + ');' +
						'this.activeSuperContext = \'' + thisClassName + '\';' +
						'return res; })'
					);
				}
			}
		}

		/***/
	},
	/* 13 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		Object.defineProperty( exports, '__esModule', {
			value: true
		} );

		function _interopRequireDefault ( obj ) {
			return obj && obj.__esModule ? obj : { 'default': obj };
		}

		var _baseView = __webpack_require__( 14 );

		var _baseView2 = _interopRequireDefault( _baseView );

		function BaseCollectionView () {
		}

		BaseCollectionView.prototype = {

			template: void 0,

			render: function render ( collection ) {
				if ( !this.rootNode ) {
					throw new Error( 'RootNode not specified' );
				}

				var new_vdom = this.renderTpl( this.template( {
					collection: this.traverse( collection )
				} ) );

				this[ 'super' ].render.call( this, new_vdom );
			},

			init: function init () {
				if ( !this.templates ) {
					throw new Error( 'Templates not specified' );
				}

				if ( !this.template ) {
					throw new Error( 'Template not specified' );
				}

				this[ 'super' ].init.call( this );
			},

			traverse: function traverse ( collection ) {
				if ( !collection ) {
					return '';
				}

				if ( Object.prototype.toString.call( collection ) !== '[object Array]' ) {
					throw new Error( 'Collection must be an Array' );
				}

				var length = collection.length,
					i = 0,
					classHasFilterFunc = this.checkClassHasFilterFunc(),
					filterFunc = undefined;

				if ( classHasFilterFunc ) {
					filterFunc = function ( item, index ) {
						var curAC = this.activeSuperContext;
						this.activeSuperContext = this.inheritChain[ this.inheritChain.length - 1 ];
						var res = this.filter( item, index );
						this.activeSuperContext = curAC;
						return res;
					};
				} else {
					filterFunc = (function ( context ) {
						var firstInCol = Object.keys( context.templates )[ 0 ];
						return function ( item ) {
							return context.templates[ firstInCol ]( item );
						};
					})( this );
				}

				var result = [];

				for ( ; i < length; i++ ) {
					result.push( filterFunc.call( this, collection[ i ], i ) );
				}

				return result;
			},

			checkClassHasFilterFunc: function checkClassHasFilterFunc () {
				var curAC = this.activeSuperContext,
					flag = false;

				this.activeSuperContext = this.inheritChain[ this.inheritChain.length - 1 ];
				if ( this[ this.activeSuperContext + '$filter' ] ) {
					flag = true;
				}
				this.activeSuperContext = curAC;

				return flag;
			}

		};

		BaseCollectionView[ 'extends' ]( _baseView2[ 'default' ] );

		exports[ 'default' ] = BaseCollectionView;
		module.exports = exports[ 'default' ];

		/***/
	},
	/* 14 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		Object.defineProperty( exports, '__esModule', {
			value: true
		} );

		function _interopRequireDefault ( obj ) {
			return obj && obj.__esModule ? obj : { 'default': obj };
		}

		var _virtualDom = __webpack_require__( 15 );

		var _virtualDom2 = _interopRequireDefault( _virtualDom );

		var _util = __webpack_require__( 50 );

		//from base-components

		var _baseComponents = __webpack_require__( 2 );

		// hack for use AttributeHook from https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/hooks/attribute-hook.js
		// used for svg support

		var _svgAttributeHook = __webpack_require__( 51 );

		//savelichalex: for use views on server by node.js and for tests must check environment
		//i think that must use views on server just returning html if this is need

		var _svgAttributeHook2 = _interopRequireDefault( _svgAttributeHook );

		var diff = _virtualDom2[ 'default' ].diff;
		var patch = _virtualDom2[ 'default' ].patch;
		var createElement = _virtualDom2[ 'default' ].create;
		var h = _virtualDom2[ 'default' ].h;

		var isBrowser = typeof window !== 'undefined';

		/**
		 * Base class for views
		 * Offers methods for create events, render model with virtual-dom and
		 * methods to work with own emitter to create events. That's help to tell
		 * to another object that something happened
		 * @constructor
		 */
		function BaseView () {

			this._listeners = {};

			if ( this.events ) {
				this._createEvents( this.events );
			}

			this._emitter = (0, _baseComponents.Emitter)();
			this._emitter.name = this.inheritChain[ this.inheritChain.length - 1 ];

			this._vdom = void 0;
			this._vdomNode = void 0;
		}

		BaseView.prototype = {

			/**
			 * Contain functions to prevent create closure for this
			 * @private
			 */
			_util: {
				emitter: _baseComponents.Emitter,
				defer: _baseComponents.defer,
				addEvent: _util.addEvent
			},

			/**
			 * Used for evaluate hypertext returned form template
			 * @param ht {String} Hypertext (virtual-dom/h) that created in
			 * overrided render method in child class
			 * @returns {Object} VNode
			 * @protected
			 */
			renderTpl: function renderTpl ( ht ) {
				var h = h;
				var SVGAttributeHook = svgAttributeHook;
				return eval( ht );
			},

			/**
			 * Main view function, that must be override by child classes
			 * @param new_vdom VNode from child overrided render method
			 * @returns {VNode} if this is not browser environment
			 * @public
			 */
			render: function render ( new_vdom ) {
				if ( this._vdom ) {
					var patches = diff( this._vdom, new_vdom );
					this._vdomNode = patch( this._vdomNode, patches );
				} else {
					this._vdomNode = createElement( new_vdom );
				}
				this._vdom = new_vdom;

				this._initRootNode();

				if ( isBrowser ) {
					this.rootNode.appendChild( this._vdomNode );

					this.trigger( 'renderComplete' );
				} else {
					return this._vdom;
				}
			},

			/**
			 * Initialise root node if this not done yet
			 * @throws {Error} if root node not specified in child class
			 * @private
			 */
			_initRootNode: function _initRootNode () {
				if ( !this.rootNode ) {
					throw new Error( 'RootNode not specified in ' + this.inheritChain[ this.inheritChain.length - 1 ] );
				}
				if ( Object.prototype.toString.call( this.rootNode ) === "[object String]" ) {
					if ( isBrowser ) {
						this.rootNode = document.querySelector( this.rootNode );
					}
					if ( !this.rootNode ) {
						console.warn( this.rootNode + ' not found on document' );
					}
				}
			},

			/**
			 * Create event handlers which specified in child class.
			 * Main part of events creation is that only root view node
			 * have event listeners for all specified events.
			 * It is based on fact that event can bubble to parent node.
			 * With this in mind, you can decrease event listeners in your code,
			 * hence saving memory and help compiler to optimise hot function
			 * @param events {Object}
			 * @throws {Error} if events object is not a hash object
			 * @throws {Error} if not valid event declaration
			 * @private
			 * TODO: right event handling for not bubble events
			 */
			_createEvents: function _createEvents ( events ) {
				if ( Object.prototype.toString.call( events ) !== "[object Object]" ) {
					throw new Error( 'Events must be a hash object' );
				}

				for ( var _event in events ) {
					if ( events.hasOwnProperty( _event ) ) {
						var event_arr = _event.split( ' ' );
						var type = event_arr[ 0 ];
						var target = event_arr[ 1 ];

						if ( !target ) {
							throw new Error( 'Event must be with target node' );
						}

						var prevent = false;
						if ( event_arr.length > 2 && event_arr[ 2 ] === 'preventDefault' ) {
							prevent = true;
						}

						if ( !this._listeners[ type ] ) {
							this._listeners[ type ] = {};

							this._initRootNode();

							if ( isBrowser ) {
								this._util.addEvent( this.rootNode, type, this._searchListener( this, this.rootNode ) );
							}
						}

						var listener = events[ _event ];

						if ( Object.prototype.toString.call( listener ) !== "[object Object]" && !listener._queue ) {
							if ( Object.prototype.toString.call( listener ) === "[object Function]" ) {
								listener = this._util.defer( listener );
							} else {
								throw new Error( 'Callback must be a function' );
							}
						}

						this._listeners[ type ][ target ] = listener;
						this._listeners[ type ][ target ].prevent = prevent;
					}
				}
			},

			/**
			 * Create function that used as callback to event listener
			 * @param context
			 * @param rootNode
			 * @returns {Function}
			 * @private
			 */
			_searchListener: function _searchListener ( context, rootNode ) {
				return function ( event ) {
					//event = event.originalEvent; //because use jQuery, temp
					var target = event.target;

					function searchByTarget ( target, context ) {
						target = {
							tag: target.nodeName.toLowerCase(),
							className: target.className,
							id: target.id
						};
						var eventType = event.type;

						function searchInListeners ( target, context ) {
							var listener = context._listeners[ eventType ][ target ];
							if ( listener ) {
								var _ret = (function () {
									if ( listener.prevent ) {
										event.preventDefault();
									}
									var _resolve = undefined;
									var promise = new Promise( function ( resolve ) {
										_resolve = resolve;
									} );
									listener._queue.forEach( function ( o ) {
										promise = promise.bind( context ).then( o.onFulfill, o.onReject );
									} );
									_resolve( event );

									return {
										v: true
									};
								})();

								if ( typeof _ret === 'object' ) return _ret.v;
							} else {
								return false;
							}
						}

						var hasListener = false;
						if ( !searchInListeners( target.tag, context ) ) {
							//TODO: not search when target does not have class or id
							if ( target.className && typeof target.className === 'string' ) {
								var classes = target.className.split( ' ' );
								classes.forEach( function ( className ) {
									if ( searchInListeners( '.' + className, context ) ) {
										//TODO: multyple classes
										hasListener = true;
									}
								} );
							}

							if ( target.id && !hasListener ) {
								if ( searchInListeners( '#' + target.id, context ) ) {
									hasListener = true;
								}
							}
						} else {
							hasListener = true;
						}

						return hasListener;
					}

					while ( target ) {
						if ( !searchByTarget( target, context ) ) {
							//TODO: for example mouseout target is not rootNode or his children (not search)
							if ( target === rootNode ) {
								break;
							} else {
								target = target.parentNode;
							}
						} else {
							break;
						}
					}
					event.stopPropagation();
				};
			},

			/**
			 * Short method to use emitter
			 * @param event
			 * @param context
			 * @returns {*}
			 */
			on: function on ( event, context ) {
				return this._emitter.on( event, context );
			},

			/**
			 * Short method to use emitter
			 * @param event
			 * @param context
			 * @returns {*}
			 */
			once: function once ( event, context ) {
				return this._emitter.once( event, context );
			},

			/**
			 * Short method to use emitter
			 * @param event
			 * @param data
			 * @returns {*}
			 */
			trigger: function trigger ( event, data ) {
				return this._emitter.trigger( event, data );
			}
		};

		exports[ 'default' ] = BaseView;
		module.exports = exports[ 'default' ];

		/***/
	},
	/* 15 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var diff = __webpack_require__( 29 )
		var patch = __webpack_require__( 34 )
		var h = __webpack_require__( 39 )
		var create = __webpack_require__( 16 )
		var VNode = __webpack_require__( 41 )
		var VText = __webpack_require__( 42 )

		module.exports = {
			diff: diff,
			patch: patch,
			h: h,
			create: create,
			VNode: VNode,
			VText: VText
		}


		/***/
	},
	/* 16 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var createElement = __webpack_require__( 17 )

		module.exports = createElement


		/***/
	},
	/* 17 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var document = __webpack_require__( 20 )

		var applyProperties = __webpack_require__( 22 )

		var isVNode = __webpack_require__( 25 )
		var isVText = __webpack_require__( 18 )
		var isWidget = __webpack_require__( 26 )
		var handleThunk = __webpack_require__( 27 )

		module.exports = createElement

		function createElement ( vnode, opts ) {
			var doc = opts ? opts.document || document : document
			var warn = opts ? opts.warn : null

			vnode = handleThunk( vnode ).a

			if ( isWidget( vnode ) ) {
				return vnode.init()
			} else if ( isVText( vnode ) ) {
				return doc.createTextNode( vnode.text )
			} else if ( !isVNode( vnode ) ) {
				if ( warn ) {
					warn( "Item is not a valid virtual dom node", vnode )
				}
				return null
			}

			var node = (vnode.namespace === null) ?
				doc.createElement( vnode.tagName ) :
				doc.createElementNS( vnode.namespace, vnode.tagName )

			var props = vnode.properties
			applyProperties( node, props )

			var children = vnode.children

			for ( var i = 0; i < children.length; i++ ) {
				var childNode = createElement( children[ i ], opts )
				if ( childNode ) {
					node.appendChild( childNode )
				}
			}

			return node
		}


		/***/
	},
	/* 18 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var version = __webpack_require__( 19 )

		module.exports = isVirtualText

		function isVirtualText ( x ) {
			return x && x.type === "VirtualText" && x.version === version
		}


		/***/
	},
	/* 19 */
	/***/ function ( module, exports ) {

		module.exports = "2"


		/***/
	},
	/* 20 */
	/***/ function ( module, exports, __webpack_require__ ) {

		/* WEBPACK VAR INJECTION */
		(function ( global ) {
			var topLevel = typeof global !== 'undefined' ? global :
				typeof window !== 'undefined' ? window : {}
			var minDoc = __webpack_require__( 21 );

			if ( typeof document !== 'undefined' ) {
				module.exports = document;
			} else {
				var doccy = topLevel[ '__GLOBAL_DOCUMENT_CACHE@4' ];

				if ( !doccy ) {
					doccy = topLevel[ '__GLOBAL_DOCUMENT_CACHE@4' ] = minDoc;
				}

				module.exports = doccy;
			}

			/* WEBPACK VAR INJECTION */
		}.call( exports, (function () {
				return this;
			}()) ))

		/***/
	},
	/* 21 */
	/***/ function ( module, exports ) {

		/* (ignored) */

		/***/
	},
	/* 22 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var isObject = __webpack_require__( 23 )
		var isHook = __webpack_require__( 24 )

		module.exports = applyProperties

		function applyProperties ( node, props, previous ) {
			for ( var propName in props ) {
				var propValue = props[ propName ]

				if ( propValue === undefined ) {
					removeProperty( node, propName, propValue, previous );
				} else if ( isHook( propValue ) ) {
					removeProperty( node, propName, propValue, previous )
					if ( propValue.hook ) {
						propValue.hook( node,
							propName,
							previous ? previous[ propName ] : undefined )
					}
				} else {
					if ( isObject( propValue ) ) {
						patchObject( node, props, previous, propName, propValue );
					} else {
						node[ propName ] = propValue
					}
				}
			}
		}

		function removeProperty ( node, propName, propValue, previous ) {
			if ( previous ) {
				var previousValue = previous[ propName ]

				if ( !isHook( previousValue ) ) {
					if ( propName === "attributes" ) {
						for ( var attrName in previousValue ) {
							node.removeAttribute( attrName )
						}
					} else if ( propName === "style" ) {
						for ( var i in previousValue ) {
							node.style[ i ] = ""
						}
					} else if ( typeof previousValue === "string" ) {
						node[ propName ] = ""
					} else {
						node[ propName ] = null
					}
				} else if ( previousValue.unhook ) {
					previousValue.unhook( node, propName, propValue )
				}
			}
		}

		function patchObject ( node, props, previous, propName, propValue ) {
			var previousValue = previous ? previous[ propName ] : undefined

			// Set attributes
			if ( propName === "attributes" ) {
				for ( var attrName in propValue ) {
					var attrValue = propValue[ attrName ]

					if ( attrValue === undefined ) {
						node.removeAttribute( attrName )
					} else {
						node.setAttribute( attrName, attrValue )
					}
				}

				return
			}

			if ( previousValue && isObject( previousValue ) &&
				getPrototype( previousValue ) !== getPrototype( propValue ) ) {
				node[ propName ] = propValue
				return
			}

			if ( !isObject( node[ propName ] ) ) {
				node[ propName ] = {}
			}

			var replacer = propName === "style" ? "" : undefined

			for ( var k in propValue ) {
				var value = propValue[ k ]
				node[ propName ][ k ] = (value === undefined) ? replacer : value
			}
		}

		function getPrototype ( value ) {
			if ( Object.getPrototypeOf ) {
				return Object.getPrototypeOf( value )
			} else if ( value.__proto__ ) {
				return value.__proto__
			} else if ( value.constructor ) {
				return value.constructor.prototype
			}
		}


		/***/
	},
	/* 23 */
	/***/ function ( module, exports ) {

		"use strict";

		module.exports = function isObject ( x ) {
			return typeof x === "object" && x !== null;
		};


		/***/
	},
	/* 24 */
	/***/ function ( module, exports ) {

		module.exports = isHook

		function isHook ( hook ) {
			return hook &&
				(typeof hook.hook === "function" && !hook.hasOwnProperty( "hook" ) ||
				typeof hook.unhook === "function" && !hook.hasOwnProperty( "unhook" ))
		}


		/***/
	},
	/* 25 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var version = __webpack_require__( 19 )

		module.exports = isVirtualNode

		function isVirtualNode ( x ) {
			return x && x.type === "VirtualNode" && x.version === version
		}


		/***/
	},
	/* 26 */
	/***/ function ( module, exports ) {

		module.exports = isWidget

		function isWidget ( w ) {
			return w && w.type === "Widget"
		}


		/***/
	},
	/* 27 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var isVNode = __webpack_require__( 25 )
		var isVText = __webpack_require__( 18 )
		var isWidget = __webpack_require__( 26 )
		var isThunk = __webpack_require__( 28 )

		module.exports = handleThunk

		function handleThunk ( a, b ) {
			var renderedA = a
			var renderedB = b

			if ( isThunk( b ) ) {
				renderedB = renderThunk( b, a )
			}

			if ( isThunk( a ) ) {
				renderedA = renderThunk( a, null )
			}

			return {
				a: renderedA,
				b: renderedB
			}
		}

		function renderThunk ( thunk, previous ) {
			var renderedThunk = thunk.vnode

			if ( !renderedThunk ) {
				renderedThunk = thunk.vnode = thunk.render( previous )
			}

			if ( !(isVNode( renderedThunk ) ||
				isVText( renderedThunk ) ||
				isWidget( renderedThunk )) ) {
				throw new Error( "thunk did not return a valid node" );
			}

			return renderedThunk
		}


		/***/
	},
	/* 28 */
	/***/ function ( module, exports ) {

		module.exports = isThunk

		function isThunk ( t ) {
			return t && t.type === "Thunk"
		}


		/***/
	},
	/* 29 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var diff = __webpack_require__( 30 )

		module.exports = diff


		/***/
	},
	/* 30 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var isArray = __webpack_require__( 31 )

		var VPatch = __webpack_require__( 32 )
		var isVNode = __webpack_require__( 25 )
		var isVText = __webpack_require__( 18 )
		var isWidget = __webpack_require__( 26 )
		var isThunk = __webpack_require__( 28 )
		var handleThunk = __webpack_require__( 27 )

		var diffProps = __webpack_require__( 33 )

		module.exports = diff

		function diff ( a, b ) {
			var patch = { a: a }
			walk( a, b, patch, 0 )
			return patch
		}

		function walk ( a, b, patch, index ) {
			if ( a === b ) {
				return
			}

			var apply = patch[ index ]
			var applyClear = false

			if ( isThunk( a ) || isThunk( b ) ) {
				thunks( a, b, patch, index )
			} else if ( b == null ) {

				// If a is a widget we will add a remove patch for it
				// Otherwise any child widgets/hooks must be destroyed.
				// This prevents adding two remove patches for a widget.
				if ( !isWidget( a ) ) {
					clearState( a, patch, index )
					apply = patch[ index ]
				}

				apply = appendPatch( apply, new VPatch( VPatch.REMOVE, a, b ) )
			} else if ( isVNode( b ) ) {
				if ( isVNode( a ) ) {
					if ( a.tagName === b.tagName &&
						a.namespace === b.namespace &&
						a.key === b.key ) {
						var propsPatch = diffProps( a.properties, b.properties )
						if ( propsPatch ) {
							apply = appendPatch( apply,
								new VPatch( VPatch.PROPS, a, propsPatch ) )
						}
						apply = diffChildren( a, b, patch, apply, index )
					} else {
						apply = appendPatch( apply, new VPatch( VPatch.VNODE, a, b ) )
						applyClear = true
					}
				} else {
					apply = appendPatch( apply, new VPatch( VPatch.VNODE, a, b ) )
					applyClear = true
				}
			} else if ( isVText( b ) ) {
				if ( !isVText( a ) ) {
					apply = appendPatch( apply, new VPatch( VPatch.VTEXT, a, b ) )
					applyClear = true
				} else if ( a.text !== b.text ) {
					apply = appendPatch( apply, new VPatch( VPatch.VTEXT, a, b ) )
				}
			} else if ( isWidget( b ) ) {
				if ( !isWidget( a ) ) {
					applyClear = true
				}

				apply = appendPatch( apply, new VPatch( VPatch.WIDGET, a, b ) )
			}

			if ( apply ) {
				patch[ index ] = apply
			}

			if ( applyClear ) {
				clearState( a, patch, index )
			}
		}

		function diffChildren ( a, b, patch, apply, index ) {
			var aChildren = a.children
			var orderedSet = reorder( aChildren, b.children )
			var bChildren = orderedSet.children

			var aLen = aChildren.length
			var bLen = bChildren.length
			var len = aLen > bLen ? aLen : bLen

			for ( var i = 0; i < len; i++ ) {
				var leftNode = aChildren[ i ]
				var rightNode = bChildren[ i ]
				index += 1

				if ( !leftNode ) {
					if ( rightNode ) {
						// Excess nodes in b need to be added
						apply = appendPatch( apply,
							new VPatch( VPatch.INSERT, null, rightNode ) )
					}
				} else {
					walk( leftNode, rightNode, patch, index )
				}

				if ( isVNode( leftNode ) && leftNode.count ) {
					index += leftNode.count
				}
			}

			if ( orderedSet.moves ) {
				// Reorder nodes last
				apply = appendPatch( apply, new VPatch(
					VPatch.ORDER,
					a,
					orderedSet.moves
				) )
			}

			return apply
		}

		function clearState ( vNode, patch, index ) {
			// TODO: Make this a single walk, not two
			unhook( vNode, patch, index )
			destroyWidgets( vNode, patch, index )
		}

		// Patch records for all destroyed widgets must be added because we need
		// a DOM node reference for the destroy function
		function destroyWidgets ( vNode, patch, index ) {
			if ( isWidget( vNode ) ) {
				if ( typeof vNode.destroy === "function" ) {
					patch[ index ] = appendPatch(
						patch[ index ],
						new VPatch( VPatch.REMOVE, vNode, null )
					)
				}
			} else if ( isVNode( vNode ) && (vNode.hasWidgets || vNode.hasThunks) ) {
				var children = vNode.children
				var len = children.length
				for ( var i = 0; i < len; i++ ) {
					var child = children[ i ]
					index += 1

					destroyWidgets( child, patch, index )

					if ( isVNode( child ) && child.count ) {
						index += child.count
					}
				}
			} else if ( isThunk( vNode ) ) {
				thunks( vNode, null, patch, index )
			}
		}

		// Create a sub-patch for thunks
		function thunks ( a, b, patch, index ) {
			var nodes = handleThunk( a, b )
			var thunkPatch = diff( nodes.a, nodes.b )
			if ( hasPatches( thunkPatch ) ) {
				patch[ index ] = new VPatch( VPatch.THUNK, null, thunkPatch )
			}
		}

		function hasPatches ( patch ) {
			for ( var index in patch ) {
				if ( index !== "a" ) {
					return true
				}
			}

			return false
		}

		// Execute hooks when two nodes are identical
		function unhook ( vNode, patch, index ) {
			if ( isVNode( vNode ) ) {
				if ( vNode.hooks ) {
					patch[ index ] = appendPatch(
						patch[ index ],
						new VPatch(
							VPatch.PROPS,
							vNode,
							undefinedKeys( vNode.hooks )
						)
					)
				}

				if ( vNode.descendantHooks || vNode.hasThunks ) {
					var children = vNode.children
					var len = children.length
					for ( var i = 0; i < len; i++ ) {
						var child = children[ i ]
						index += 1

						unhook( child, patch, index )

						if ( isVNode( child ) && child.count ) {
							index += child.count
						}
					}
				}
			} else if ( isThunk( vNode ) ) {
				thunks( vNode, null, patch, index )
			}
		}

		function undefinedKeys ( obj ) {
			var result = {}

			for ( var key in obj ) {
				result[ key ] = undefined
			}

			return result
		}

		// List diff, naive left to right reordering
		function reorder ( aChildren, bChildren ) {
			// O(M) time, O(M) memory
			var bChildIndex = keyIndex( bChildren )
			var bKeys = bChildIndex.keys
			var bFree = bChildIndex.free

			if ( bFree.length === bChildren.length ) {
				return {
					children: bChildren,
					moves: null
				}
			}

			// O(N) time, O(N) memory
			var aChildIndex = keyIndex( aChildren )
			var aKeys = aChildIndex.keys
			var aFree = aChildIndex.free

			if ( aFree.length === aChildren.length ) {
				return {
					children: bChildren,
					moves: null
				}
			}

			// O(MAX(N, M)) memory
			var newChildren = []

			var freeIndex = 0
			var freeCount = bFree.length
			var deletedItems = 0

			// Iterate through a and match a node in b
			// O(N) time,
			for ( var i = 0; i < aChildren.length; i++ ) {
				var aItem = aChildren[ i ]
				var itemIndex

				if ( aItem.key ) {
					if ( bKeys.hasOwnProperty( aItem.key ) ) {
						// Match up the old keys
						itemIndex = bKeys[ aItem.key ]
						newChildren.push( bChildren[ itemIndex ] )

					} else {
						// Remove old keyed items
						itemIndex = i - deletedItems++
						newChildren.push( null )
					}
				} else {
					// Match the item in a with the next free item in b
					if ( freeIndex < freeCount ) {
						itemIndex = bFree[ freeIndex++ ]
						newChildren.push( bChildren[ itemIndex ] )
					} else {
						// There are no free items in b to match with
						// the free items in a, so the extra free nodes
						// are deleted.
						itemIndex = i - deletedItems++
						newChildren.push( null )
					}
				}
			}

			var lastFreeIndex = freeIndex >= bFree.length ?
				bChildren.length :
				bFree[ freeIndex ]

			// Iterate through b and append any new keys
			// O(M) time
			for ( var j = 0; j < bChildren.length; j++ ) {
				var newItem = bChildren[ j ]

				if ( newItem.key ) {
					if ( !aKeys.hasOwnProperty( newItem.key ) ) {
						// Add any new keyed items
						// We are adding new items to the end and then sorting them
						// in place. In future we should insert new items in place.
						newChildren.push( newItem )
					}
				} else if ( j >= lastFreeIndex ) {
					// Add any leftover non-keyed items
					newChildren.push( newItem )
				}
			}

			var simulate = newChildren.slice()
			var simulateIndex = 0
			var removes = []
			var inserts = []
			var simulateItem

			for ( var k = 0; k < bChildren.length; ) {
				var wantedItem = bChildren[ k ]
				simulateItem = simulate[ simulateIndex ]

				// remove items
				while ( simulateItem === null && simulate.length ) {
					removes.push( remove( simulate, simulateIndex, null ) )
					simulateItem = simulate[ simulateIndex ]
				}

				if ( !simulateItem || simulateItem.key !== wantedItem.key ) {
					// if we need a key in this position...
					if ( wantedItem.key ) {
						if ( simulateItem && simulateItem.key ) {
							// if an insert doesn't put this key in place, it needs to move
							if ( bKeys[ simulateItem.key ] !== k + 1 ) {
								removes.push( remove( simulate, simulateIndex, simulateItem.key ) )
								simulateItem = simulate[ simulateIndex ]
								// if the remove didn't put the wanted item in place, we need to insert it
								if ( !simulateItem || simulateItem.key !== wantedItem.key ) {
									inserts.push( { key: wantedItem.key, to: k } )
								}
								// items are matching, so skip ahead
								else {
									simulateIndex++
								}
							}
							else {
								inserts.push( { key: wantedItem.key, to: k } )
							}
						}
						else {
							inserts.push( { key: wantedItem.key, to: k } )
						}
						k++
					}
					// a key in simulate has no matching wanted key, remove it
					else if ( simulateItem && simulateItem.key ) {
						removes.push( remove( simulate, simulateIndex, simulateItem.key ) )
					}
				}
				else {
					simulateIndex++
					k++
				}
			}

			// remove all the remaining nodes from simulate
			while ( simulateIndex < simulate.length ) {
				simulateItem = simulate[ simulateIndex ]
				removes.push( remove( simulate, simulateIndex, simulateItem && simulateItem.key ) )
			}

			// If the only moves we have are deletes then we can just
			// let the delete patch remove these items.
			if ( removes.length === deletedItems && !inserts.length ) {
				return {
					children: newChildren,
					moves: null
				}
			}

			return {
				children: newChildren,
				moves: {
					removes: removes,
					inserts: inserts
				}
			}
		}

		function remove ( arr, index, key ) {
			arr.splice( index, 1 )

			return {
				from: index,
				key: key
			}
		}

		function keyIndex ( children ) {
			var keys = {}
			var free = []
			var length = children.length

			for ( var i = 0; i < length; i++ ) {
				var child = children[ i ]

				if ( child.key ) {
					keys[ child.key ] = i
				} else {
					free.push( i )
				}
			}

			return {
				keys: keys,     // A hash of key name to index
				free: free      // An array of unkeyed item indices
			}
		}

		function appendPatch ( apply, patch ) {
			if ( apply ) {
				if ( isArray( apply ) ) {
					apply.push( patch )
				} else {
					apply = [ apply, patch ]
				}

				return apply
			} else {
				return patch
			}
		}


		/***/
	},
	/* 31 */
	/***/ function ( module, exports ) {

		var nativeIsArray = Array.isArray
		var toString = Object.prototype.toString

		module.exports = nativeIsArray || isArray

		function isArray ( obj ) {
			return toString.call( obj ) === "[object Array]"
		}


		/***/
	},
	/* 32 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var version = __webpack_require__( 19 )

		VirtualPatch.NONE = 0
		VirtualPatch.VTEXT = 1
		VirtualPatch.VNODE = 2
		VirtualPatch.WIDGET = 3
		VirtualPatch.PROPS = 4
		VirtualPatch.ORDER = 5
		VirtualPatch.INSERT = 6
		VirtualPatch.REMOVE = 7
		VirtualPatch.THUNK = 8

		module.exports = VirtualPatch

		function VirtualPatch ( type, vNode, patch ) {
			this.type = Number( type )
			this.vNode = vNode
			this.patch = patch
		}

		VirtualPatch.prototype.version = version
		VirtualPatch.prototype.type = "VirtualPatch"


		/***/
	},
	/* 33 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var isObject = __webpack_require__( 23 )
		var isHook = __webpack_require__( 24 )

		module.exports = diffProps

		function diffProps ( a, b ) {
			var diff

			for ( var aKey in a ) {
				if ( !(aKey in b) ) {
					diff = diff || {}
					diff[ aKey ] = undefined
				}

				var aValue = a[ aKey ]
				var bValue = b[ aKey ]

				if ( aValue === bValue ) {
					continue
				} else if ( isObject( aValue ) && isObject( bValue ) ) {
					if ( getPrototype( bValue ) !== getPrototype( aValue ) ) {
						diff = diff || {}
						diff[ aKey ] = bValue
					} else if ( isHook( bValue ) ) {
						diff = diff || {}
						diff[ aKey ] = bValue
					} else {
						var objectDiff = diffProps( aValue, bValue )
						if ( objectDiff ) {
							diff = diff || {}
							diff[ aKey ] = objectDiff
						}
					}
				} else {
					diff = diff || {}
					diff[ aKey ] = bValue
				}
			}

			for ( var bKey in b ) {
				if ( !(bKey in a) ) {
					diff = diff || {}
					diff[ bKey ] = b[ bKey ]
				}
			}

			return diff
		}

		function getPrototype ( value ) {
			if ( Object.getPrototypeOf ) {
				return Object.getPrototypeOf( value )
			} else if ( value.__proto__ ) {
				return value.__proto__
			} else if ( value.constructor ) {
				return value.constructor.prototype
			}
		}


		/***/
	},
	/* 34 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var patch = __webpack_require__( 35 )

		module.exports = patch


		/***/
	},
	/* 35 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var document = __webpack_require__( 20 )
		var isArray = __webpack_require__( 31 )

		var render = __webpack_require__( 17 )
		var domIndex = __webpack_require__( 36 )
		var patchOp = __webpack_require__( 37 )
		module.exports = patch

		function patch ( rootNode, patches, renderOptions ) {
			renderOptions = renderOptions || {}
			renderOptions.patch = renderOptions.patch || patchRecursive
			renderOptions.render = renderOptions.render || render

			return renderOptions.patch( rootNode, patches, renderOptions )
		}

		function patchRecursive ( rootNode, patches, renderOptions ) {
			var indices = patchIndices( patches )

			if ( indices.length === 0 ) {
				return rootNode
			}

			var index = domIndex( rootNode, patches.a, indices )
			var ownerDocument = rootNode.ownerDocument

			if ( !renderOptions.document && ownerDocument !== document ) {
				renderOptions.document = ownerDocument
			}

			for ( var i = 0; i < indices.length; i++ ) {
				var nodeIndex = indices[ i ]
				rootNode = applyPatch( rootNode,
					index[ nodeIndex ],
					patches[ nodeIndex ],
					renderOptions )
			}

			return rootNode
		}

		function applyPatch ( rootNode, domNode, patchList, renderOptions ) {
			if ( !domNode ) {
				return rootNode
			}

			var newNode

			if ( isArray( patchList ) ) {
				for ( var i = 0; i < patchList.length; i++ ) {
					newNode = patchOp( patchList[ i ], domNode, renderOptions )

					if ( domNode === rootNode ) {
						rootNode = newNode
					}
				}
			} else {
				newNode = patchOp( patchList, domNode, renderOptions )

				if ( domNode === rootNode ) {
					rootNode = newNode
				}
			}

			return rootNode
		}

		function patchIndices ( patches ) {
			var indices = []

			for ( var key in patches ) {
				if ( key !== "a" ) {
					indices.push( Number( key ) )
				}
			}

			return indices
		}


		/***/
	},
	/* 36 */
	/***/ function ( module, exports ) {

		// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
		// We don't want to read all of the DOM nodes in the tree so we use
		// the in-order tree indexing to eliminate recursion down certain branches.
		// We only recurse into a DOM node if we know that it contains a child of
		// interest.

		var noChild = {}

		module.exports = domIndex

		function domIndex ( rootNode, tree, indices, nodes ) {
			if ( !indices || indices.length === 0 ) {
				return {}
			} else {
				indices.sort( ascending )
				return recurse( rootNode, tree, indices, nodes, 0 )
			}
		}

		function recurse ( rootNode, tree, indices, nodes, rootIndex ) {
			nodes = nodes || {}


			if ( rootNode ) {
				if ( indexInRange( indices, rootIndex, rootIndex ) ) {
					nodes[ rootIndex ] = rootNode
				}

				var vChildren = tree.children

				if ( vChildren ) {

					var childNodes = rootNode.childNodes

					for ( var i = 0; i < tree.children.length; i++ ) {
						rootIndex += 1

						var vChild = vChildren[ i ] || noChild
						var nextIndex = rootIndex + (vChild.count || 0)

						// skip recursion down the tree if there are no nodes down here
						if ( indexInRange( indices, rootIndex, nextIndex ) ) {
							recurse( childNodes[ i ], vChild, indices, nodes, rootIndex )
						}

						rootIndex = nextIndex
					}
				}
			}

			return nodes
		}

		// Binary search for an index in the interval [left, right]
		function indexInRange ( indices, left, right ) {
			if ( indices.length === 0 ) {
				return false
			}

			var minIndex = 0
			var maxIndex = indices.length - 1
			var currentIndex
			var currentItem

			while ( minIndex <= maxIndex ) {
				currentIndex = ((maxIndex + minIndex) / 2) >> 0
				currentItem = indices[ currentIndex ]

				if ( minIndex === maxIndex ) {
					return currentItem >= left && currentItem <= right
				} else if ( currentItem < left ) {
					minIndex = currentIndex + 1
				} else if ( currentItem > right ) {
					maxIndex = currentIndex - 1
				} else {
					return true
				}
			}

			return false;
		}

		function ascending ( a, b ) {
			return a > b ? 1 : -1
		}


		/***/
	},
	/* 37 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var applyProperties = __webpack_require__( 22 )

		var isWidget = __webpack_require__( 26 )
		var VPatch = __webpack_require__( 32 )

		var updateWidget = __webpack_require__( 38 )

		module.exports = applyPatch

		function applyPatch ( vpatch, domNode, renderOptions ) {
			var type = vpatch.type
			var vNode = vpatch.vNode
			var patch = vpatch.patch

			switch ( type ) {
				case VPatch.REMOVE:
					return removeNode( domNode, vNode )
				case VPatch.INSERT:
					return insertNode( domNode, patch, renderOptions )
				case VPatch.VTEXT:
					return stringPatch( domNode, vNode, patch, renderOptions )
				case VPatch.WIDGET:
					return widgetPatch( domNode, vNode, patch, renderOptions )
				case VPatch.VNODE:
					return vNodePatch( domNode, vNode, patch, renderOptions )
				case VPatch.ORDER:
					reorderChildren( domNode, patch )
					return domNode
				case VPatch.PROPS:
					applyProperties( domNode, patch, vNode.properties )
					return domNode
				case VPatch.THUNK:
					return replaceRoot( domNode,
						renderOptions.patch( domNode, patch, renderOptions ) )
				default:
					return domNode
			}
		}

		function removeNode ( domNode, vNode ) {
			var parentNode = domNode.parentNode

			if ( parentNode ) {
				parentNode.removeChild( domNode )
			}

			destroyWidget( domNode, vNode );

			return null
		}

		function insertNode ( parentNode, vNode, renderOptions ) {
			var newNode = renderOptions.render( vNode, renderOptions )

			if ( parentNode ) {
				parentNode.appendChild( newNode )
			}

			return parentNode
		}

		function stringPatch ( domNode, leftVNode, vText, renderOptions ) {
			var newNode

			if ( domNode.nodeType === 3 ) {
				domNode.replaceData( 0, domNode.length, vText.text )
				newNode = domNode
			} else {
				var parentNode = domNode.parentNode
				newNode = renderOptions.render( vText, renderOptions )

				if ( parentNode && newNode !== domNode ) {
					parentNode.replaceChild( newNode, domNode )
				}
			}

			return newNode
		}

		function widgetPatch ( domNode, leftVNode, widget, renderOptions ) {
			var updating = updateWidget( leftVNode, widget )
			var newNode

			if ( updating ) {
				newNode = widget.update( leftVNode, domNode ) || domNode
			} else {
				newNode = renderOptions.render( widget, renderOptions )
			}

			var parentNode = domNode.parentNode

			if ( parentNode && newNode !== domNode ) {
				parentNode.replaceChild( newNode, domNode )
			}

			if ( !updating ) {
				destroyWidget( domNode, leftVNode )
			}

			return newNode
		}

		function vNodePatch ( domNode, leftVNode, vNode, renderOptions ) {
			var parentNode = domNode.parentNode
			var newNode = renderOptions.render( vNode, renderOptions )

			if ( parentNode && newNode !== domNode ) {
				parentNode.replaceChild( newNode, domNode )
			}

			return newNode
		}

		function destroyWidget ( domNode, w ) {
			if ( typeof w.destroy === "function" && isWidget( w ) ) {
				w.destroy( domNode )
			}
		}

		function reorderChildren ( domNode, moves ) {
			var childNodes = domNode.childNodes
			var keyMap = {}
			var node
			var remove
			var insert

			for ( var i = 0; i < moves.removes.length; i++ ) {
				remove = moves.removes[ i ]
				node = childNodes[ remove.from ]
				if ( remove.key ) {
					keyMap[ remove.key ] = node
				}
				domNode.removeChild( node )
			}

			var length = childNodes.length
			for ( var j = 0; j < moves.inserts.length; j++ ) {
				insert = moves.inserts[ j ]
				node = keyMap[ insert.key ]
				// this is the weirdest bug i've ever seen in webkit
				domNode.insertBefore( node, insert.to >= length++ ? null : childNodes[ insert.to ] )
			}
		}

		function replaceRoot ( oldRoot, newRoot ) {
			if ( oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode ) {
				oldRoot.parentNode.replaceChild( newRoot, oldRoot )
			}

			return newRoot;
		}


		/***/
	},
	/* 38 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var isWidget = __webpack_require__( 26 )

		module.exports = updateWidget

		function updateWidget ( a, b ) {
			if ( isWidget( a ) && isWidget( b ) ) {
				if ( "name" in a && "name" in b ) {
					return a.id === b.id
				} else {
					return a.init === b.init
				}
			}

			return false
		}


		/***/
	},
	/* 39 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var h = __webpack_require__( 40 )

		module.exports = h


		/***/
	},
	/* 40 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		var isArray = __webpack_require__( 31 );

		var VNode = __webpack_require__( 41 );
		var VText = __webpack_require__( 42 );
		var isVNode = __webpack_require__( 25 );
		var isVText = __webpack_require__( 18 );
		var isWidget = __webpack_require__( 26 );
		var isHook = __webpack_require__( 24 );
		var isVThunk = __webpack_require__( 28 );

		var parseTag = __webpack_require__( 43 );
		var softSetHook = __webpack_require__( 45 );
		var evHook = __webpack_require__( 46 );

		module.exports = h;

		function h ( tagName, properties, children ) {
			var childNodes = [];
			var tag, props, key, namespace;

			if ( !children && isChildren( properties ) ) {
				children = properties;
				props = {};
			}

			props = props || properties || {};
			tag = parseTag( tagName, props );

			// support keys
			if ( props.hasOwnProperty( 'key' ) ) {
				key = props.key;
				props.key = undefined;
			}

			// support namespace
			if ( props.hasOwnProperty( 'namespace' ) ) {
				namespace = props.namespace;
				props.namespace = undefined;
			}

			// fix cursor bug
			if ( tag === 'INPUT' && !namespace &&
				props.hasOwnProperty( 'value' ) &&
				props.value !== undefined && !isHook( props.value )
			) {
				props.value = softSetHook( props.value );
			}

			transformProperties( props );

			if ( children !== undefined && children !== null ) {
				addChild( children, childNodes, tag, props );
			}


			return new VNode( tag, props, childNodes, key, namespace );
		}

		function addChild ( c, childNodes, tag, props ) {
			if ( typeof c === 'string' ) {
				childNodes.push( new VText( c ) );
			} else if ( typeof c === 'number' ) {
				childNodes.push( new VText( String( c ) ) );
			} else if ( isChild( c ) ) {
				childNodes.push( c );
			} else if ( isArray( c ) ) {
				for ( var i = 0; i < c.length; i++ ) {
					addChild( c[ i ], childNodes, tag, props );
				}
			} else if ( c === null || c === undefined ) {
				return;
			} else {
				throw UnexpectedVirtualElement( {
					foreignObject: c,
					parentVnode: {
						tagName: tag,
						properties: props
					}
				} );
			}
		}

		function transformProperties ( props ) {
			for ( var propName in props ) {
				if ( props.hasOwnProperty( propName ) ) {
					var value = props[ propName ];

					if ( isHook( value ) ) {
						continue;
					}

					if ( propName.substr( 0, 3 ) === 'ev-' ) {
						// add ev-foo support
						props[ propName ] = evHook( value );
					}
				}
			}
		}

		function isChild ( x ) {
			return isVNode( x ) || isVText( x ) || isWidget( x ) || isVThunk( x );
		}

		function isChildren ( x ) {
			return typeof x === 'string' || isArray( x ) || isChild( x );
		}

		function UnexpectedVirtualElement ( data ) {
			var err = new Error();

			err.type = 'virtual-hyperscript.unexpected.virtual-element';
			err.message = 'Unexpected virtual child passed to h().\n' +
				'Expected a VNode / Vthunk / VWidget / string but:\n' +
				'got:\n' +
				errorString( data.foreignObject ) +
				'.\n' +
				'The parent vnode is:\n' +
				errorString( data.parentVnode )
			'\n' +
			'Suggested fix: change your `h(..., [ ... ])` callsite.';
			err.foreignObject = data.foreignObject;
			err.parentVnode = data.parentVnode;

			return err;
		}

		function errorString ( obj ) {
			try {
				return JSON.stringify( obj, null, '    ' );
			} catch ( e ) {
				return String( obj );
			}
		}


		/***/
	},
	/* 41 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var version = __webpack_require__( 19 )
		var isVNode = __webpack_require__( 25 )
		var isWidget = __webpack_require__( 26 )
		var isThunk = __webpack_require__( 28 )
		var isVHook = __webpack_require__( 24 )

		module.exports = VirtualNode

		var noProperties = {}
		var noChildren = []

		function VirtualNode ( tagName, properties, children, key, namespace ) {
			this.tagName = tagName
			this.properties = properties || noProperties
			this.children = children || noChildren
			this.key = key != null ? String( key ) : undefined
			this.namespace = (typeof namespace === "string") ? namespace : null

			var count = (children && children.length) || 0
			var descendants = 0
			var hasWidgets = false
			var hasThunks = false
			var descendantHooks = false
			var hooks

			for ( var propName in properties ) {
				if ( properties.hasOwnProperty( propName ) ) {
					var property = properties[ propName ]
					if ( isVHook( property ) && property.unhook ) {
						if ( !hooks ) {
							hooks = {}
						}

						hooks[ propName ] = property
					}
				}
			}

			for ( var i = 0; i < count; i++ ) {
				var child = children[ i ]
				if ( isVNode( child ) ) {
					descendants += child.count || 0

					if ( !hasWidgets && child.hasWidgets ) {
						hasWidgets = true
					}

					if ( !hasThunks && child.hasThunks ) {
						hasThunks = true
					}

					if ( !descendantHooks && (child.hooks || child.descendantHooks) ) {
						descendantHooks = true
					}
				} else if ( !hasWidgets && isWidget( child ) ) {
					if ( typeof child.destroy === "function" ) {
						hasWidgets = true
					}
				} else if ( !hasThunks && isThunk( child ) ) {
					hasThunks = true;
				}
			}

			this.count = count + descendants
			this.hasWidgets = hasWidgets
			this.hasThunks = hasThunks
			this.hooks = hooks
			this.descendantHooks = descendantHooks
		}

		VirtualNode.prototype.version = version
		VirtualNode.prototype.type = "VirtualNode"


		/***/
	},
	/* 42 */
	/***/ function ( module, exports, __webpack_require__ ) {

		var version = __webpack_require__( 19 )

		module.exports = VirtualText

		function VirtualText ( text ) {
			this.text = String( text )
		}

		VirtualText.prototype.version = version
		VirtualText.prototype.type = "VirtualText"


		/***/
	},
	/* 43 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		var split = __webpack_require__( 44 );

		var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
		var notClassId = /^\.|#/;

		module.exports = parseTag;

		function parseTag ( tag, props ) {
			if ( !tag ) {
				return 'DIV';
			}

			var noId = !(props.hasOwnProperty( 'id' ));

			var tagParts = split( tag, classIdSplit );
			var tagName = null;

			if ( notClassId.test( tagParts[ 1 ] ) ) {
				tagName = 'DIV';
			}

			var classes, part, type, i;

			for ( i = 0; i < tagParts.length; i++ ) {
				part = tagParts[ i ];

				if ( !part ) {
					continue;
				}

				type = part.charAt( 0 );

				if ( !tagName ) {
					tagName = part;
				} else if ( type === '.' ) {
					classes = classes || [];
					classes.push( part.substring( 1, part.length ) );
				} else if ( type === '#' && noId ) {
					props.id = part.substring( 1, part.length );
				}
			}

			if ( classes ) {
				if ( props.className ) {
					classes.push( props.className );
				}

				props.className = classes.join( ' ' );
			}

			return props.namespace ? tagName : tagName.toUpperCase();
		}


		/***/
	},
	/* 44 */
	/***/ function ( module, exports ) {

		/*!
		 * Cross-Browser Split 1.1.1
		 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
		 * Available under the MIT License
		 * ECMAScript compliant, uniform cross-browser split method
		 */

		/**
		 * Splits a string into an array of strings using a regex or string separator. Matches of the
		 * separator are not included in the result array. However, if `separator` is a regex that contains
		 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
		 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
		 * cross-browser.
		 * @param {String} str String to split.
		 * @param {RegExp|String} separator Regex or string to use for separating the string.
		 * @param {Number} [limit] Maximum number of items to include in the result array.
		 * @returns {Array} Array of substrings.
		 * @example
		 *
		 * // Basic use
		 * split('a b c d', ' ');
		 * // -> ['a', 'b', 'c', 'd']
		 *
		 * // With limit
		 * split('a b c d', ' ', 2);
		 * // -> ['a', 'b']
		 *
		 * // Backreferences in result array
		 * split('..word1 word2..', /([a-z]+)(\d+)/i);
		 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
		 */
		module.exports = (function split ( undef ) {

			var nativeSplit = String.prototype.split,
				compliantExecNpcg = /()??/.exec( "" )[ 1 ] === undef,
			// NPCG: nonparticipating capturing group
				self;

			self = function ( str, separator, limit ) {
				// If `separator` is not a regex, use `nativeSplit`
				if ( Object.prototype.toString.call( separator ) !== "[object RegExp]" ) {
					return nativeSplit.call( str, separator, limit );
				}
				var output = [],
					flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
						(separator.sticky ? "y" : ""),
				// Firefox 3+
					lastLastIndex = 0,
				// Make `global` and avoid `lastIndex` issues by working with a copy
					separator = new RegExp( separator.source, flags + "g" ),
					separator2, match, lastIndex, lastLength;
				str += ""; // Type-convert
				if ( !compliantExecNpcg ) {
					// Doesn't need flags gy, but they don't hurt
					separator2 = new RegExp( "^" + separator.source + "$(?!\\s)", flags );
				}
				/* Values for `limit`, per the spec:
				 * If undefined: 4294967295 // Math.pow(2, 32) - 1
				 * If 0, Infinity, or NaN: 0
				 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
				 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
				 * If other: Type-convert, then use the above rules
				 */
				limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
				limit >>> 0; // ToUint32(limit)
				while ( match = separator.exec( str ) ) {
					// `separator.lastIndex` is not reliable cross-browser
					lastIndex = match.index + match[ 0 ].length;
					if ( lastIndex > lastLastIndex ) {
						output.push( str.slice( lastLastIndex, match.index ) );
						// Fix browsers whose `exec` methods don't consistently return `undefined` for
						// nonparticipating capturing groups
						if ( !compliantExecNpcg && match.length > 1 ) {
							match[ 0 ].replace( separator2, function () {
								for ( var i = 1; i < arguments.length - 2; i++ ) {
									if ( arguments[ i ] === undef ) {
										match[ i ] = undef;
									}
								}
							} );
						}
						if ( match.length > 1 && match.index < str.length ) {
							Array.prototype.push.apply( output, match.slice( 1 ) );
						}
						lastLength = match[ 0 ].length;
						lastLastIndex = lastIndex;
						if ( output.length >= limit ) {
							break;
						}
					}
					if ( separator.lastIndex === match.index ) {
						separator.lastIndex++; // Avoid an infinite loop
					}
				}
				if ( lastLastIndex === str.length ) {
					if ( lastLength || !separator.test( "" ) ) {
						output.push( "" );
					}
				} else {
					output.push( str.slice( lastLastIndex ) );
				}
				return output.length > limit ? output.slice( 0, limit ) : output;
			};

			return self;
		})();


		/***/
	},
	/* 45 */
	/***/ function ( module, exports ) {

		'use strict';

		module.exports = SoftSetHook;

		function SoftSetHook ( value ) {
			if ( !(this instanceof SoftSetHook) ) {
				return new SoftSetHook( value );
			}

			this.value = value;
		}

		SoftSetHook.prototype.hook = function ( node, propertyName ) {
			if ( node[ propertyName ] !== this.value ) {
				node[ propertyName ] = this.value;
			}
		};


		/***/
	},
	/* 46 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		var EvStore = __webpack_require__( 47 );

		module.exports = EvHook;

		function EvHook ( value ) {
			if ( !(this instanceof EvHook) ) {
				return new EvHook( value );
			}

			this.value = value;
		}

		EvHook.prototype.hook = function ( node, propertyName ) {
			var es = EvStore( node );
			var propName = propertyName.substr( 3 );

			es[ propName ] = this.value;
		};

		EvHook.prototype.unhook = function ( node, propertyName ) {
			var es = EvStore( node );
			var propName = propertyName.substr( 3 );

			es[ propName ] = undefined;
		};


		/***/
	},
	/* 47 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		var OneVersionConstraint = __webpack_require__( 48 );

		var MY_VERSION = '7';
		OneVersionConstraint( 'ev-store', MY_VERSION );

		var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

		module.exports = EvStore;

		function EvStore ( elem ) {
			var hash = elem[ hashKey ];

			if ( !hash ) {
				hash = elem[ hashKey ] = {};
			}

			return hash;
		}


		/***/
	},
	/* 48 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		var Individual = __webpack_require__( 49 );

		module.exports = OneVersion;

		function OneVersion ( moduleName, version, defaultValue ) {
			var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
			var enforceKey = key + '_ENFORCE_SINGLETON';

			var versionValue = Individual( enforceKey, version );

			if ( versionValue !== version ) {
				throw new Error( 'Can only have one copy of ' +
					moduleName + '.\n' +
					'You already have version ' + versionValue +
					' installed.\n' +
					'This means you cannot install version ' + version );
			}

			return Individual( key, defaultValue );
		}


		/***/
	},
	/* 49 */
	/***/ function ( module, exports ) {

		/* WEBPACK VAR INJECTION */
		(function ( global ) {
			'use strict';

			/*global window, global*/

			var root = typeof window !== 'undefined' ?
				window : typeof global !== 'undefined' ?
				global : {};

			module.exports = Individual;

			function Individual ( key, value ) {
				if ( key in root ) {
					return root[ key ];
				}

				root[ key ] = value;

				return value;
			}

			/* WEBPACK VAR INJECTION */
		}.call( exports, (function () {
				return this;
			}()) ))

		/***/
	},
	/* 50 */
	/***/ function ( module, exports ) {

		"use strict";

		Object.defineProperty( exports, "__esModule", {
			value: true
		} );
		exports.addEvent = addEvent;

		function addEvent ( elem, event, fn ) {
			if ( elem.addEventListener ) {
				elem.addEventListener( event, fn, false );
			} else {
				elem.attachEvent( "on" + event, function () {
					// set the this pointer same as addEventListener when fn is called
					return fn.call( elem, window.event );
				} );
			}
		}

		/***/
	},
	/* 51 */
	/***/ function ( module, exports ) {

		'use strict';

		module.exports = AttributeHook;

		function AttributeHook ( namespace, value ) {
			if ( !(this instanceof AttributeHook) ) {
				return new AttributeHook( namespace, value );
			}

			this.namespace = namespace;
			this.value = value;
		}

		AttributeHook.prototype.hook = function ( node, prop, prev ) {
			if ( prev && prev.type === 'AttributeHook' && prev.value === this.value && prev.namespace === this.namespace ) {
				return;
			}

			node.setAttributeNS( this.namespace, prop, this.value );
		};

		AttributeHook.prototype.unhook = function ( node, prop, next ) {
			if ( next && next.type === 'AttributeHook' && next.namespace === this.namespace ) {
				return;
			}

			var colonPosition = prop.indexOf( ':' );
			var localName = colonPosition > -1 ? prop.substr( colonPosition + 1 ) : prop;
			node.removeAttributeNS( this.namespace, localName );
		};

		AttributeHook.prototype.type = 'AttributeHook';

		/***/
	},
	/* 52 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		Object.defineProperty( exports, '__esModule', {
			value: true
		} );

		function _interopRequireDefault ( obj ) {
			return obj && obj.__esModule ? obj : { 'default': obj };
		}

		var _baseView = __webpack_require__( 14 );

		/**
		 * Base view for work with single object
		 * Use this if you want
		 * @constructor
		 * @extends {BaseView}
		 * @throws {Error} if in child class not specified template
		 * @throws {Error} if specified template is not function ( because for template you must use loader which
		 * compile your template to function that create hypertext )
		 */

		var _baseView2 = _interopRequireDefault( _baseView );

		function BaseItemView () {
			if ( !this.template ) {
				throw new Error( 'Template not specified' );
			} else if ( Object.prototype.toString.call( this.template ) !== "[object Function]" ) {
				throw new Error( 'Incorrect template' );
			}

			this[ 'super' ]();
		}

		BaseItemView.prototype = {

			/**
			 * Render view. This methods must use renderTpl from BaseView
			 * @override
			 * @param model
			 */
			render: function render ( model ) {
				var templateHyperscript = undefined;
				var newVdom = undefined;

				try {
					templateHyperscript = this.template( model );
				} catch ( e ) {
					console.warn( e );
					return;
				}

				newVdom = this.renderTpl( templateHyperscript );
				this[ 'super' ].render.call( this, newVdom );
			}
		};

		BaseItemView[ 'extends' ]( _baseView2[ 'default' ] );

		exports[ 'default' ] = BaseItemView;
		module.exports = exports[ 'default' ];

		/***/
	},
	/* 53 */
	/***/ function ( module, exports, __webpack_require__ ) {

		'use strict';

		Object.defineProperty( exports, '__esModule', {
			value: true
		} );

		function _interopRequireDefault ( obj ) {
			return obj && obj.__esModule ? obj : { 'default': obj };
		}

		var _baseView = __webpack_require__( 14 );

		var _baseView2 = _interopRequireDefault( _baseView );

		function BaseTreeView () {
		}

		BaseTreeView.prototype = {

			rootTemplate: void 0,

			nodeTemplate: void 0,

			listTemplate: void 0,

			render: function render ( tree ) {
				if ( !this.rootNode ) {
					throw new Error( 'RootNode not specified' );
				}

				var new_vdom = this.renderTpl( this.traverse( tree ) );

				this[ 'super' ].render.call( this, new_vdom );
				this.activeSuperContext = this.inheritChain[ this.inheritChain.length - 1 ];
			},

			init: function init () {
				if ( !this.nodeTemplate && !this.listTemplate ) {
					throw new Error( 'Templates not specified' );
				}
				if ( !this.rootTemplate ) {
					throw new Error( 'Root template not specified' );
				}

				this[ 'super' ].init.call( this );
			},

			traverse: function traverse ( tree ) {
				var curAC = this.activeSuperContext;
				this.activeSuperContext = this.inheritChain[ this.inheritChain.length - 1 ];
				var res = this.traverse( tree );
				this.activeSuperContext = curAC;
				return res;
			}

		};

		BaseTreeView[ 'extends' ]( _baseView2[ 'default' ] );

		exports[ 'default' ] = BaseTreeView;
		module.exports = exports[ 'default' ];

		/***/
	}
	/******/ ] );