import { useDispatchStore } from './stores/useDispatchStore';
import Container from './component';

const config: ConfigObject = {
  name: 'dispatch',
  render: p => <Container {...p} />,
  type: () => (useDispatchStore.getState().hasCursor ? 'interactive' : 'passive'),
};

export default config;
