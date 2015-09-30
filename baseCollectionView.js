import BaseView from './baseView';

/**
 * Base view for work with collections. In child class you can override
 * filter function that return rendered template for each collection element
 * @constructor
 * @extends {BaseView}
 * @throws {Error} if not specified templates object
 * @throws {Error} if not specified template ( for template you must use loader which
 * compile your template to function that create hypertext )
 */
function BaseCollectionView() {
    if ( !this.templates ) {
        throw new Error( 'Templates not specified' );
    }

    if ( !this.template ) {
        throw new Error( 'Template not specified' );
    }

    this.super();
}

BaseCollectionView.prototype = {

    /**
     * Render view. This methods must use renderTpl from BaseView
     * Call traverse function
     * for every element
     * @override
     * @param collection
     */
    render: function (collection) {
        let new_vdom = this.renderTpl(this.template({
            collection: this._traverse( collection )
        }));

        return this.super.render.call( this, new_vdom );
    },

    /**
     * Go through the collection and call filter function (if exist) for every element
     * @param collection
     * @returns {String}
     * @private
     */
    _traverse: function ( collection ) {
        if (!collection) {
            return '';
        }

        if (Object.prototype.toString.call(collection) !== '[object Array]') {
            throw new Error('Collection must be an Array');
        }

        let length = collection.length,
            i = 0,
            classHasFilterFunc = this._checkClassHasFilterFunc(),
            filterFunc;

        if (classHasFilterFunc) {
            filterFunc = function (item, index) {
                var curAC = this.activeSuperContext;
                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                var res = this.filter(item, index);
                this.activeSuperContext = curAC;
                return res;
            }
        } else {
            filterFunc = (function (context) {
                let firstInCol = Object.keys(context.templates)[0];
                return function (item) {
                    return context.templates[firstInCol](item);
                }
            }(this));
        }

        let result = [];

        for (; i < length; i++) {
            result.push(filterFunc.call(this, collection[i], i));
        }

        return result;
    },

    /**
     * Check that current class have filter function
     * @returns {boolean}
     * @private
     */
    _checkClassHasFilterFunc: function () {
        var curAC = this.activeSuperContext,
            flag = false;

        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
        if (this[this.activeSuperContext + '$filter']) {
            flag = true;
        }
        this.activeSuperContext = curAC;

        return flag;
    }

};

BaseCollectionView.extends(BaseView);

export default BaseCollectionView;