import { BsCreditCard2BackFill } from 'react-icons/bs';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'payconiq',
  label: 'Payconiq',
  // TODO: Add icons
  icon: {
    name: BsCreditCard2BackFill,
    color: '#a84858',
    background: 'white',
    size: '1.3rem',
  },
  position: 11,
  render: p => <Container {...p} />,
});

export default config;
