import { StoreObject } from '@lib/redux';

import { defaultState } from '../lib/defaultState';
import { isDevel } from '../lib/env';

const store: StoreObject<State.Main.State, State.Main.Aux> = {
  key: 'main',
  initialState: {
    currentApp: '',
    error: null,
    mounted: true,
  },
  auxiliaryState: {
    // @ts-ignore
    character: isDevel() ? defaultState.character : {},
    game: {
      location: 'world',
      time: '12:00',
      weather: 'EXTRASUNNY',
    },
  },
};
export default store;
