import { Auth, Events, Config } from '@dgx/server';
import portRobberyManager from 'modules/portrobbery/manager.portrobbery';
import { getSearchablePropsInitData } from 'modules/searchableprops/service.searchableprops';
import config from 'services/config';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();

  const initData: Materials.InitData = {
    wirecuttingLocations: config.wirecutting.locations,
    radiotowerLocations: config.radiotowers.towers,
    meltingZone: config.melting.zone,
    moldZone: config.containers.mold.location,
    containerProps: config.containers.props,
    portrobbery: portRobberyManager.getInitData(),
    searchableprops: getSearchablePropsInitData(),
  };

  Events.emitNet('materials:client:init', plyId, initData);
});
