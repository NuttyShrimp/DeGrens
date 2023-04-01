const { build } = require('esbuild');
const path = require('path');
const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck');

const buildClient = async () => {
  await build({
    entryPoints: [`main.ts`],
    outfile: `../dist/ui.js`,
    absWorkingDir: path.resolve(`src`),
    loader: { '.ts': 'ts' },
    sourcemap: false,
    bundle: true,
    minify: true,
    keepNames: false,
    color: true,
    plugins: [typecheckPlugin()],
  });
  console.log(`[dg-imager] [UI] Successfully built`);
};

buildClient();
