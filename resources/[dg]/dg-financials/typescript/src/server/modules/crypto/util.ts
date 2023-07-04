import { mainLogger } from '../../sv_logger';

export const cryptoLogger = mainLogger.child({
  module: 'crypto',
});
