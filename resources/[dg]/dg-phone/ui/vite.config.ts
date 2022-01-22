import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	plugins: [
		vueJsx(),
		vue({
			template: { transformAssetUrls },
		}),
		eslintPlugin({
			fix: true,
			throwOnWarning: false,
			throwOnError: false,
		}),
		quasar({
			sassVariables: 'src/styles/quasar-variables.sass',
		}),
	],
	resolve: {
		alias: {
			// @ts-ignore
			'@': path.resolve(__dirname, './src'),
		},
	},
	assetsInclude: ['./src/assets'],
});
