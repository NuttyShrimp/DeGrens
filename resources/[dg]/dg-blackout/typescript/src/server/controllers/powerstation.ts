import { Auth, Config, Events, Inventory, Police, RPC } from '@dgx/server';
import powerstationManager from '../classes/PowerstationManager';

let powerStations: PowerstationData[];

Inventory.registerUseable('big_explosive', src => {
  Events.emitNet('blackout:client:useExplosive', src);
});

setImmediate(async () => {
  await Config.awaitConfigLoad();
  powerStations = Config.getConfigValue('blackout.powerstations');
  powerstationManager.setupStations(powerStations.length);
});

RPC.register('blackout:server:isStationHit', (_src: number, stationId: number) => {
  return powerstationManager.isStationHit(stationId);
});

Events.onNet('blackout:server:setStationHit', (src: number, stationId: number) => {
  powerstationManager.setStationHit(stationId);
  Police.createDispatchCall({
    tag: '10-35',
    title: 'Verdachte activiteit aan een elektriciteits centrale',
    description:
      'Er is een luide explosie gehoord rond de elektriciteits centrale. Er word om dringende assistentie gevraagd!',
    coords: powerStations[stationId].center,
    entries: {
      'camera-cctv': powerStations[stationId].camId,
    },
    criminal: src,
    blip: {
      sprite: 354,
      color: 5,
    },
    important: true,
  });
});

Auth.onAuth(plyId => {
  Events.emitNet('blackout:server:buildPowerStations', plyId, powerStations);
});
