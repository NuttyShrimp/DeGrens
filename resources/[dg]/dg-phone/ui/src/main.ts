import { createApp } from 'vue';
import App from './App.vue';
import { key, store } from './lib/state';
import vToolTip from 'v-tooltip';
import '@vueup/vue-quill/dist/vue-quill.bubble.prod.css';
import 'v-tooltip/dist/v-tooltip.css';
import './deps/materialize.css';
import 'materialize-css/dist/js/materialize.min';

createApp(App)
	.use(store, key)
	.use(vToolTip, {
		offset: [0, 10],
		themes: {
			tooltip: {
				delay: 0,
			},
		},
	})
	.mount('#app');
