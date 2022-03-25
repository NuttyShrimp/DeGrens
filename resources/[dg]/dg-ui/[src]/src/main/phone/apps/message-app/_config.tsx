import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'messages',
  label: 'Berichten',
  icon: {
    name: 'comments-alt',
    color: 'white',
    background: '#2eafdb',
  },
  position: 3,
  render: p => <Container {...p} />,
  events,
});

export default config;
