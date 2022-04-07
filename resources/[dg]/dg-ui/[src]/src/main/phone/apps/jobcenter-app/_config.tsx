import React from 'react';
import Icon from '@assets/phone/icons/jobcenter.svg';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'jobcenter',
  label: 'Jobcenter',
  icon: {
    name: Icon,
    lib: 'svg',
    color: 'white',
    background: '#282828',
    size: '2rem',
  },
  position: 14,
  render: p => <Container {...p} />,
  events,
});

export default config;
