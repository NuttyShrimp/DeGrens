import react from '@vitejs/plugin-react';
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
      authToken: 'f6efd5c0ab184f3a9b108519f5e9aee4be7f1dd9363d44bd9efd0e16c98f4a0b',
      org: 'nutty',
      project: 'dg-ui',
      debug: true,
      deploy: {
        env: mode === 'production' ? 'production' : 'development',
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
