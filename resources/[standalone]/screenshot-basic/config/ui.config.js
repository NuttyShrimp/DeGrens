const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './ui/src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es6',
          loader: 'ts',
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './ui/index.html',
      filename: 'ui.html',
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'ui.js',
    path: path.resolve('./dist/'),
  },
};
