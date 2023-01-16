import { useCallback } from 'react';

import { uuidv4 } from '../../../lib/util';
import { useLaptopConfigStore } from '../stores/useLaptopConfigStore';
import { useLaptopConfirmStore } from '../stores/useLaptopConfirmStore';
import { useLaptopStore } from '../stores/useLaptopStore';

export const useActions = () => {
  const updateConfirmData = useLaptopConfirmStore(s => s.setData);
  const updateConfigStore = useLaptopConfigStore(s => s.updateStore);
  const [addActiveApp, removeActiveApp, setFocusedApp, addStoreNotification, removeStoreNotfication] = useLaptopStore(
    s => [s.addActiveApp, s.removeActiveApp, s.setFocusedApp, s.addNotification, s.removeNotification]
  );

  const loadApps = useCallback(() => {
    const apps: Laptop.Config.Config[] = [];
    const importAll = r => {
      Object.keys(r).forEach(key => {
        const config: Laptop.Config.Config = r[key].default;
        apps.push(config);
      });
    };
    importAll(import.meta.glob('../apps/**/config.tsx', { eager: true }));
    updateConfigStore({
      config: apps,
    });
  }, []);

  const openApp = useCallback(
    (name: string) => {
      addActiveApp(name);
    },
    [addActiveApp]
  );

  const addNotification = useCallback((app: string, message: string) => {
    const id = uuidv4();
    addStoreNotification({ id, app, message });
    setTimeout(() => {
      removeStoreNotfication(id);
    }, 5000);
  }, []);

  const openConfirm = useCallback(
    (data: Laptop.Confirm.Data) => {
      openApp('confirm');
      updateConfirmData(data);
    },
    [openApp]
  );

  return {
    openApp,
    closeApp: removeActiveApp,
    focusApp: setFocusedApp,
    loadApps,
    addNotification,
    openConfirm,
  };
};
