import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'keygame',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
