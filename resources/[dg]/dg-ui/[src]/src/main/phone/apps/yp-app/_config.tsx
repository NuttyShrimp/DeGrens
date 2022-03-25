import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'yellowpages',
  label: 'Advertenties',
  icon: {
    name: 'newspaper',
    color: '#000000',
    background: '#eec41d',
    backgroundGradient: '#eec41d',
  },
  position: 7,
  render: p => <Container {...p} />,
  events,
});

export default config;
