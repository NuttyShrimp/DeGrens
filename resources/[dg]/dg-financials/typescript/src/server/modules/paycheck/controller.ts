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

on('DGCore:Server:PlayerLoaded', async (player: Player) => {
  await seedPlyInCache(player.PlayerData.source);
  const job = Jobs.getCurrentJob(player.PlayerData.source);
  checkInterval(player.PlayerData.citizenid, job);
});

on('DGCore:Server:OnPlayerUnload', (src: number, citizenid: number) => {
  checkInterval(citizenid, null);
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
