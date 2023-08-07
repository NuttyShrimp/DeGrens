import Container from './component';

const config: ConfigObject = {
  name: 'flyer',
  render: p => <Container {...p} />,
  type: 'passive',
};

export default config;
