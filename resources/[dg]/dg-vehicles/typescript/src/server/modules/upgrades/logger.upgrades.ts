import { mainLogger } from '../../sv_logger';

export const upgradesLogger = mainLogger.child({
  module: 'upgrades',
  category: 'upgrades',
});
