import map from '@assets/phone/map.png';

import { ConfigObject, defaultConfigObject } from '../../config';

import { Pinger } from './components/pinger';
import { events } from './events';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'pinger',
  label: 'Pinger',
  icon: {
    name: 'map-pin',
    color: 'white',
    background: '#db3f0a',
    backgroundGradient: '#DB8116',
  },
  background: {
    background: `url(${map}) no-repeat 0 0 / cover #686666`,
    backgroundBlendMode: 'multiply',
    transition: 'background-position 5s ease-in-out',
  },
  position: 5,
  render: p => <Pinger {...p} />,
  events,
});

export default config;
