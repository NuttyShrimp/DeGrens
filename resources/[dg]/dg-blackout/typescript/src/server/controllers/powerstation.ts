import { Config, Events, RPC } from '@dgx/server';
import powerstationManager from '../classes/PowerstationManager';

let powerStations: PowerstationData[];

DGCore.Functions.CreateUseableItem('big_explosive', async (source: number, item: Item) => {
  const Player = DGCore.Functions.GetPlayer(source);
  if (!Player.Functions.GetItemByName(item.name)) return;
  emitNet('dg-blackout:client:UseExplosive', source);
});

setImmediate(async () => {
  await Config.awaitConfigLoad();
  powerStations = Config.getConfigValue('blackout.powerstations');
  powerstationManager.setupStations(powerStations.length);
  Events.emitNet('dg-blackout:server:getPowerStations', -1, powerStations);
});

RPC.register('dg-blackout:server:IsStationHit', (_source: number, stationId: number) => {
  return powerstationManager.isStationHit(stationId);
});

onNet('dg-blackout:server:SetStationHit', (stationId: number) => {
  powerstationManager.setStationHit(stationId);
});

on('dg-auth:server:authenticated', (src: number) => {
  Events.emitNet('dg-blackout:server:getPowerStations', src, powerStations);
});
