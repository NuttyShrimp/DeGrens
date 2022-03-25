import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'mail',
  label: 'Mails',
  icon: {
    name: 'mail-bulk',
    color: 'white',
    background: '#59b3a9',
    backgroundGradient: '#82DED5',
  },
  position: 6,
  render: p => <Container {...p} />,
  events,
});

export default config;
