import { ReactComponent as Icon } from '@assets/laptop/icons/criminaldoctor-app.svg';

import { Component } from './component';

const config: Laptop.Config.Config = {
  name: 'criminaldoctor',
  label: `Dokter B`,
  render: p => <Component {...p} />,
  icon: {
    element: <Icon fill={'pink'} height='90%' />,
    background: '#034e94',
  },
  iconPosition: {
    row: 10,
    column: 0,
  },
  requiresVPN: true,
};

export default config;
