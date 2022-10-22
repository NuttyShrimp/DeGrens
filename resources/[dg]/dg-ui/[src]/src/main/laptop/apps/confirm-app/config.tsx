import React from 'react';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'confirm',
  label: 'Confirm',
  render: p => <Component {...p} />,
  icon: {
    lib: 'fas-fa',
    name: 'circle-info',
    color: '#bebebe',
    size: '2vh',
    background: '#1a1a1a',
  },
  important: true,
};

export default config;
