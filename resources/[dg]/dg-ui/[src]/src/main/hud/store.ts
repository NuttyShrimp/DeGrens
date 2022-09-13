import { StoreObject } from '@lib/redux';

const store: StoreObject<Hud.State> = {
  key: 'hud',
  initialState: {
    visible: false,
    entries: [],
    values: {
      health: 100,
      armor: 100,
      hunger: 100,
      thirst: 100,
    },
    voice: {
      range: 1,
      channel: 0,
      active: false,
      onRadio: false,
    },
    car: {
      visible: false,
      speed: 0,
      fuel: 0,
      indicator: {
        belt: false,
        engine: false,
        service: false,
      },
    },
    compass: {
      visible: false,
      heading: 0,
      area: '',
      street1: '',
      street2: '',
    },
    cash: {
      current: 0,
      history: [],
    },
  },
};
export default store;
