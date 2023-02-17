import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
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

Sentry.init({
  app,
  dsn: 'https://cc7344654c4d4627a26960e6f6848d07@sentry.nuttyshrimp.me/15',
  integrations: [
    // @ts-ignore
    new BrowserTracing({
      // @ts-ignore
      tracingOrigins: [`https://${GetParentResourceName()}`],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  release: '1.0.0',
  attachStacktrace: true,
  tracesSampleRate: 1.0,
});

app.use(store, key);
// @ts-ignore
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
