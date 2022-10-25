import React from 'react';
import Icon from '@assets/bennys/bennysmotorwork-logo.png';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'bennys',
  label: 'Bennys Motorwork',
  icon: {
    name: Icon,
    lib: 'img',
    background: '#0d6631',
  },
  render: p => <Component {...p} />,
  iconPosition: {
    row: 1,
    column: 0,
  },
  blockedJobs: [],
};

export default config;
