const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/server/server.ts',
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
  optimization: {
    minimize: false,
  },
  // https://github.com/felixge/node-formidable/issues/337#issuecomment-153408479
  plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false })],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'server.js',
    path: path.resolve('./dist/'),
  },
  target: 'node',
};
