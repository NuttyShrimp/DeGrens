import Container from './component';

const config: ConfigObject = {
  name: 'hud',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
