import { useCallback } from 'react';

import { useMainStore } from '../stores/useMainStore';

export const useApps = () => {
  const [currentApp, apps, setApps] = useMainStore(s => [s.currentApp, s.apps, s.setApps]);

  const loadApps = useCallback(async () => {
    const components: ConfigObject[] = [];
    const importAll = r => {
      return Promise.all(
        Object.keys(r).map(async key => {
          const config = (await r[key]()).default;
          if (components.find(cmp => cmp.name == config.name)) {
            console.error(`Double config key detected: ${config.name}`);
            return;
          }
          components.push(config);
        })
      );
    };
    await importAll(import.meta.glob('../../main/*/_config.tsx'));
    setApps(components);
  }, []);

  const getApp = useCallback(
    (name: keyof RootState): ConfigObject | undefined => apps.find(a => a.name === name),
    [apps]
  );

  const getCurrentAppType = useCallback(() => {
    const activeApp = apps.find(a => a.name !== 'cli' && a.name === currentApp);
    if (!activeApp) return;

    if (activeApp.type instanceof Function) {
      return activeApp.type();
    }

    return activeApp.type;
  }, [apps, currentApp]);

  return {
    loadApps,
    getApp,
    getCurrentAppType,
  };
};
