const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck');
const path = require('path');
const fs = require('fs');
const { importPatternPlugin } = require('esbuild-plugin-import-pattern');
const { uploadSourceMaps, esbuildDebugIdInjectionPlugin } = require('./sentry');

const FILES_TO_MOVE = {
  '../client/client.js': ['./dist/client/client.js', './dist/client.js'],
  '../server/server.js': ['./dist/server/server.js', './dist/server.js'],
  '../server/server.js.map': ['./dist/server/server.js.map', './dist/server.js.map'],
};

const findResourceName = filePath => {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(path.resolve(dirName, 'fxmanifest.lua'))) {
    return path.basename(dirName);
  } else if (filePath === '.') {
    return null;
  }
  return findResourceName(dirName);
};

const moveBuildedFiles = (source, target) => {
  return new Promise(res => {
    fs.stat(source, e => {
      if (e !== null) {
        res();
        return;
      }
      fs.cpSync(source, target);
      console.log(`moved ${path.basename(target)} file`);
      res();
    });
  });
};

/** @type {import("tsup").Options} */
const getOptions = opts => {
  const resName = findResourceName(path.resolve('.'));
  const ENV = opts.env?.NODE_ENV || 'development';
  const IS_PROD = ENV === 'production';
  const baseConfig = {
    name: resName,
    splitting: false,
    clean: true, // clean up the dist folder
    format: 'cjs',
    minify: IS_PROD,
    bundle: true,
    skipNodeModulesBundle: false,
    shims: true,
    sourcemap: true,
    keepNames: true,
    noExternal: [/.*/],
    target: 'es2021',
    outDir: 'dist',
    treeshake: 'recommended',
    platform: 'node',
    entry: [],
    env: {
      NODE_ENV: ENV,
    },
    esbuildPlugins: [importPatternPlugin()],
    outExtension() {
      return {
        js: `.js`,
      };
    },
    async onSuccess() {
      await Promise.allSettled(
        Object.keys(FILES_TO_MOVE)
          .map(target => {
            const sources = FILES_TO_MOVE[target];
            return sources.map(source => moveBuildedFiles(source, target));
          })
          .flat()
      );
      if (process.env.SENTRY_UPLOAD_SOURCEMAPS || opts.env.SENTRY_UPLOAD_SOURCEMAPS) {
        await uploadSourceMaps(resName);
      }
      // cleanup
      fs.rmSync('./dist', { recursive: true });
    },
  };

  try {
    if (fs.statSync('./src/client/client.ts')) {
      baseConfig.entry.push('./src/client/client.ts');
      baseConfig.esbuildPlugins.push(
        typecheckPlugin({
          configFile: 'tsconfig.json',
          workingDir: path.resolve('./src/client'),
        })
      );
    }
  } catch (e) {
    // console.error(e)
  }

  try {
    if (fs.statSync('./src/server/server.ts')) {
      baseConfig.entry.push('./src/server/server.ts');
      baseConfig.esbuildPlugins.push(
        typecheckPlugin({
          configFile: 'tsconfig.json',
          workingDir: path.resolve('./src/server'),
        })
      );
    }
  } catch (e) {
    // console.error(e)
  }

  if (process.env.SENTRY_UPLOAD_SOURCEMAPS || opts.env.SENTRY_UPLOAD_SOURCEMAPS) {
    baseConfig.esbuildPlugins.push(esbuildDebugIdInjectionPlugin());
  }

  return baseConfig;
};

module.exports = { getOptions };
