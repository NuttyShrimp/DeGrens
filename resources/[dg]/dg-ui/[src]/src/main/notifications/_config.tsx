import Container from './component';

const config: ConfigObject = {
  name: 'notifications',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
