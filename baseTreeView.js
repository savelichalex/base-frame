import VNode from 'virtual-dom/VNode';
import VText from 'virtual-dom/VText';
import convertHTML from 'html-to-vdom-svg-fix';

window.convert = convertHTML({
    VNode: VNode,
    VText: VText
});

import { BaseView } from './baseView';

export function BaseTreeView() {
}

BaseTreeView.prototype = {

    rootTemplate: void 0,

    nodeTemplate: void 0,

    listTemplate: void 0,

    render(tree) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = convert(this.traverse(tree));

        this.super.render.call(this, new_vdom);
        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
    },

    init: function() {
        if(!this.nodeTemplate && !this.listTemplate) {
            throw new Error('Templates not specified');
        }
        if(!this.rootTemplate) {
            this.rootTemplate = '<div><%= children %></div>';
        }

        this.renderRootTemplate = _.template(this.rootTemplate.trim());
        this.renderNodeTemplate = _.template(this.nodeTemplate.trim());
        this.renderListTemplate = _.template(this.listTemplate.trim());

        this.super.init.call(this);
    },

    traverse: function(tree) {
        var curAC = this.activeSuperContext;
        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
        var res = this.traverse(tree);
        this.activeSuperContext = curAC;
        return res;
    }

};

BaseTreeView.extends(BaseView);