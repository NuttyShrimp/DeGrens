import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'example',
  label: 'Voorbeeld',
  icon: {
    name: 'house',
    color: 'white',
    background: 'black',
  },
  position: 1,
  render: p => <Container {...p} />,
  events,
  hidden: () => true,
});

export default config;
