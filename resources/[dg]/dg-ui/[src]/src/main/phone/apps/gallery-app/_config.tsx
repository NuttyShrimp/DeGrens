import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'gallery',
  label: 'Galerij',
  icon: {
    name: 'images',
    color: 'white',
    background: '#155312',
  },
  position: 12,
  render: p => <Container {...p} />,
});

export default config;
