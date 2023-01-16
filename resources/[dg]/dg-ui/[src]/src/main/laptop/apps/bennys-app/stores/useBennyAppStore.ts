import { create } from '@src/lib/store';

export const useBennyAppStore = create<Laptop.Bennys.State & Laptop.Bennys.StateActions>('laptop.bennys')(set => ({
  activeTab: 'cosmetic',
  items: [],
  cart: {},
  setItems: i => set(() => ({ items: i })),
  setActiveTab: t => set(() => ({ activeTab: t })),
  setCart: c => set(() => ({ cart: c })),
}));
