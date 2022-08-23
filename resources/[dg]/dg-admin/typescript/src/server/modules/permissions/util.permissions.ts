import { mainLogger } from '../../sv_logger';

export const permissionLogger = mainLogger.child({
  module: 'permissions',
});
