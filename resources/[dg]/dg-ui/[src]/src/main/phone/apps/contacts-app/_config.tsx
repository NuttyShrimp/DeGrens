import { ConfigObject, defaultConfigObject } from '../../config';

import Container from './component';
import { events } from './events';
import { fetchContacts } from './lib';

// Must be a function because otherwise it whines about undeclared defaultConfigObject
const config = (): ConfigObject => ({
  ...defaultConfigObject,
  name: 'contacts',
  label: 'Contacten',
  icon: {
    name: 'address-book',
    color: 'white',
    background: '#f5771d',
  },
  position: 2,
  render: p => <Container {...p} />,
  init: () => {
    fetchContacts();
  },
  events,
});

export default config;
