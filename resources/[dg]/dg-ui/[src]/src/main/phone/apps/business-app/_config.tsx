import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'business',
  label: 'Bedrijfsmanagement',
  icon: {
    name: 'handshake',
    color: 'white',
    background: '#2eafdb',
  },
  position: 15,
  render: p => <Container {...p} />,
  events,
});

export default config;
