import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { isDevel, isGameDevel } from './lib/env';
import { App } from './base-app';
import { IndexProvider } from './index.provider';

import './styles/main.scss';
import 'animate.css';
import '@degrens-21/fa-6/css/all.css';

if (!isDevel() && !isGameDevel()) {
  Sentry.init({
    dsn: 'https://0bc1faba50b14e49a85259c0b3b05dc8@sentry.nuttyshrimp.me/3',
    integrations: [
      // @ts-ignore
      new BrowserTracing({
        // @ts-ignore
        tracingOrigins: [`https://${GetParentResourceName()}`],
      }),
    ],
    release: '1.0.0',
    environment: 'production',
    // It's high but players are not going to give u shit when an error pops :)
    normalizeDepth: 10,
    attachStacktrace: true,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

const rootElem = document.getElementById('root');
const root = createRoot(rootElem as HTMLElement);
root.render(
  <IndexProvider>
    <App />
  </IndexProvider>
);
