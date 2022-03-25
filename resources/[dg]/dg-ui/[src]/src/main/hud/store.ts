import { StoreObject } from '@lib/redux';

const store: StoreObject<Hud.State> = {
  key: 'hud',
  initialState: {
    visible: true,
    compass: {
      visible: false,
      // 0 = North, 90 = West, 180 = South, 270 = East
      heading: 0,
      street: '',
      zone: '',
    },
    values: {
      health: {
        enabled: true,
        value: 0,
      },
      armor: {
        enabled: true,
        value: 0,
      },
      hunger: {
        enabled: false,
        value: 0,
      },
      thirst: {
        enabled: false,
        value: 0,
      },
      air: {
        enabled: false,
        value: 0,
      },
    },
    voice: {
      normal: false,
      onRadio: false,
    },
    iconIdx: 0,
  },
};
export default store;
