import { Util } from '@dgx/client';

export const debug = (msg: string) => {
  if (!Util.isDevEnv()) return;
  console.log(`[AnimLoops] ${msg}`);
};
