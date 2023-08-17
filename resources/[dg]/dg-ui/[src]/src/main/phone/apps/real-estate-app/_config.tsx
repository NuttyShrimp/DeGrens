import { BsHousesFill } from 'react-icons/bs';

import { ConfigObject, defaultConfigObject } from '../../config';

import { Component } from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'realestate',
  label: 'Real Estate',
  icon: {
    name: BsHousesFill, // 'house-building',
    color: 'white',
    background: 'radial-gradient(circle, #d53369 45%, #daae51 100%)',
  },
  position: 16,
  render: p => <Component {...p} />,
  events,
});

export default config;
