import { create } from '@src/lib/store';

export const useHudStore = create<Hud.State & Hud.StateActions & Store.UpdateStore<Hud.State>>('hud')(set => ({
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
  addEntry: e => set(s => ({ entries: [...s.entries, e].sort((e1, e2) => e1.order - e2.order) })),
  deleteEntry: n => set(s => ({ entries: s.entries.filter(e => e.name !== n) })),
  toggleEntry: (name, isEnabled) =>
    set(s => ({
      entries: s.entries.map(e => {
        if (e.name === name) {
          e.enabled = isEnabled;
        }
        return e;
      }),
    })),
  updateStore: ns => set(s => (typeof ns === 'function' ? ns(s) : ns)),
}));
