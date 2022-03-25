import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'payconiq',
  label: 'Payconiq',
  // TODO: Add icons
  icon: {
    name: 'euro-sign',
    color: '#a84858',
    background: 'white',
  },
  position: 11,
  render: p => <Container {...p} />,
});

export default config;
