import { create } from '@src/lib/store';

export const useLaptopConfirmStore = create<Laptop.Confirm.State & Laptop.Confirm.StateActions>('laptop.confirm')(
  set => ({
    data: null,
    setData: d => set(() => ({ data: d })),
  })
);
