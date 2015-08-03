import util from '../../util';
import { BaseItemView } from '../../baseItemView';

var View = function() {
    this.init();
};

View.prototype = {

    template: '<div><p>hello <span><%= name%></span></p></div>',

    rootNode: 'body',

    events: {
        'click p': function(event) {
            console.log('p clicked');
        },
        'click span': function(event) {
            console.log('span clicked');
        }
    }
};

View.extends(BaseItemView);

var view = new View();

view.render({
    name: 'world'
});

