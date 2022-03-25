import { Store } from 'vuex';

import { State } from './store';

export const devDataPlugin = (store: Store<State>) => {
  // Do not run if env is production
  store.commit('spawn/setLocations', [
    {
      label: 'Test Location',
    },
    {
      label: 'Test Location 2',
    },
    {
      label: 'Test Location 3',
    },
  ]);
  store.commit('spawn/setShow', true);
};
