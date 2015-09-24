import BaseView from './baseView';

function BaseCollectionView () {
}

BaseCollectionView.prototype = {

    template: void 0,

    render: function(collection) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = this.renderTpl( this.template( {
            collection: this.traverse(collection)
        } ) );

        this.super.render.call(this, new_vdom);
    },

    init: function() {
        if(!this.templates) {
            throw new Error('Templates not specified');
        }

        if(!this.template) {
            throw new Error('Template not specified');
        }

        this.super.init.call(this);
    },

    traverse: function(collection) {
        if(!collection) {
            return '';
        }

        if(Object.prototype.toString.call(collection) !== '[object Array]') {
            throw new Error('Collection must be an Array');
        }

        let length = collection.length,
            i = 0,
            classHasFilterFunc = this.checkClassHasFilterFunc(),
            filterFunc;

        if(classHasFilterFunc) {
            filterFunc = function(item, index) {
                var curAC = this.activeSuperContext;
                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                var res = this.filter(item, index);
                this.activeSuperContext = curAC;
                return res;
            }
        } else {
            filterFunc = (function ( context ) {
                let firstInCol = Object.keys( context.templates )[ 0 ];
                return function(item) {
                    return context.templates[ firstInCol ]( item );
                }
            }( this ));
        }

        let result = [];

        for( ; i < length; i++) {
            result.push( filterFunc.call(this, collection[i], i) );
        }

        return result;
    },

    checkClassHasFilterFunc: function() {
        var curAC = this.activeSuperContext,
            flag = false;

        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
        if(this[this.activeSuperContext + '$filter']) {
            flag = true;
        }
        this.activeSuperContext = curAC;

        return flag;
    }

};

BaseCollectionView.extends(BaseView);

export default BaseCollectionView;