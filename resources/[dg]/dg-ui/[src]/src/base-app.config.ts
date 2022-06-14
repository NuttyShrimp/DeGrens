import { ReactElement } from 'react';
import { store } from '@lib/redux';

export interface ConfigObject {
  name: keyof RootState;
  render: (p: any) => ReactElement<any, any>;
  type: 'passive' | 'interactive';
}

const components: ConfigObject[] = [];

export const isAppPassive = (appName: string): boolean => {
  const app = components.find(cmp => cmp.name == appName);
  if (!app) return true;
  return app.type === 'passive';
};

export const isCurrentAppPassive = (): boolean => {
  return isAppPassive(store.getState().main.currentApp);
};

export const getApp = (appName: string): ConfigObject | undefined => {
  return components.find(cmp => cmp.name == appName);
};

export const getAllComponents = () => {
  if (components.length > 0) {
    return components;
  }
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
  importAll(import.meta.globEager('./main/*/_config.tsx'));
  return components;
};
