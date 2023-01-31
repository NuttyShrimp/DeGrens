/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const { merge } = require('webpack-merge');

const common = require('./webpack.common');

const defClient = (fName) => ({
  entry: path.resolve(`./src/client/${fName}.ts`),
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve('./src/client/tsconfig.json'),
      },
      logger: console,
    })
  ],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve('./src/client/tsconfig.json'),
      }),
    ],
  },
  output: {
    path: path.resolve("../client"),
    clean: true,
  },
});

const prodClient = {
  output: {
    filename: 'client.js',
  },
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

const devClient = (noHash) => ({
  output: {
    filename: noHash ? "client.js" : '[contenthash].client.js',
  },
});

module.exports = (_, args, fName, noHash) => {
  const env = args.mode ?? 'production';
  const baseConfig = merge(common, defClient(fName ?? "client"))
  switch (env) {
    case 'development':
      return merge(baseConfig, devClient(noHash));
    case 'production':
      return merge(baseConfig, prodClient);
    default:
      throw new Error('Client: No matching configuration was found!');
  }
};
