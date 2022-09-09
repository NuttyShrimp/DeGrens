import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'debt',
  label: 'Schulden',
  icon: {
    name: 'file-invoice-dollar',
    color: 'white',
    background: '#2695c9',
    backgroundGradient: '#2644c9',
  },
  position: 12,
  render: p => <Container {...p} />,
  events,
});

export default config;
