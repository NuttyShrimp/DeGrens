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
        token: 'efc3ddd95fb6413c9aac316b855ab5cf74008205ec6f40cb9cb6fea043b30711',
        dsn: 'https://ca666003b9db4baeb7bf5b1aab7bc6d1@sentry.nuttyshrimp.me/9',
        url: 'https://sentry.nuttyshrimp.me/',
        org: 'nutty',
        project: 'dg-2-ts-errors',
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
