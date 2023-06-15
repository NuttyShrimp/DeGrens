import React from 'react';
import { ReactComponent as Icon } from '@assets/laptop/icons/gang-app.svg';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'gang',
  label: 'Family Activity',
  render: p => <Component {...p} />,
  icon: {
    element: <Icon fill={'white'} height='100%' />,
    background: '#111',
  },
  iconPosition: {
    row: 0,
    column: 0,
  },
  requiresVPN: true,
};

export default config;
