import { mainLogger } from '../../sv_logger';

export const scrapyardLogger = mainLogger.child({
  module: 'scrapyard',
  category: 'scrapyard',
});
