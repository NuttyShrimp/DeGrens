/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');
const util = require('./webpack.util.js');

const defClient = {
	entry: path.resolve(util.paths.client.src, 'client.ts'),
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
	},
};

const prodClient = {
	output: {
		filename: 'client.js',
	},
};

const devClient = {
	output: {
		filename: '[contenthash].client.js',
	},
};

module.exports = (_, args) => {
	const env = args.mode ?? 'production';
	switch (env) {
		case 'development':
			return merge(common, defClient, devClient);
		case 'production':
			return merge(common, defClient, prodClient);
		default:
			throw new Error('Client: No matching configuration was found!');
	}
};
