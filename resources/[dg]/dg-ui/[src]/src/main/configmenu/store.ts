import { StoreObject } from '@lib/redux';

const store: StoreObject<ConfigMenu.State> = {
  key: 'configmenu',
  initialState: {
    visible: false,
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
  },
};
export default store;
