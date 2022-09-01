import { Auth, Config, Events, Inventory, RPC } from '@dgx/server';

import powerstationManager from '../classes/PowerstationManager';

let powerStations: PowerstationData[];

Inventory.registerUseable('big_explosive', src => {
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

Auth.onAuth(src => {
  Events.emitNet('blackout:server:getPowerStations', src, powerStations);
})
