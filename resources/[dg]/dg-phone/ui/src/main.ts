import { createApp } from 'vue';
import App from './App.vue';
import { key, store } from './lib/state';
import vToolTip from 'v-tooltip';
import '@vueup/vue-quill/dist/vue-quill.bubble.prod.css';
import 'v-tooltip/dist/v-tooltip.css';

import { Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/fontawesome-v5';

// Import icon libraries
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v6/mdi-v6.css';
import '@quasar/extras/eva-icons/eva-icons.css';
import '@quasar/extras/line-awesome/line-awesome.css';
import '@quasar/extras/bootstrap-icons/bootstrap-icons.css';

// Animations
import '@quasar/extras/animate/fadeIn.css';
import '@quasar/extras/animate/fadeOut.css';

// Import Quasar css
import 'quasar/src/css/index.sass';

// Assumes your root component is App.vue
// and placed in same folder as main.js
const myApp = createApp(App);

myApp.use(store, key);
myApp.use(vToolTip, {
	offset: [0, 10],
	themes: {
		tooltip: {
			delay: 0,
		},
	},
});
myApp.use(Quasar, {
	plugins: {}, // import Quasar plugins and add here
	iconSet: quasarIconSet,
	supportTS: true,
	config: {
		animations: 'all',
		dark: true,
	},
});

myApp.mount('#app');
