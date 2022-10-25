import { mainLogger } from '../../sv_logger';

export const fuelLogger = mainLogger.child({
  module: 'fuel',
  category: 'fuel',
});
