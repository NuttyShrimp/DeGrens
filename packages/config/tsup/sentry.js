const path = require('path');
const fs = require('fs');
const os = require('os');
const { glob } = require('glob');
const { promisify } = require('util');
const { version } = require('./package.json');
const SentryCli = require('@sentry/cli');
const { v4: uuidv4 } = require('uuid');

function defaultRewriteSourcesHook(source) {
  return path.relative(process.cwd(), path.normalize(source));
}

const genOptions = () => ({
  ignore: ['node_modules'],
  release: {
    name: version,
    cleanArtifacts: true,
    setCommits: {
      auto: true,
    },
    // defaults
    inject: true,
    create: true,
    finalize: true,
    vcsRemote: 'origin',
  },
  authToken: '5e2d7e8c0d6a42348a0c50dbf655896524c8414752804c8ea1ca04e357be9cd8',
  url: 'https://sentry.nuttyshrimp.me/',
  org: 'nutty',
  project: 'degrens-cfx',
  sourcemaps: {
    assets: '../server/*',
    rewriteSources: defaultRewriteSourcesHook,
  },
  // From default options
  debug: true,
  telemetry: true,
  disable: false,
  _experiments: {},
});

const determineDebugIdFromBundleSource = code => {
  const match = code.match(
    /sentry-dbid-([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})/
  );

  if (match) {
    return match[1];
  } else {
    return undefined;
  }
};

const prepareBundleForDebugIdUpload = async (bundleFilePath, uploadFolder, chunkIndex, rewriteSourcesHook) => {
  let bundleContent;
  try {
    bundleContent = await promisify(fs.readFile)(bundleFilePath, 'utf8');
  } catch (e) {
    console.error(`Could not read bundle to determine debug ID and source map: ${bundleFilePath}`, e);
    return;
  }

  const debugId = determineDebugIdFromBundleSource(bundleContent);
  if (debugId === undefined) {
    console.debug(
      `Could not determine debug ID from bundle. This can happen if you did not clean your output folder before installing the Sentry plugin. File will not be source mapped: ${bundleFilePath}`
    );
    return;
  }

  const uniqueUploadName = `${debugId}-${chunkIndex}`;

  bundleContent += `\n//# debugId=${debugId}`;
  const writeSourceFilePromise = fs.promises.writeFile(
    path.join(uploadFolder, `${uniqueUploadName}.js`),
    bundleContent,
    'utf-8'
  );

  const writeSourceMapFilePromise = determineSourceMapPathFromBundle(bundleFilePath, bundleContent).then(
    async sourceMapPath => {
      if (sourceMapPath) {
        return await prepareSourceMapForDebugIdUpload(
          sourceMapPath,
          path.join(uploadFolder, `${uniqueUploadName}.js.map`),
          debugId,
          rewriteSourcesHook
        );
      }
    }
  );

  return Promise.all([writeSourceFilePromise, writeSourceMapFilePromise]);
};

