import React from 'react';

import { usePhoneStore } from './stores/usePhoneStore';
import Container from './component';

const config: ConfigObject = {
  name: 'phone',
  render: p => <Container {...p} />,
  type: () => {
    if (usePhoneStore.getState().animating === 'peek') {
      return 'passive';
    }
    return 'interactive';
  },
};

export default config;
