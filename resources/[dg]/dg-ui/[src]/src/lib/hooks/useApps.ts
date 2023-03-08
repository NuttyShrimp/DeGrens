import { useCallback, useEffect, useRef } from 'react';

import { useMainStore } from '../stores/useMainStore';
import { useVisibleStore } from '../stores/useVisibleStore';

export const useApps = () => {
  const [apps, setApps] = useMainStore(s => [s.apps, s.setApps]);
  const visibleApps = useVisibleStore(s => s.visibleApps);
  const vAppRef = useRef<(keyof RootState)[]>([]);

  useEffect(() => {
    vAppRef.current = visibleApps;
  }, [visibleApps]);

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

  const isInteractiveAppOpen = useCallback(
    (skip?: string): boolean => {
      const hasInteractiveAppVisible = vAppRef.current.findIndex(s => {
        if (s === 'cli' || (skip && s === skip)) {
          return false;
        }
        const appConfig = apps.find(a => a.name === s);
        if (!appConfig) return false;
        const appType = appConfig.type instanceof Function ? appConfig.type() : appConfig.type;
        return appType === 'interactive';
      });
      return hasInteractiveAppVisible > -1;
    },
    [apps]
  );

  return {
    loadApps,
    getApp,
    isInteractiveAppOpen,
  };
};
