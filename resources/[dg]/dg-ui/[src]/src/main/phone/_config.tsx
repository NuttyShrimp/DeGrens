import React from 'react';

import { store as reduxStore } from '../../lib/redux/store';

import Container from './component';
import store from './store';

const config: ConfigObject = {
  name: store.key,
  render: p => <Container {...p} />,
  type: () => {
    if ((reduxStore.getState() as RootState)?.phone?.animating === 'peek') {
      return 'passive';
    }
    return 'interactive';
  },
};

export default config;
