/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const { version, name } = require('../package.json');

const common = require('./webpack.common');
const util = require('./webpack.util.js');

const defClient = {
	entry: path.join(util.paths.server.src, 'index.ts'),
	resolve: {
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.join(util.paths.server.src, 'tsconfig.json'),
			}),
		],
	},
	output: {
		path: util.paths.server.build,
		clean: true,
    filename: 'server.js',
	},
};

const prodClient = {
	devtool: 'source-map',
	plugins: [
		new SentryCliPlugin({
			include: util.paths.server.build,
			ignore: ['node_modules', 'webpack.config.js'],
			release: version,
			configFile: 'sentry.properties',
      urlPrefix: name,
		}),
	],
};

module.exports = (_, args) => {
	const env = args.mode ?? 'production';
	switch (env) {
		case 'development':
			return merge(common, defClient);
		case 'production':
			return merge(common, defClient, prodClient);
		default:
			throw new Error('Server: No matching configuration was found!');
	}
};
