import { Auth, Events } from '@dgx/server';
import { awaitConfigLoad, getConfig } from 'services/config';

Auth.onAuth(async plyId => {
  await awaitConfigLoad();

  const config = getConfig();
  const initData: Materials.InitData = {
    wirecuttingLocations: config.wirecutting.locations,
    radiotowerLocations: config.radiotowers.towers,
    meltingZone: config.melting.zone,
    moldZone: config.containers.mold.location,
    containerProps: config.containers.props,
  };

  Events.emitNet('materials:client:init', plyId, initData);
});
