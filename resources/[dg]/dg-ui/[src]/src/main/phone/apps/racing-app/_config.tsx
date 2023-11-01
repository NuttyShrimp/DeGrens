import { ConfigObject, defaultConfigObject } from '../../config';

import { useRacingAppStore } from './stores/racingAppStore';
import Container from './component';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'racing',
  label: 'Vroom',
  icon: {
    name: 'flag-checkered',
    color: 'white',
    background: 'black',
  },
  position: 17,
  render: p => <Container {...p} />,
  events,
  hidden: () => !useRacingAppStore.getState().hidden,
});

export default config;
