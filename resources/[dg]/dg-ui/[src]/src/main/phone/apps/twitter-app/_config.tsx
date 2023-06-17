import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'twitter',
  label: 'Twitter',
  icon: {
    name: 'twitter',
    lib: 'fab fa-',
    color: '#1DA1F2',
    background: '#282828',
  },
  position: 8,
  render: p => <Container {...p} />,
  events,
});

export default config;
