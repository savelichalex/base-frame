import util from '../../util';
//import { defer } from '../../util';
import { BaseItemView } from '../../baseItemView';
import BaseModel from '../../baseModel';
import BaseComponent from '../../baseComponent';

var View = function() {
    this.init();
};

View.prototype = {

    template: '<div><h3>hello <%= name%></h3><input class=\'testClass\' id=\'testId\' type=\"text\" /></div>',

    rootNode: 'body',

    events: {
        'keypress input': defer(function(event) {
            let target = event.target;
            this.valueChanged(target.value);
        })
    }
};

View.extends(BaseItemView);

var Model = function() {
    this.defProperty('name');
};

Model.extends(BaseModel);

var Test = function() {
    this.init();
    this.initEntities();
};

Test.prototype = {

    signals: {
        'local': {
            'trigger@model:change': 'changeModel',
            'trigger@view:changeValue': 'changeValue'
        }
    },

    slots: {
        'local': {

            'on@view:changeValue': defer(function(value) {
                this.model.name = value;
            }),

            'on@model:change': defer(function(model) {
                this.view.render(model);
            })
        }
    },

    model: new Model(),

    view: new View(),

    initEntities: function() {
        let self = this;

        this.view.valueChanged = function(value) {
            self.emit.changeValue(value);
        };

        this.model.on('change').then(function(model) {
            self.emit.changeModel(model);
        });

        this.model.name = 'world';
    }

};

Test.extends(BaseComponent);

var test = new Test();