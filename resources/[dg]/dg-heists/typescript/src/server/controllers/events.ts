import { Config, RPC } from '@dgx/server';

RPC.register('heists:server:getHeistZones', async () => {
  await Config.awaitConfigLoad();
  return Config.getConfigValue<Record<Heist.Id, Heist.Zone>>('heists.zones');
});

RPC.register('heists:server:getDoorData', async (_src: number, heistId: Heist.Id) => {
  await Config.awaitConfigLoad();
  const data = Config.getConfigValue<Partial<Record<Heist.Id, Heist.Door>>>('heists.doors');
  const door = data[heistId];
  return door ?? false;
});

RPC.register('heists:server:getLaptopPickup', async () => {
  await Config.awaitConfigLoad();
  return Config.getConfigValue<Vec3>('heists.laptops.pickup');
});

RPC.register('heists:server:getTrolleyLocations', async (_src: number, heistId: Heist.Id) => {
  await Config.awaitConfigLoad();
  const trolleys = Config.getConfigValue<Trolley.Config>('heists.trolleys');
  return trolleys[heistId].locations;
});
