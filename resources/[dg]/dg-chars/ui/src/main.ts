import { Notify, Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/fontawesome-v5';
import { createApp } from 'vue';

import { key, store } from '@/lib/store';

// Import Quasar css
import 'quasar/src/css/index.sass';

import App from './App.vue';

// Import icon libraries
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css';
import '@quasar/extras/material-icons/material-icons.css';
// Animations
import '@quasar/extras/animate/fadeInDown.css';
import '@quasar/extras/animate/fadeOutUp.css';
import '@quasar/extras/animate/slideInDown.css';
import '@quasar/extras/animate/slideOutUp.css';

const app = createApp(App);
app.use(store, key);
app.use(Quasar, {
  plugins: {
    Notify,
  }, // import Quasar plugins and add here
  iconSet: quasarIconSet,
  supportTS: true,
  config: {
    animations: ['fadeInDown', 'fadeOutUp'],
    dark: true,
  },
});
app.mount('#app');
