import { useEffect } from 'react';

import { AppContainer } from './components/appcontainer';
import { isDevel, isGameDevel } from './lib/env';
import { useMainStore } from './lib/stores/useMainStore';
import { useConfigmenuStore } from './main/configmenu/stores/useConfigmenuStore';

export function App() {
  const apps = useMainStore(s => s.apps);
  const [uiConfig] = useConfigmenuStore(s => [s.ui]);

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
  }, []);

  useEffect(() => {
    document.getElementsByTagName('body')[0].style.fontSize = `${uiConfig.fontSize}px`;
    document.getElementsByTagName('html')[0].style.fontSize = `${uiConfig.fontSize}px`;
  }, [uiConfig.fontSize]);

  return (
    <div className='ui-wrapper'>
      {apps.map((component, i) => (
        <AppContainer config={component} key={`${component.name}-${i}`} />
      ))}
    </div>
  );
}
