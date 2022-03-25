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
  checkInterval(Player.PlayerData.citizenid, Player.PlayerData.job.name, Player.PlayerData.job.onduty);
});

on('DGCore:Server:OnPlayerUnload', (src: number) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const job = Player.PlayerData.job;
  checkInterval(Player.PlayerData.citizenid, job.name, job.onduty);
});

on('DGCore:Server:OnJobUpdate', (ply: number, job: Job) => {
  const Player = DGCore.Functions.GetPlayer(ply);
  checkInterval(Player.PlayerData.citizenid, job.name, job.onduty);
});

on('DGCore:Server:OnJobDutyUpdate', (ply: number, onDuty: boolean) => {
  const Player = DGCore.Functions.GetPlayer(ply);
  checkInterval(Player.PlayerData.citizenid, Player.PlayerData.job.name, onDuty);
});

onNet('financials:server:paycheck:give', () => {
  if (!isPlyInLoc(source, 'pacific')) return;
  givePaycheck(source);
});
