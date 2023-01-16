import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'financials',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
