import React from 'react';

import { ConfigObject, defaultConfigObject } from '../../config';

import { HomeScreen } from './components/homescreen';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'home-screen',
  label: 'Home Screen',
  background: 'transparent',
  icon: { name: 'home' },
  hidden: () => true,
  render: p => <HomeScreen {...p} />,
  events,
});

export default config;
