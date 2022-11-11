/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
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

const prodClient = {
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: /node_modules/,
        enforce: 'post',
        use: {
          loader: WebpackObfuscator.loader,
          options: {
            disableConsoleOutput: false,
            optionsPreset: "medium-obfuscation",
            ignoreImports: true,
            sourceMap: false,
            stringArrayThreshold: 1,
            target: "node",
          }
        }
      }
    ]
  }
};

module.exports = (_, args) => {
	const env = args.mode ?? 'production';
	switch (env) {
		case 'production':
			return merge(common, defClient, prodClient);
		default:
			return merge(common, defClient);
	}
};
