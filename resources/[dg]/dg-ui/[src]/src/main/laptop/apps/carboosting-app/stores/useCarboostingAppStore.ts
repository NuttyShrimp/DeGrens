import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';

export const useCarboostingAppStore = create<Laptop.Carboosting.State & Laptop.Carboosting.StateActions>(
  'laptop.carboosting'
)(set => ({
  signedUp: false,
  contracts: [],
  reputation: {
    percentage: 0,
    currentClass: 'D',
    nextClass: undefined,
  },
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
  fetchData: async () => {
    const result = await nuiAction<Laptop.Carboosting.State>('laptop/carboosting/getData', {}, devData.carboosting);
    set(result);
  },
}));
