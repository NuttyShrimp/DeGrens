import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useUpdateState } from '../redux';

export const useApps = () => {
  const mainState = useSelector<RootState, Main.State>(state => state.main);
  const updateState = useUpdateState('main');

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
    updateState({
      apps: components,
    });
  }, []);

  const getApp = useCallback(
    (name: keyof RootState): ConfigObject | undefined => mainState.apps.find(a => a.name === name),
    [mainState.apps]
  );

  const getCurrentAppType = useCallback(
    () =>
      mainState.apps
        .filter(a => a.name !== 'cli')
        .find(a => {
          return a.name === mainState.currentApp;
        })?.type,
    [mainState.apps, mainState.currentApp]
  );

  return {
    loadApps,
    getApp,
    getCurrentAppType,
  };
};
