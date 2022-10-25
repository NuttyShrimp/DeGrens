import { mainLogger } from '../../sv_logger';

export const bennysLogger = mainLogger.child({
  module: 'bennys',
  category: 'bennys',
});
