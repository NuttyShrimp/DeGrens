import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { devDataEmulator } from './lib/devdata';
import { isDevel, isGameDevel } from './lib/env';
import { handleIncomingEvent } from './lib/event-relay';
import { Provider, store } from './lib/redux';
import { getAllComponents } from './base-app.config';
import { IndexProvider } from './index.provider';

import './styles/main.scss';

if (!isDevel()) {
  Sentry.init({
    dsn: 'https://ecf541af25474c54917d8e2445317213@sentry.nuttyshrimp.me/10',
    integrations: [
      new BrowserTracing({
        // @ts-ignore
        tracingOrigins: [`https://${GetParentResourceName()}`],
        maxTransactionDuration: 30000,
      }),
    ],
    release: '1.0.0',
    environment: isGameDevel() ? 'development' : 'production',
    // It's high but players are not going to give u shit when an error pops :)
    normalizeDepth: 10,
    attachStacktrace: true,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

function App() {
  const components = getAllComponents();
  useEffect(() => {
    const devMode = isDevel();
    const gameDevMode = isGameDevel();
    if (devMode || gameDevMode) {
      if (devMode) {
        console.log('[DG-UI] Running in development mode');
      }
      if (gameDevMode) {
        console.log('[DG-UI] Running in game development mode');
      }
    }
    window.addEventListener('message', handleIncomingEvent);
    if (devMode) {
      console.log('[DG-UI] Running in development mode');
      devDataEmulator();
    }
    return () => {
      window.removeEventListener('message', handleIncomingEvent);
    };
  }, []);
  return <div className='ui-wrapper'>{components.map((component, i) => component.render({ key: i }))}</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <IndexProvider>
        <App />
      </IndexProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
