import { Util } from '../classes';

onNet('dgx:requestEnv', () => {
  emitNet('dgx:isProduction', source, !Util.isDevEnv());
});
