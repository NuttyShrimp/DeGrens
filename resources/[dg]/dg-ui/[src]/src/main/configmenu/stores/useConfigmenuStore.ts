import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';
import deepmerge from 'deepmerge';

export const useConfigmenuStore = create<ConfigMenu.State & ConfigMenu.StateActions>('configmenu')((set, get) => ({
  currentMenu: 'hud',
  hud: {
    keyboard: 'qwerty',
    sections: {
      food: true,
      health: true,
    },
    compass: {
      fps: 15,
      show: true,
    },
  },
  phone: {
    background: {
      phone: '',
      laptop: '',
    },
    notifications: {
      twitter: true,
    },
  },
  radio: {
    clicks: {
      enabled: true,
      me: {
        incoming: true,
        outgoing: true,
      },
      someElse: {
        incoming: false,
        outgoing: true,
      },
    },
    volume: {
      radio: 30,
      phone: 30,
    },
    balance: {
      radio: 50,
      phone: 50,
    },
  },
  setMenu: m => set(() => ({ currentMenu: m })),
  setConfig: conf => {
    const newConfig = deepmerge(
      {
        hud: get().hud,
        phone: get().phone,
        radio: get().radio,
      },
      conf
    );
    set(() => newConfig);
    return newConfig;
  },
  updateConfig: (key, data) => set(s => ({ [key]: { ...s[key], ...data } })),
  saveConfig: () => {
    nuiAction('configmenu/save', {
      data: {
        hud: get().hud,
        radio: get().radio,
        phone: get().phone,
      },
    });
  },
}));
