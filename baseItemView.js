import _ from 'underscore';

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import convertHTML from 'html-to-vdom';

var convert = convertHTML({
    VNode: VNode,
    VText: VText
});

import { BaseView } from './baseView';

export function BaseItemView() {

}

BaseItemView.prototype = {

    template: void 0,

    render(model) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }
        let new_vdom = convert(this._templateCachedFn(model));

        this._render(new_vdom);
    },

    init: function() {
        if(!this.template) {
            throw new Error('Template not specified');
        }
        this._templateCachedFn = _.template(this.template);
        this._init();
    }

};

BaseItemView.extends(BaseView);