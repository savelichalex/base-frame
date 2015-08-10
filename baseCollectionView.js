import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import convertHTML from 'html-to-vdom';

window.convert = convertHTML({
    VNode: VNode,
    VText: VText
});

import { BaseView } from './baseView';

export function BaseCollectionView() {
}

BaseCollectionView.prototype = {

    template: void 0,

    render: function(collection) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = convert(this._templateCachedFn({
            collection: this.traverse(collection)
        }));

        this.super.render.call(this, new_vdom);
    },

    init: function() {
        if(!this.template && !this.templates) {
            throw new Error('Template not specified');
        }

        let templates = this.templates;
        for(let template in templates) {
            if(templates.hasOwnProperty(template)) {
                templates[template] = _.template(templates[template].trim());
            }
        }

        this._templateCachedFn = _.template(this.template);

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
            filterFunc = function(item) {
                var curAC = this.activeSuperContext;
                this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
                var res = this.filter(item);
                this.activeSuperContext = curAC;
                return res;
            }
        } else {
            filterFunc = (function() {
                let firstInCol = Object.keys(this.templates)[0];
                return function(item) {
                    return this.templates[firstInCol](item);
                }
            }());
        }

        let result_str = '';

        for( ; i < length; i++) {
            result_str += filterFunc(collection[i]);
        }

        return result_str;
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