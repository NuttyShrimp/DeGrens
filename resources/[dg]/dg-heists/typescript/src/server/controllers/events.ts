import { Auth, Config, Events, RPC } from '@dgx/server';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue<{ zones: Record<Heist.Id, Heist.Zone>; laptops: { pickup: Vec3 } }>('heists');
  Events.emitNet('heists:client:buildHeistZones', plyId, config.zones);
  Events.emitNet('heists:shop:loadLaptopPickup', plyId, config.laptops.pickup);
});

RPC.register('heists:server:getDoorData', async (_src: number, heistId: Heist.Id) => {
  await Config.awaitConfigLoad();
  const data = Config.getConfigValue<Partial<Record<Heist.Id, Heist.Door>>>('heists.doors');
  const door = data[heistId];
  return door ?? false;
});

RPC.register('heists:server:getTrolleyLocations', async (_src: number, heistId: Heist.Id) => {
  await Config.awaitConfigLoad();
  const trolleys = Config.getConfigValue<Trolley.Config>('heists.trolleys');
  return trolleys.locations[heistId];
});
