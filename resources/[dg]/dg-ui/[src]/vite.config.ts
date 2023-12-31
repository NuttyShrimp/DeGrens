import react from '@vitejs/plugin-react-swc';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import Checker from 'vite-plugin-checker';
import viteSentry from 'vite-plugin-sentry';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { version } from './package.json';

export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../html',
    sourcemap: true,
    chunkSizeWarningLimit: 1024,
    minify: mode === 'production' ? 'esbuild' : false,
  },
  server: {
    port: 3000,
  },
  envDir: './env',
  esbuild: { jsx: 'automatic' },
  plugins: [
    react(),
    svgrPlugin(),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    Checker({
      typescript: true,
      enableBuild: false,
      overlay: false,
      eslint: {
        lintCommand: 'eslint --ext ts,tsx src',
      },
    }),
    viteSentry({
      url: '',
      authToken: '',
      org: '',
      project: '',
      debug: true,
      deploy: {
        env: mode === 'production' || process.env.SENTRY_UPLOAD_SOURCEMAPS ? 'production' : 'development',
      },
      release: version,
      setCommits: {
        auto: true,
      },
      cleanArtifacts: true,
      sourceMaps: {
        include: ['../html/assets'],
        ignore: ['node_modules'],
        urlPrefix: '/html/assets',
      },
    }),
  ],
}));
