import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
import { Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/fontawesome-v6';
import { createApp } from 'vue';

import { key, store } from '@/lib/store';

import 'quasar/src/css/index.sass';

import App from './App.vue';

// Import icon libraries
import './vendor/quasar/roboto-font/roboto-font.css';
import './vendor/quasar/material-icons/material-icons.css';
import './vendor/quasar/fontawesome-v6/fontawesome-v6.css';
import './vendor/quasar/line-awesome/line-awesome.css';

const app = createApp(App);

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: '',
    integrations: [
      // @ts-ignore
      new BrowserTracing({
        tracingOrigins: [
          // @ts-ignore
          `https://${typeof GetParentResourceName !== 'undefined' ? GetParentResourceName() : 'dev-env'}`,
        ],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    release: '1.0.0',
    attachStacktrace: true,
    tracesSampleRate: 1.0,
  });
}

app.use(store, key);
// @ts-ignore
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