const determineSourceMapPathFromBundle = async (bundlePath, bundleSource) => {
  // 1. try to find source map at `sourceMappingURL` location
  const sourceMappingUrlMatch = bundleSource.match(/^\/\/# sourceMappingURL=(.*)$/);
  if (sourceMappingUrlMatch) {
    const sourceMappingUrl = path.normalize(sourceMappingUrlMatch[1]);
    if (path.isAbsolute(sourceMappingUrl)) {
      return sourceMappingUrl;
    } else {
      return path.join(path.dirname(bundlePath), sourceMappingUrl);
    }
  }

  // 2. try to find source map at path adjacent to chunk source, but with `.map` appended
  try {
    const adjacentSourceMapFilePath = bundlePath + '.map';
    await promisify(fs.access)(adjacentSourceMapFilePath);
    return adjacentSourceMapFilePath;
  } catch (e) {
    // noop
  }

  // This is just a debug message because it can be quite spammy for some frameworks
  console.debug(
    `Could not determine source map path for bundle: ${bundlePath} - Did you turn on source map generation in your bundler?`
  );
  return undefined;
};

const prepareSourceMapForDebugIdUpload = async (sourceMapPath, targetPath, debugId, rewriteSourcesHook) => {
  let sourceMapFileContent;
  try {
    sourceMapFileContent = await promisify(fs.readFile)(sourceMapPath, {
      encoding: 'utf8',
    });
  } catch (e) {
    console.error(`Failed to read source map for debug ID upload: ${sourceMapPath}`, e);
    return;
  }

  let map;
  try {
    map = JSON.parse(sourceMapFileContent);
    map['debug_id'] = debugId;
    map['debugId'] = debugId;
  } catch (e) {
    console.error(`Failed to parse source map for debug ID upload: ${sourceMapPath}`);
    return;
  }

  if (map['sources'] && Array.isArray(map['sources'])) {
    map['sources'].map(source => rewriteSourcesHook(source, map));
  }

  try {
    await promisify(fs.writeFile)(targetPath, JSON.stringify(map), {
      encoding: 'utf8',
    });
  } catch (e) {
    console.error(`Failed to prepare source map for debug ID upload: ${sourceMapPath}`, e);
    return;
  }
};

const uploadSourceMaps = async resName => {
  const options = genOptions(resName);
  const cliInstance = new SentryCli(null, {
    authToken: options.authToken,
    org: options.org,
    project: options.project,
    silent: options.silent,
    url: options.url,
    vcsRemote: options.release.vcsRemote,
    headers: options.headers,
  });
  const releaseName = options.release.name;

  // RELEASE CREATION

  if (options.release.create) {
    await cliInstance.releases.new(options.release.name);
  }

  if (options.release.cleanArtifacts) {
    await cliInstance.releases.execute(['releases', 'files', releaseName, 'delete', '--all'], true);
  }

  if (options.release.finalize) {
    await cliInstance.releases.finalize(releaseName);
  }

  // Upload thingy
  let folderToCleanUp;

  try {
    const tmpUploadFolder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sentry-bundler-plugin-upload-'));
    folderToCleanUp = tmpUploadFolder;

    let globAssets;
    if (options.sourcemaps?.assets) {
      globAssets = options.sourcemaps.assets;
    } else {
      if (options.debug) {
        throw Error('No `sourcemaps.assets` option provided, falling back to uploading detected build artifacts.');
      }
    }

    const globResult = await glob(globAssets, {
      absolute: true,
      nodir: true,
      ignore: options.sourcemaps?.ignore,
    });

    const debugIdChunkFilePaths = globResult.filter(
      debugIdChunkFilePath =>
        debugIdChunkFilePath.endsWith('.js') ||
        debugIdChunkFilePath.endsWith('.mjs') ||
        debugIdChunkFilePath.endsWith('.cjs')
    );

    // The order of the files output by glob() is not deterministic
    // Ensure order within the files so that {debug-id}-{chunkIndex} coupling is consistent
    debugIdChunkFilePaths.sort();

    if (Array.isArray(options.sourcemaps?.assets) && options.sourcemaps.assets.length === 0) {
      if (options.debug) {
        console.debug('Empty `sourcemaps.assets` option provided. Will not upload sourcemaps with debug ID.');
      }
    } else if (debugIdChunkFilePaths.length === 0) {
      console.warn(
        "Didn't find any matching sources for debug ID upload. Please check the `sourcemaps.assets` option."
      );
    } else {
      await Promise.all(
        debugIdChunkFilePaths.map(async (chunkFilePath, chunkIndex) => {
          await prepareBundleForDebugIdUpload(
            chunkFilePath,
            tmpUploadFolder,
            chunkIndex,
            options.sourcemaps?.rewriteSources
          );
        })
      );

      await cliInstance.releases.uploadSourceMaps(
        releaseName ?? 'undefined', // unfortunetly this needs a value for now but it will not matter since debug IDs overpower releases anyhow
        {
          include: [
            {
              paths: [tmpUploadFolder],
              rewrite: false,
              dist: options.dist,
            },
          ],
          useArtifactBundle: true,
        }
      );

      console.log('Successfully uploaded source maps to Sentry');
    }

    const filesToDeleteAfterUpload =
      options.sourcemaps?.filesToDeleteAfterUpload ?? options.sourcemaps?.deleteFilesAfterUpload;
    if (filesToDeleteAfterUpload) {
      const filePathsToDelete = await glob(filesToDeleteAfterUpload, {
        absolute: true,
        nodir: true,
      });

      filePathsToDelete.forEach(filePathToDelete => {
        if (options.debug) {
          console.debug(`Deleting asset after upload: ${filePathToDelete}`);
        }
      });

      await Promise.all(filePathsToDelete.map(filePathToDelete => fs.promises.rm(filePathToDelete, { force: true })));
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (folderToCleanUp) {
      fs.promises.rm(folderToCleanUp, { recursive: true, force: true });
    }
  }
};

// This will inject the debug id
function getDebugIdSnippet(debugId) {
  return `;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}}();`;
}

function esbuildDebugIdInjectionPlugin() {
  const pluginName = 'sentry-esbuild-debug-id-injection-plugin';
  const stubNamespace = 'sentry-debug-id-stub';

  return {
    name: pluginName,
    setup({ onLoad, onResolve }) {
      onResolve({ filter: /.*/ }, args => {
        if (args.kind !== 'entry-point') {
          return;
        } else {
          return {
            pluginName,
            // needs to be an abs path, otherwise esbuild will complain
            path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
            pluginData: {
              isProxyResolver: true,
              originalPath: args.path,
              originalResolveDir: args.resolveDir,
            },
            suffix: '?sentryProxyModule=true',
          };
        }
      });

      onLoad({ filter: /.*/ }, args => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!args.pluginData?.isProxyResolver) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const originalPath = args.pluginData.originalPath;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const originalResolveDir = args.pluginData.originalResolveDir;

        return {
          loader: 'js',
          pluginName,
          // We need to use JSON.stringify below so that any escape backslashes stay escape backslashes, in order not to break paths on windows
          contents: `
            import "_sentry-debug-id-injection-stub";
            import * as OriginalModule from ${JSON.stringify(originalPath)};
            export default OriginalModule.default;
            export * from ${JSON.stringify(originalPath)};`,
          resolveDir: originalResolveDir,
        };
      });

      onResolve({ filter: /_sentry-debug-id-injection-stub/ }, args => {
        return {
          path: args.path,
          sideEffects: true,
          pluginName,
          namespace: stubNamespace,
          suffix: '?sentry-module-id=' + uuidv4(), // create different module, each time this is resolved
        };
      });

      onLoad({ filter: /_sentry-debug-id-injection-stub/, namespace: stubNamespace }, () => {
        return {
          loader: 'js',
          pluginName,
          contents: getDebugIdSnippet(uuidv4()),
        };
      });
    },
  };
}

module.exports = { uploadSourceMaps, esbuildDebugIdInjectionPlugin };