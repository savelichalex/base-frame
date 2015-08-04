import util from '../../util';
//import { defer } from '../../util';
import { BaseTreeView } from '../../baseTreeView';
import BaseModel from '../../baseModel';
import BaseComponent from '../../baseComponent';

var TreeView = function() {
    this.init();
};

TreeView.prototype = {

    nodeTemplate: '<p>Node <%= name %></p><ul data-id=\"<%= name %>\"><%= children %></ul>',

    listTemplate: '<li data-id=\"<%= name %>\">List <%= name %></li>',

    rootNode: 'body',

    traverse: function(tree) {
        let self = this,
            root_child = '';

        for(let node in tree) {
            if(tree.hasOwnProperty(node)) {
                let node_child = '';
                //console.log(tree, node);
                tree[node].forEach(function(list) {
                    node_child += self.renderListTemplate({
                        name: list
                    });
                });
                root_child += this.renderNodeTemplate({
                    name: node,
                    children: node_child
                });
            }
        }

        return this.renderRootTemplate({
            children: root_child
        });
    },

    events: {
        'click li': function(event) {
            let target = event.target,
                parent = target.parentNode;
            for(let i = 0; i < tree[parent.dataset.id].length; i++) {
                if(tree[parent.dataset.id][i] === target.dataset.id) {
                    tree[parent.dataset.id][i] = Math.floor(10*Math.random(10));
                    break;
                }
            }
            this.render(tree);
        }
    }
};

TreeView.extends(BaseTreeView);

var tree = {
    '1': [
        '1',
        '2',
        '3'
    ],
    '2': [
        '1',
        '2'
    ]
};

var treeView = new TreeView();

treeView.render(tree);