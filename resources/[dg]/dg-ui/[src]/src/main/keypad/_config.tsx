import Container from './component';

const config: ConfigObject = {
  name: 'keypad',
  render: p => <Container {...p} />,
  type: 'interactive',
};

export default config;
