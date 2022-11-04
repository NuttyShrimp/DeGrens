import { Jobs } from '@dgx/server';

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

on('DGCore:server:playerLoaded', async (playerData: PlayerData) => {
  await seedPlyInCache(playerData.source);
  const job = Jobs.getCurrentJob(playerData.source);
  checkInterval(playerData.citizenid, job);
});

on('DGCore:server:playerUnloaded', (src: number, cid: number) => {
  checkInterval(cid, null);
});

on('dg-jobs:signin:update', (src: number, job: string) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const cid = Player.PlayerData.citizenid;
  checkInterval(cid, job);
});

onNet('financials:server:paycheck:give', () => {
  if (!isPlyInLoc(source, 'pacific')) return;
  givePaycheck(source);
});
