import react from '@vitejs/plugin-react-swc';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import Checker from 'vite-plugin-checker';
import viteSentry from 'vite-plugin-sentry';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

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
      url: 'https://sentry.nuttyshrimp.me',
      authToken: '5e2d7e8c0d6a42348a0c50dbf655896524c8414752804c8ea1ca04e357be9cd8',
      org: 'nutty',
      project: 'degrens-ui',
      debug: true,
      deploy: {
        env: mode === 'production' || process.env.SENTRY_UPLOAD_SOURCEMAPS ? 'production' : 'development',
      },
      setCommits: {
        auto: true,
      },
      sourceMaps: {
        include: ['../html/assets'],
        ignore: ['node_modules'],
        urlPrefix: '~/assets',
      },
    }),
  ],
}));
