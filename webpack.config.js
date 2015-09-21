var path = require( 'path' );

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'base-frame.js'
    },
    externals: {
        'underscore': '_',
        'bluebird': 'Promise',
        'virtual-dom': 'virtualDom'
    },
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json/,
                loader: 'json-loader'
            }
        ]
    }
};