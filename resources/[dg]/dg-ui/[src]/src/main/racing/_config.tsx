import Container from './component';

const config: ConfigObject = {
  name: 'racing',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
