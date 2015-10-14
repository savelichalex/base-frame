var BaseView = require( './baseView' );

/**
 * Base view for work with tree structures
 * In child class must be declared traverse function
 * @constructor
 * @extends {BaseView}
 * @throws {Error} when templates or root template not specified
 * @throws {Error} if not specified traverse function
 */
function BaseTreeView() {
    if ( !this.nodeTemplate ) {
        throw new Error( 'Templates for node not specified' );
    }
    if ( !this.listTemplate ) {
        throw new Error( 'Templates for list not specified' );
    }
    if ( !this.rootTemplate ) {
        throw new Error( 'Root template not specified' );
    }
    if ( !this.traverse ) {
        throw new Error( 'Traverse function is not specified' );
    }

    this.super();
}

BaseTreeView.prototype = {

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