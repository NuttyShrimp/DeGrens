import { mainLogger } from '../../sv_logger';

export const carwashLogger = mainLogger.child({
  module: 'carwash',
  category: 'carwash',
});
