import React from 'react';
import { ConfigObject } from '@src/base-app.config';

import Container from './component';
import store from './store';

const config: ConfigObject = {
  name: store.key,
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
