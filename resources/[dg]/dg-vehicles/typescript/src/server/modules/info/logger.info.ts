import { mainLogger } from 'sv_logger';

export const infoLogger = mainLogger.child({
  module: 'info',
});
