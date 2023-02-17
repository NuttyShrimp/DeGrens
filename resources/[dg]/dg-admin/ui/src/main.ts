import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
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

Sentry.init({
  app,
  dsn: 'https://cc7344654c4d4627a26960e6f6848d07@sentry.nuttyshrimp.me/15',
  integrations: [
    // @ts-ignore
    new BrowserTracing({
      // @ts-ignore
      tracingOrigins: [`https://${typeof GetParentResourceName !== 'undefined' ? GetParentResourceName() : 'dev-env'}`],
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
  plugins: {}, // import Quasar plugins and add here
  iconSet: quasarIconSet,
  supportTS: true,
  config: {
    animations: [],
    dark: true,
  },
});
app.mount('#app');
