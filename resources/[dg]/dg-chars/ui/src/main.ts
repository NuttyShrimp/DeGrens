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
import './vendor/quasar/roboto-font/roboto-font.css';
import './vendor/quasar/material-icons/material-icons.css';
// Animations
import './vendor/quasar/animate/fadeInDown.css';
import './vendor/quasar/animate/fadeOutUp.css';
import './vendor/quasar/animate/slideInDown.css';
import './vendor/quasar/animate/slideOutUp.css';

const app = createApp(App);

Sentry.init({
  app,
  dsn: 'https://8505c6e164a24f0a9b25e6df4543a12b@sentry.nuttyshrimp.me/6',
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
