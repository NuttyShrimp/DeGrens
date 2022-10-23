import React from 'react';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'confirm',
  label: 'Confirm',
  render: p => <Component {...p} />,
  icon: {
    element: <i className={'fas fa-triangle-exclamation'} style={{ color: 'yellow' }} />,
    background: '#111',
  },
  important: true,
};

export default config;
