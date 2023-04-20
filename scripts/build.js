const { build } = require('esbuild');
const path = require('path');
const { clientConfig, serverConfig, findResourceName } = require('./config');
const { sentryEsbuildPlugin } = require('@sentry/esbuild-plugin');
const { version } = require('../package.json');

const buildClientDev = async () => {
  await build({
    ...clientConfig,
  });
  console.log(`[${findResourceName(path.resolve('.'))}] [Client] Successfully built`);
};

const buildClient = async () => {
  await build({
    ...clientConfig,
    minify: true,
    keepNames: false,
  });
  console.log(`[${findResourceName(path.resolve('.'))}] [Client] Successfully built`);
};

const buildServerDev = async () => {
  await build({
    ...serverConfig,
  });
  console.log(`[${findResourceName(path.resolve('.'))}] [Server] Successfully built`);
};

const buildServer = async () => {
  await build({
    ...serverConfig,
    sourcemap: true,
    plugins: [
      ...serverConfig.plugins,
      sentryEsbuildPlugin({
        include: '../server',
        ignore: ['node_modules'],
        release: version,
        urlPrefix: findResourceName(path.resolve('.')),
        token: '5e2d7e8c0d6a42348a0c50dbf655896524c8414752804c8ea1ca04e357be9cd8',
        dsn: 'https://47836ea9173b4e52b8820a05996cf549@sentry.nuttyshrimp.me/2',
        url: 'https://sentry.nuttyshrimp.me/',
        org: 'nutty',
        project: 'degrens-cfx',
      }),
    ],
  });
  console.log(`[${findResourceName(path.resolve('.'))}] [Server] Successfully built`);
};

if (process.argv.includes('--server')) {
  if (process.argv.includes('--dev')) {
    buildServerDev();
  } else {
    buildServer();
  }
}
if (process.argv.includes('--client')) {
  if (process.argv.includes('--dev')) {
    buildClientDev();
  } else {
    buildClient();
  }
}