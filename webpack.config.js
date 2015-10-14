var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'base-frame.js'
    },
    externals: {
        'underscore': '_',
        'virtual-dom': 'virtualDom',
        'bluebird': 'Promise'
    },
    module: {
        loaders: [
            {
                test: /\.json/,
                loader: 'json-loader'
            }
        ]
    }
};