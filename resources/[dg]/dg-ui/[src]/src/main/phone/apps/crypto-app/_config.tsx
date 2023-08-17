import { FaCoins } from 'react-icons/fa';
import { baseStyle } from '@src/base.styles';

import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'crypto',
  label: 'Crypto',
  icon: {
    name: FaCoins,
    color: baseStyle.primaryDarker.dark,
    background: '#e3ffe7',
    backgroundGradient: '#d9e7ff',
  },
  position: 10,
  render: p => <Container {...p} />,
});

export default config;
