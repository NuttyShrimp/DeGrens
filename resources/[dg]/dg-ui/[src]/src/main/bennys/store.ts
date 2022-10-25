import { StoreObject } from '@lib/redux';

const store: StoreObject<Bennys.State> = {
  key: 'bennys',
  initialState: {
    visible: false,
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
  },
};
export default store;
