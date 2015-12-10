var BaseView = require( './baseView' );

/**
 * Base view for work with tree structures
 * In child class must be declared traverse function
 * @constructor
 * @extends {BaseView}
 * @throws {Error} when templates or root template not specified
 * @throws {Error} if not specified traverse function
 */
function BaseTreeView(options) {
    if ( !this.nodeTemplate ) {
        throw new Error( 'Templates for node not specified' );
	} else {
		if( Object.prototype.toString.call( this.nodeTemplate ) === '[object Function]' ) {
			var templateFn = this.nodeTemplate;
			try {
				this.nodeTemplate = this.nodeTemplate();
			} catch( e ) {
				this.nodeTemplate = templateFn;
			}
		}
    }
    if ( !this.listTemplate ) {
        throw new Error( 'Templates for list not specified' );
	} else {
		if( Object.prototype.toString.call( this.listTemplate ) === '[object Function]' ) {
			var templateFn = this.listTemplate;
			try {
				this.listTemplate = this.listTemplate();
			} catch( e ) {
				this.listTemplate = templateFn;
			}
		}
    }
    if ( !this.rootTemplate ) {
        throw new Error( 'Root template not specified' );
	} else {
		if( Object.prototype.toString.call( this.rootTemplate ) === '[object Function]' ) {
			var templateFn = this.rootTemplate;
			try {
				this.rootTemplate = this.rootTemplate();
			} catch( e ) {
				this.rootTemplate = templateFn;
			}
		}
    }
    if ( !this.traverse ) {
        throw new Error( 'Traverse function is not specified' );
    }

	this.super(options);
}

BaseTreeView.prototype = {
    constructor: BaseTreeView,

    /**
     * Render view. This methods must use renderTpl from BaseView
     * Call traverse function
     * @override
     * @param tree {Object}
     */
    render: function ( tree ) {
        var new_vdom = this.renderTpl( this.traverse( tree ) );

        return this.super.render.call( this, new_vdom );
    }

};

BaseTreeView.extends(BaseView);

module.exports = BaseTreeView;