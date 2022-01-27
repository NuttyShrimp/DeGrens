import { createApp } from 'vue';
import App from './App.vue';
import { key, store } from '@/lib/store';
import vToolTip from 'v-tooltip';
import 'v-tooltip/dist/v-tooltip.css';
import 'mdb-vue-ui-kit/css/mdb.min.css';

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
