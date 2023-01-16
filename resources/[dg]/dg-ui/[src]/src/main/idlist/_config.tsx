import React from 'react';

import Container from './component';

const config: ConfigObject = {
  name: 'idlist',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
