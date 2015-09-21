import BaseView from './baseView';

function BaseTreeView () {
}

BaseTreeView.prototype = {

    rootTemplate: void 0,

    nodeTemplate: void 0,

    listTemplate: void 0,

    render(tree) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = this.renderTpl( this.traverse( tree ) );

        this.super.render.call(this, new_vdom);
        this.activeSuperContext = this.inheritChain[this.inheritChain.length - 1];
    },

    init: function() {
        if(!this.nodeTemplate && !this.listTemplate) {
            throw new Error('Templates not specified');
        }
        if(!this.rootTemplate) {
            throw new Error('Root template not specified');
        }

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

export default BaseTreeView;