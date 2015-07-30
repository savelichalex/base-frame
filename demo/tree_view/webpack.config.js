var path = require('path');
module.exports = {
    entry: './test.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel-loader'
            },
            {
                test: /\.tpl/,
                loader: 'text-loader'
            },
            {
                test: /\.json/,
                loader: 'json-loader'
            }
        ]
    }
};