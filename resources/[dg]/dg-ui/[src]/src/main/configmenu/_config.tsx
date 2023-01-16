import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'configmenu',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
