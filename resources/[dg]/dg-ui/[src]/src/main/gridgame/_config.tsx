import Container from './component';

const config: ConfigObject = {
  name: 'gridgame',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
