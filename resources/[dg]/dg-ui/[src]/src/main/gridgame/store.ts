import { StoreObject } from '@lib/redux';

const store: StoreObject<Gridgame.State> = {
  key: 'gridgame',
  initialState: {
    visible: false,
    active: null,
    id: '',
    gridSize: 0,
    data: null,
    cells: [],
  },
};

export default store;
