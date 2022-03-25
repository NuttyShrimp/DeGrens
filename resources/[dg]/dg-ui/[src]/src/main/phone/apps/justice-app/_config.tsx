import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'justice',
  label: 'Justitie',
  icon: {
    name: 'balance-scale-right',
    lib: 'far fa-',
    color: '#dc2222',
    background: '#282828',
    size: '1.4rem',
  },
  position: 13,
  render: p => <Container {...p} />,
});

export default config;
