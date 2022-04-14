const webpack = require('webpack');

const common = {
    devtool: 'eval-source-map',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false })],
    optimization: {
        minimize: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'node',
};

module.exports = common;
