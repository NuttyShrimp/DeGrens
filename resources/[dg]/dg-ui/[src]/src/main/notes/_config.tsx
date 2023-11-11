import Container from './component';

const config: ConfigObject = {
  name: 'notes',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
