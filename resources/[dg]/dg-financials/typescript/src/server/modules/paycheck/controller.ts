import { Jobs } from '@dgx/server';
import { isPlyInLoc } from '../bank/helpers/location';

import { checkInterval, givePaycheck, registerPaycheck, seedCache, seedPlyInCache } from './service';

global.exports('registerPaycheck', registerPaycheck);

RegisterCommand(
  'financials:cash:seed',
  () => {
    seedCache();
  },
  true
);

onNet('DGCore:Server:OnPlayerLoaded', () => {
  seedPlyInCache(source);
  const Player = DGCore.Functions.GetPlayer(source);
  const job = Jobs.getCurrentJob(source);
  checkInterval(Player.PlayerData.citizenid, job);
});

on('DGCore:Server:OnPlayerUnload', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const job = Jobs.getCurrentJob(source);
  checkInterval(Player.PlayerData.citizenid, job);
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
