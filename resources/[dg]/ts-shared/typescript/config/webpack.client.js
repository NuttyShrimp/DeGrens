/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');
const util = require('./webpack.util.js');

const defClient = {
	entry: path.resolve(util.paths.client.src, 'index.ts'),
	resolve: {
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(util.paths.client.src, 'tsconfig.json'),
			}),
		],
	},
	output: {
		path: util.paths.client.build,
		clean: true,
		filename: 'client.js',
	},
};

module.exports = (_, args) => {
  return merge(common, defClient);
};
