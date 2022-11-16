import React from 'react';

import Container from './component';
import store from './store';

const config: ConfigObject = {
  name: store.key,
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
