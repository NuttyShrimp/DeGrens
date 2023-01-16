import { create } from '@src/lib/store';

export const useGarageAppStore = create<Phone.Garage.State>('phone.app.garage')(set => ({
  list: [],
  setList: l => set(() => ({ list: l })),
}));
