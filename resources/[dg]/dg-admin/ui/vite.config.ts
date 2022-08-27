import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vueJsx(),
    vue({
      template: { transformAssetUrls },
    }),
    splitVendorChunkPlugin(),
    quasar({
      autoImportComponentCase: 'combined',
      sassVariables: 'src/styles/quasar-variables.sass',
    }),
  ],
  resolve: {
    alias: {
      // @ts-ignore
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  assetsInclude: ['./src/assets'],
});
