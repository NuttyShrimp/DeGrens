import Container from './component';

const config: ConfigObject = {
  name: 'bennys',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
