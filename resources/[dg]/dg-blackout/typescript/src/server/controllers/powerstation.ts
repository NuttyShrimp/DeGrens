import { Config, Events, RPC } from '@dgx/server';
import powerstationManager from '../classes/PowerstationManager';

let powerStations: PowerstationData[];

DGCore.Functions.CreateUseableItem('big_explosive', async (src: number, item: Item) => {
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player.Functions.GetItemByName(item.name)) return;
  Events.emitNet('blackout:client:useExplosive', src);
});

setImmediate(async () => {
  await Config.awaitConfigLoad();
  powerStations = Config.getConfigValue('blackout.powerstations');
  powerstationManager.setupStations(powerStations.length);
  Events.emitNet('blackout:server:getPowerStations', -1, powerStations);
});

RPC.register('blackout:server:isStationHit', (_src: number, stationId: number) => {
  return powerstationManager.isStationHit(stationId);
});

Events.onNet('blackout:server:setStationHit', (_src: number, stationId: number) => {
  powerstationManager.setStationHit(stationId);
});

on('dg-auth:server:authenticated', (src: number) => {
  Events.emitNet('blackout:server:getPowerStations', src, powerStations);
});
