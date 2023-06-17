import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'garage',
  label: 'Voertuigen',
  icon: {
    name: 'car-garage',
    color: '#212232',
    background: 'rgb(255,94,247)',
    backgroundGradient: 'rgb(2,245,255)',
  },
  position: 9,
  render: p => <Container {...p} />,
});

export default config;
