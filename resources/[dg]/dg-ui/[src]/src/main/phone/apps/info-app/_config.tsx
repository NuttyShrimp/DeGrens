import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'info',
  label: 'Info',
  icon: {
    name: 'info-circle',
    color: 'white',
    background: '#67a4bd',
  },
  position: 1,
  render: p => <Container {...p} />,
  events,
});

export default config;
