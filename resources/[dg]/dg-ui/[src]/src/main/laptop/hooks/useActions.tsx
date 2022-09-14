import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useUpdateState } from '../../../lib/redux';

export const useActions = () => {
  const updateState = useUpdateState('laptop');
  const updateConfigState = useUpdateState('laptop.config');
  const laptopState = useSelector<RootState, Laptop.State>(state => state.laptop);

  const loadApps = useCallback(() => {
    const apps: Laptop.Config.Config[] = [];
    const importAll = r => {
      Object.keys(r).forEach(key => {
        const config: Laptop.Config.Config = r[key].default;
        apps.push(config);
      });
    };
    importAll(import.meta.glob('../apps/**/config.tsx', { eager: true }));
    updateConfigState({
      config: apps,
    });
  }, []);

  const openApp = useCallback(
    (name: string) => {
      if (laptopState.activeApps.includes(name)) return;
      updateState({
        activeApps: [...laptopState.activeApps, name],
      });
    },
    [laptopState]
  );

  const closeApp = useCallback(
    (name: string) => {
      if (!laptopState.activeApps.includes(name)) return;
      updateState({
        activeApps: laptopState.activeApps.filter(a => a !== name),
      });
    },
    [laptopState]
  );

  const focusApp = useCallback(
    (name: string) => {
      if (laptopState.focusedApp === name) return;
      updateState({
        focusedApp: name,
      });
    },
    [laptopState]
  );

  return {
    openApp,
    closeApp,
    focusApp,
    loadApps,
  };
};
