import _ from 'underscore';

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import convertHTML from 'html-to-vdom';

var convert = convertHTML({
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

        this._render(new_vdom)
    },

    init: function() {
        if(!this.nodeTemplate && !this.listTemplate) {
            throw new Error('Templates not specified');
        }
        if(!this.rootTemplate) {
            this.rootTemplate = '<div><%= children %></div>';
        }

        this.renderRootTemplate = _.template(this.rootTemplate);
        this.renderNodeTemplate = _.template(this.nodeTemplate);
        this.renderListTemplate = _.template(this.listTemplate);

        this._init();
    },

    traverse: function(tree) {
        throw new Error('Traverse method must be overrated');
    }

};

BaseTreeView.extends(BaseView);