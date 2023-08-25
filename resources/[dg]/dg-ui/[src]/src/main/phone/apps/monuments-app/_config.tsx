import { ConfigObject, defaultConfigObject } from '../../config';

import { useMonumentsStoreApp } from './stores/useMonumentsStore';
import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'monuments',
  label: 'Monuments',
  icon: {
    name: 'archway',
    color: 'rgb(252,70,107)',
    background: 'radial-gradient(circle, rgba(63,94,251,1) 40%, rgba(252,70,107,1) 100%)',
  },
  position: 15,
  render: p => <Container {...p} />,
  events,
  hidden: () => useMonumentsStoreApp.getState().hidden,
});

export default config;
