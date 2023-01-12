/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs')
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const { version } = require('../package.json');

const common = require('./webpack.common');

const findResourceName = (filePath) => {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(path.resolve(dirName, 'fxmanifest.lua'))) {
    return path.basename(dirName);
  } else if (filePath === '.') {
    return null;
  }
  return findResourceName(dirName);
};

const defClient = (fName) => ({
	entry: path.resolve(`./src/server/${fName}.ts`),
	resolve: {
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve('./src/server/tsconfig.json'),
			}),
		],
	},
	output: {
    path: path.resolve("../server"),
		clean: true,
	},
});

const prodClient = {
	devtool: 'source-map',
	plugins: [
		new SentryCliPlugin({
			include: path.resolve("../server"),
			ignore: ['node_modules', 'webpack.config.js'],
			release: version,
			configFile: 'sentry.properties',
      urlPrefix: findResourceName(path.resolve(".")),
		}),
	],
	output: {
		filename: 'server.js',
	},
};

const devClient = (noHash) => ({
	output: {
    filename: noHash ? "server.js" : '[contenthash].server.js',
	},
});

module.exports = (_, args, fName, noHash) => {
	const env = args.mode ?? 'production';
  const baseConfig = merge(common, defClient(fName ?? "server"))
	switch (env) {
		case 'development':
			return merge(baseConfig, devClient(noHash));
		case 'production':
			return merge(baseConfig, prodClient);
		default:
			throw new Error('Server: No matching configuration was found!');
	}
};
