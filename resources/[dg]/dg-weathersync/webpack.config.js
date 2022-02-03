const webpack = require('webpack');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

const buildPath = path.resolve(__dirname, 'dist');

const server = {
	entry: './src/server/server.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: ['ts-loader'],
				exclude: /node_modules/,
			},
		],
	},
	plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false }), new ESLintPlugin()],
	optimization: {
		minimize: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'server.js',
		path: path.resolve(buildPath, 'server'),
		clean: true,
	},
	target: 'node',
};

const client = {
	entry: './src/client/client.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: ['ts-loader'],
				exclude: /node_modules/,
			},
		],
	},
	plugins: [new ESLintPlugin()],
	optimization: {
		minimize: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'client.js',
		path: path.resolve(buildPath, 'client'),
		clean: true,
	},
};

module.exports = [server, client];
