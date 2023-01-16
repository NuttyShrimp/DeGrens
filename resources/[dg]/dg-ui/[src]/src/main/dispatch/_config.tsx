import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'dispatch',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
