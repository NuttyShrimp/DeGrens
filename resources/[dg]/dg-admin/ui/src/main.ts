import { Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/fontawesome-v6';
import { createApp } from 'vue';

import { key, store } from '@/lib/store';

import 'quasar/src/css/index.sass';

import App from './App.vue';

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css';
import '@quasar/extras/line-awesome/line-awesome.css';

const app = createApp(App);

app.use(store, key);
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  iconSet: quasarIconSet,
  supportTS: true,
  config: {
    animations: [],
    dark: true,
  },
});
app.mount('#app');
