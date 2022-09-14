import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useUpdateState } from '../redux';

export const useApps = () => {
  const mainState = useSelector<RootState, Main.State>(state => state.main);
  const updateState = useUpdateState('main');

  const loadApps = useCallback(() => {
    const components: ConfigObject[] = [];
    const importAll = r => {
      Object.keys(r).forEach(key => {
        const config = r[key].default;
        if (components.find(cmp => cmp.name == config.name)) {
          console.error(`Double config key detected: ${config.name}`);
          return;
        }
        components.push(config);
      });
    };
    importAll(import.meta.glob('../../main/*/_config.tsx', { eager: true }));
    updateState({
      apps: components,
    });
  }, []);

  const getApp = useCallback(
    (name: keyof RootState): ConfigObject | undefined => mainState.apps.find(a => a.name === name),
    [mainState]
  );

  const getCurrentAppType = useCallback(() => {
    return mainState.apps.filter(a => a.name !== 'cli').find(a => a.name === mainState.currentApp)?.type;
  }, [mainState]);

  return {
    loadApps,
    getApp,
    getCurrentAppType,
  };
};
