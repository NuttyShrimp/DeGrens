const path = require('path');
const fs = require('fs');
const { esbuildDecorators } = require('@anatine/esbuild-decorators');
const { filelocPlugin } = require('esbuild-plugin-fileloc'); // This plugins adds a support layer for __dirname og __filename
const { clean } = require('esbuild-plugin-clean');
const { importPatternPlugin } = require('esbuild-plugin-import-pattern');
const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck');

const findResourceName = filePath => {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(path.resolve(dirName, 'fxmanifest.lua'))) {
    return path.basename(dirName);
  } else if (filePath === '.') {
    return null;
  }
  return findResourceName(dirName);
};

const baseConfig = side => ({
  entryPoints: [`${process.argv.includes('--index') ? 'index' : side}.ts`],
  outfile: `../../../${side}/${side}.js`,
  absWorkingDir: path.resolve(`src/${side}`),
  loader: { '.node': 'binary' },
  format: "esm",
  sourcemap: 'linked',
  bundle: true,
  minify: false,
  keepNames: true,
  color: true,
  treeShaking: true,
  plugins: [
    importPatternPlugin(),
    clean({
      patterns: [`../../../${side}/*.js`],
      options: {
        force: true,
      },
    }),
    // TypeCheck(side),
    typecheckPlugin(),
  ],
});

const serverConfig = {
  ...baseConfig('server'),
  platform: 'node',
  target: 'node16',
  plugins: [
    ...baseConfig('server').plugins,
    filelocPlugin(),
    esbuildDecorators({
      tsconfig: path.resolve('tsconfig.json'),
    }),
  ],
};

const clientConfig = {
  ...baseConfig('client'),
};

module.exports = {
  serverConfig,
  clientConfig,
  findResourceName,
};