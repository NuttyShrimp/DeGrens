import { mainLogger } from '../../sv_logger';

export const vehicleshopLogger = mainLogger.child({
  module: 'vehicleshop',
  category: 'vehicleshop',
});
