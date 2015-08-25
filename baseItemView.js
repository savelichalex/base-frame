import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import convertHTML from 'html-to-vdom-svg-fix';

window.convert = convertHTML({
    VNode: VNode,
    VText: VText
});

import { BaseView } from './baseView';

export function BaseItemView() {
}

BaseItemView.prototype = {

    template: void 0,

    render: function(model) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = convert(this._templateCachedFn(model));

        this.super.render.call(this, new_vdom);
    },

    init: function() {
        if(!this.template) {
            throw new Error('Template not specified');
        }
        this._templateCachedFn = _.template(this.template);
        this.super.init.call(this);
    }

};

BaseItemView.extends(BaseView);