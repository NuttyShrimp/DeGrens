import { ConfigObject, defaultConfigObject } from '../../config';

import { Component } from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'realestate',
  label: 'Real Estate',
  icon: {
    name: 'house-building',
    color: 'white',
    background: '#59b3a9',
    backgroundGradient: '#82DED5',
  },
  position: 16,
  render: p => <Component {...p} />,
  events,
});

export default config;
