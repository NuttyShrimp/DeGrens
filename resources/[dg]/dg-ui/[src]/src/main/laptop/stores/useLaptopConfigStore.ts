import { create } from '@src/lib/store';

export const useLaptopConfigStore = create<Laptop.Config.State & Store.UpdateStore<Laptop.Config.State>>(
  'laptop.config'
)(set => ({
  config: [],
  enabledApps: [],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
