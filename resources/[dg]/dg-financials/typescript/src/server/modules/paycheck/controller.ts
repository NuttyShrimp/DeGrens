import { Jobs, Util } from '@dgx/server';

import { isPlyInLoc } from '../bank/helpers/location';

import { checkInterval, givePaycheck, registerPaycheck, seedCache, seedPlyInCache } from './service';

global.exports('registerPaycheck', (src: number, amount: number, job: string, comment?: string) =>
  registerPaycheck(src, amount, job, comment)
);

RegisterCommand(
  'financials:seed:paycheck',
  () => {
    seedCache();
  },
  true
);

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  seedPlyInCache(playerData.source);
});

on('jobs:server:signin:update', (src: number, job: string | null) => {
  const cid = Util.getCID(src);
  checkInterval(cid, job);
});

onNet('financials:server:paycheck:give', () => {
  if (!isPlyInLoc(source, 'pacific')) return;
  givePaycheck(source);
});
