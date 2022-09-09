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
    name: 'messages-dollar',
    color: '#a84858',
    background: 'white',
    size: '1.3rem',
  },
  position: 11,
  render: p => <Container {...p} />,
});

export default config;
