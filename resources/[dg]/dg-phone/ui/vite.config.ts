import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import eslintPlugin from 'vite-plugin-eslint';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	plugins: [
		vueJsx(),
		vue(),
		eslintPlugin({
			fix: true,
			throwOnWarning: false,
			throwOnError: false,
		}),
		Components({
			resolvers: [ElementPlusResolver()],
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
