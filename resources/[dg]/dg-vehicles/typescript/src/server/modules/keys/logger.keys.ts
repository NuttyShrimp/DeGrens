import { mainLogger } from '../../sv_logger';

export const keyLogger = mainLogger.child({
  module: 'keys',
  category: 'keys',
});
