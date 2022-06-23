import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { AppContainer } from './components/appcontainer';
import { devDataEmulator } from './lib/devdata';
import { isDevel, isGameDevel } from './lib/env';
import { handleIncomingEvent } from './lib/event-relay';
import { Provider, store } from './lib/redux';
import { useApps } from './base-app.config';
import { IndexProvider } from './index.provider';

import './styles/main.scss';
import '@degrens-21/fa-6/css/all.css';

function App() {
  const { getAllApps } = useApps();
  useMemo(() => {
    const devMode = isDevel();
    const gameDevMode = isGameDevel();
    if (devMode || gameDevMode) {
      if (devMode) {
        console.log('[DG-UI] Running in development mode');
        console.log('started render of all app components, Total:', getAllApps().length);
        setTimeout(() => {
          devDataEmulator();
        }, 1000);
      }
      if (gameDevMode) {
        console.log('[DG-UI] Running in game development mode');
      }
    }
    window.addEventListener('message', handleIncomingEvent);
    return () => {
      window.removeEventListener('message', handleIncomingEvent);
    };
  }, []);
  return (
    <div className='ui-wrapper'>
      {getAllApps().map((component, i) => (
        <AppContainer config={component} key={`${component.name}-${i}`} />
      ))}
    </div>
  );
}

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

const rootElem = document.getElementById('root');
const root = createRoot(rootElem as HTMLElement);
root.render(
  <Provider store={store}>
    <IndexProvider>
      <App />
    </IndexProvider>
  </Provider>
);
