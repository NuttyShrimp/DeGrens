import { mainLogger } from '../../sv_logger';

export const idLogger = mainLogger.child({
  component: 'identification',
  category: 'identification',
});
