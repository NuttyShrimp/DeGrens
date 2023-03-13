import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'reports-indicator',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
