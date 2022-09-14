import { StoreObject } from '@lib/redux';

import { defaultState } from '../lib/defaultState';
import { isDevel } from '../lib/env';

const store: StoreObject<Main.State, Main.Aux> = {
  key: 'main',
  initialState: {
    currentApp: '',
    apps: [],
    error: null,
    mounted: true,
  },
  auxiliaryState: {
    character: isDevel() ? defaultState.character : {},
    game: {
      location: 'world',
      time: '12:00',
      weather: 'EXTRASUNNY',
    },
    jobs: [],
  },
};
export default store;
