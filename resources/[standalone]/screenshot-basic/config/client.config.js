const path = require('path');
module.exports = {
  entry: './src/client/client.ts',
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'client.js',
    path: path.resolve('./dist/'),
  },
};
