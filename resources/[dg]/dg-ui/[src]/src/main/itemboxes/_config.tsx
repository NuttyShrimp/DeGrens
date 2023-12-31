import Container from './component';

const config: ConfigObject = {
  name: 'itemboxes',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
