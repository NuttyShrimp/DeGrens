import { FC, useEffect } from 'react';
import { devDataEmulator } from '@src/lib/devdata';
import { isDevel } from '@src/lib/env';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

// A small component which we use to seed our store and updater in for a given ConfigObject

export const AppContainer: FC<{ config: Pick<ConfigObject, 'name' | 'render'> }> = ({ config }) => {
  const toggleApp = useVisibleStore(s => s.toggleApp);
  useEffect(() => {
    if (isDevel()) {
      devDataEmulator(config.name);
    }
  }, []);

  return config.render({
    hideApp: () => toggleApp(config.name, false),
    showApp: () => toggleApp(config.name, true),
  });
};
