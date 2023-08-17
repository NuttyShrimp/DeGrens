import Icon from '@assets/laptop/icons/carboosting-app.png';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'carboosting',
  label: 'Carboosting',
  render: p => <Component {...p} />,
  icon: {
    name: Icon,
    lib: 'img',
    background: '#a80404',
  },
  iconPosition: {
    row: 0,
    column: 1,
  },
  blockedJobs: ['police'],
};

export default config;
