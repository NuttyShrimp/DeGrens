import React from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { AppContainer } from './components/appcontainer';
import { isDevel, isGameDevel } from './lib/env';
import { handleIncomingEvent } from './lib/event-relay';

export function App() {
  const apps = useSelector<RootState, ConfigObject[]>(state => state.main.apps);

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
    return () => {
      window.removeEventListener('message', handleIncomingEvent);
    };
  }, []);

  return (
    <div className='ui-wrapper'>
      {apps.map((component, i) => (
        <AppContainer config={component} key={`${component.name}-${i}`} />
      ))}
    </div>
  );
}
