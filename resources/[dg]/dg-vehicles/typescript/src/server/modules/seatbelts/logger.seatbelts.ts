import { mainLogger } from 'sv_logger';

export const seatbeltLogger = mainLogger.child({
  module: 'seatbelts',
  category: 'seatbelts',
});
