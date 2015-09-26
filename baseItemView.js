import BaseView from './baseView';

function BaseItemView() {
}

BaseItemView.prototype = {

    template: void 0,

    render: function(model) {
        if(!this.rootNode) {
            throw new Error('RootNode not specified');
        }

        let new_vdom = this.renderTpl(this.template(model));

        this.super.render.call(this, new_vdom);
    },

    init: function() {
        if(!this.template) {
            throw new Error('Template not specified');
        }

        this.super.init.call(this);
    }

};

BaseItemView.extends(BaseView);

export default BaseItemView;