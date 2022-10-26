import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
import { createApp } from 'vue';

import { key, store } from '@/lib/store';

import App from './App.vue';

import 'animate.css/animate.min.css';

const app = createApp(App);

Sentry.init({
  app,
  dsn: 'https://cc7344654c4d4627a26960e6f6848d07@sentry.nuttyshrimp.me/15',
  integrations: [
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
app.mount('#app');
