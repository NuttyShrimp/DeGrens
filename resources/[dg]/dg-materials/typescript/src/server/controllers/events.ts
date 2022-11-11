import { RPC } from '@dgx/server';
import { awaitConfigLoad, getConfig } from 'services/config';

RPC.register('materials:server:requestInitialization', async () => {
  await awaitConfigLoad();
  const config = getConfig();
  const initData: Materials.InitData = {
    wirecuttingLocations: config.wirecutting.locations,
    radiotowerLocations: config.radiotowers.towers,
    meltingZone: config.melting.zone,
    moldZone: config.containers.mold.location,
  };
  return initData;
});
