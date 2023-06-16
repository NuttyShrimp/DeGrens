import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'notes',
  label: 'Notities',
  icon: {
    name: 'folders',
    color: 'white',
    background: '#ec1aa4',
    backgroundGradient: '#9420c2',
    size: `1.4rem`,
  },
  position: 9,
  render: p => <Container {...p} />,
  events,
});

export default config;
