const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

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
  plugins: [
    new webpack.DefinePlugin({'global.GENTLY': false}),
    new CleanWebpackPlugin({
      dry: false,
      cleanOnceBeforeBuildPatterns: ['**/*.js', '**/*.js.*', '*.LICENSE.txt'],
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
};

module.exports = common;
