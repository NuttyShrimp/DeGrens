import React from 'react';
import { ReactComponent as Icon } from '@assets/laptop/icons/gang-app.svg';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'gang',
  label: 'Criminal Activity',
  icon: {
    element: <Icon fill={'white'} />,
    background: '#111',
  },
  render: p => <Component {...p} />,
  top: 20,
  left: 40,
  row: 0,
  column: 1,
  requiresVPN: true,
  blockedJobs: ['police'],
};

export default config;
