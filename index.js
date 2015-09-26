(require('base-frame-extends'));

module.exports = {
    BaseCollectionView: require('./baseCollectionView'),
    BaseComponent: require('./baseComponent'),
    BaseItemView: require('./baseItemView'),
    BaseModel: require('./baseModel'),
    BaseTreeView: require('./baseTreeView'),
    BaseView: require('./baseView'),
    Emitter: require('./Emitter'),
    util: require('./util'),
    defer: require('./util').defer,
};