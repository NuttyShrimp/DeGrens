// Kinda link base-app but specific for phone apps

import { ReactElement } from 'react';

import { baseStyle } from '../../base.styles';

export interface ConfigObject {
  name: string;
  label: string;
  background: string | Partial<CSSStyleDeclaration>;
  icon: Phone.Icon;
  position: number;
  render: (p: any) => ReactElement<any, any>;
  /**
   * Ran after phone is mounted, should return a part of the apps store
   **/
  init?: () => void;
  hidden?: () => boolean;
  events?: Phone.Events;
}

export const defaultConfigObject = {
  background: baseStyle.primaryDarker.darker,
  hidden: () => false,
  position: 30,
};

export const phoneApps: ConfigObject[] = [];
export const phoneEvents: { [appName: string]: Phone.Events } = {};

export const getPhoneApp = (name: string) => {
  return phoneApps.find(app => app.name === name);
};

export const getPhoneApps = () => {
  const importAll = r => {
    Object.keys(r).forEach(key => {
      const config: ConfigObject = r[key].default();
      if (phoneApps.find(cmp => cmp.name == config.name)) {
        return;
      }
      if (config.events) {
        phoneEvents[config.name] = config.events;
      }
      phoneApps.push(config);
    });
    phoneApps.sort((a, b) => a.position - b.position);
  };
  importAll(import.meta.glob('./apps/**/_config.tsx', { eager: true }));
  return phoneApps;
};
