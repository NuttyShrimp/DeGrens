import { nuiAction } from '@src/lib/nui-comms';
import { create } from '@src/lib/store';

const initStoreData: Bennys.State = {
  currentCost: 0,
  currentMenu: 'main',
  bars: {
    title: "Benny's Motorwork",
    guides: [{ title: 'Quit', kbdCombo: ['Esc'] }],
    price: 0,
    isInCart: false,
    equipped: false,
  },
  cart: [],
  prices: {},
};

export const useBennyStore = create<Bennys.State & Bennys.StateActions>('bennys')((set, get) => ({
  ...initStoreData,
  setCost: c => set(() => ({ currentCost: c })),
  setMenu: m => set(() => ({ currentMenu: m })),
  setPrices: p => set(() => ({ prices: p })),
  resetStore: () => set(() => ({ ...initStoreData })),

  setBarTitle: t => set(s => ({ bars: { ...s.bars, title: t } })),
  setBarPrice: price => set(s => ({ bars: { ...s.bars, price } })),
  setEquipped: eq => set(s => ({ bars: { ...s.bars, equipped: eq } })),
  setInCart: inCart => set(s => ({ bars: { ...s.bars, isInCart: inCart } })),
  resetTitleBar: () =>
    set(s => ({
      bars: Object.assign({}, initStoreData.bars, { guides: [...s.bars.guides] }),
    })),

  getPriceOfComp: (comp: string) => (comp.startsWith('extra_') ? get().prices.extras : get().prices[comp]),
  getCartItemForComp: comp => get().cart.find(i => i.component === comp),
  addToCart: (comp: string, data: any) => {
    nuiAction('bennys:playSound');
    set(s => ({
      cart: [...s.cart.filter(item => item.component !== comp), { component: comp, data }],
      currentCost: s.currentCost + s.getPriceOfComp(comp),
    }));
  },
  removeFromCart: comp => {
    nuiAction('bennys:playSound');
    set(s => ({
      cart: [...s.cart.filter(item => item.component !== comp)],
      currentCost: s.currentCost - s.getPriceOfComp(comp),
    }));
  },

  addGuides: g => set(s => ({ bars: { ...s.bars, guides: [...s.bars.guides, ...g] } })),
  removeGuides: g =>
    set(s => ({ bars: { ...s.bars, guides: s.bars.guides.filter(guide => !g.find(g => g.title === guide.title)) } })),
}));
