var BaseView = require( './baseView' );

/**
 * Base view for work with single object
 * @constructor
 * @extends {BaseView}
 * @throws {Error} if in child class not specified template
 * @throws {Error} if specified template is not function ( because for template you must use loader which
 * compile your template to function that create hypertext )
 */
function BaseItemView(options) {
    if( !this.template ) {
        throw new Error( 'Template not specified' );
    } else {
        if( Object.prototype.toString.call( this.template ) === '[object Function]' ) {
            var templateFn = this.template;
            try {
                this.template = this.template();
            } catch( e ) {
                this.template = templateFn;
            }
            if( Object.prototype.toString.call( this.template ) === '[object String]' ) {
                this.template = templateFn;
            }
        }
    }

    this.super(options);
}

BaseItemView.prototype = {
    constructor: BaseItemView,

    /**
     * Render view. This methods must use renderTpl from BaseView
     * @override
     * @param model
     */
    render: function(model, overwrite) {
        if(overwrite) {
            return this.super.render.call(this, model);
        }
        var templateHyperscript;
        var newVdom;

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

module.exports = BaseItemView;