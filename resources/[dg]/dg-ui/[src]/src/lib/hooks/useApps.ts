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
    (name: keyof RootState): ConfigObject => {
      const app = apps.find(a => a.name === name);
      if (!app) {
        throw new Error(`No config found for ${name}`);
      }
      return app;
    },
    [apps]
  );

  const getCurrentAppType = useCallback(() => {
    const activeApp = apps.find(a => a.name !== 'cli' && a.name === currentApp);
    if (!activeApp) return;
    const appType = activeApp.type instanceof Function ? activeApp.type() : activeApp.type;
    return appType;
  }, [apps, currentApp]);

  return {
    loadApps,
    getApp,
    getCurrentAppType,
  };
};
