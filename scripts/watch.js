const { context } = require('esbuild');
const path = require('path');
const { findResourceName, clientConfig, serverConfig } = require('./config');

const watchClient = async () => {
  let ctx = await context({
    ...clientConfig,
    logLevel: 'info',
  });
  await ctx.watch();
  console.log(`[${findResourceName(path.resolve('.'))}] [CLIENT] watching`);
};

const watchServer = async () => {
  let ctx = await context({
    ...serverConfig,
    logLevel: 'info',
  });
  await ctx.watch();
  console.log(`[${findResourceName(path.resolve('.'))}] [SERVER] watching`);
};

if (process.argv.includes('--server')) {
  watchServer();
}
if (process.argv.includes('--client')) {
  watchClient();
}
