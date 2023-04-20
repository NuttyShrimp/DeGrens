import { BrowserTracing } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';
import { createApp } from 'vue';

import { key, store } from '@/lib/store';

import App from './App.vue';

import 'animate.css/animate.min.css';

const app = createApp(App);

Sentry.init({
  app,
  dsn: 'https://8505c6e164a24f0a9b25e6df4543a12b@sentry.nuttyshrimp.me/6',
  integrations: [
    // @ts-ignore
    new BrowserTracing({
      // @ts-ignore
      tracingOrigins: [`https://${import.meta.env.PROD ? GetParentResourceName() : 'dev-env'}`],
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
