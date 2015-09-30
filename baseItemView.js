import BaseView from './baseView';

/**
 * Base view for work with single object
 * @constructor
 * @extends {BaseView}
 * @throws {Error} if in child class not specified template
 * @throws {Error} if specified template is not function ( because for template you must use loader which
 * compile your template to function that create hypertext )
 */
function BaseItemView () {
    if ( !this.template ) {
        throw new Error( 'Template not specified' );
    } else if ( Object.prototype.toString.call( this.template ) !== "[object Function]" ) {
        throw new Error( 'Incorrect template' );
    }

    this.super();
}

BaseItemView.prototype = {

    /**
     * Render view. This methods must use renderTpl from BaseView
     * @override
     * @param model
     */
    render: function ( model ) {
        let templateHyperscript;
        let newVdom;

        try {
            templateHyperscript = this.template( model );
        } catch ( e ) {
            if ( e.name === 'ReferenceError' )
                throw new ReferenceError( 'Incorrect model. Check that variables in template exist in model what you want to render' );
        }

        newVdom = this.renderTpl( templateHyperscript );
        return this.super.render.call( this, newVdom );
    }
};

BaseItemView.extends( BaseView );

export default BaseItemView;