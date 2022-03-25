import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'phone',
  label: 'Telefoon',
  icon: {
    name: 'phone-alt',
    color: 'white',
    background: '#34ad2b',
  },
  position: 4,
  render: p => <Container {...p} />,
  events,
});

export default config;
