import Icon from '@assets/phone/icons/crypto.svg';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'crypto',
  label: 'Crypto',
  icon: {
    name: Icon,
    lib: 'svg',
    color: 'white',
    background: '#282828',
    size: '2.5rem',
  },
  position: 10,
  render: p => <Container {...p} />,
});

export default config;
