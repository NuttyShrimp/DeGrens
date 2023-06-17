import Container from './component';

const config: ConfigObject = {
  name: 'interaction',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
