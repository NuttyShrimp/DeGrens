import Container from './component';

const config: ConfigObject = {
  name: 'contextmenu',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
