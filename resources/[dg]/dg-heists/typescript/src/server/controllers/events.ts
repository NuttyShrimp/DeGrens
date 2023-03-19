import { Auth, Config, Events, Util } from '@dgx/server';
import heistManager from 'classes/heistmanager';
import config from 'services/config';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();

  const initData: Heists.InitData = {
    shopPickupZone: config.shop.pickupZone,
    zones: Object.entries(config.locations).map(([locationId, location]) => [
      locationId as Heists.LocationId,
      location.zone,
    ]),
  };

  Events.emitNet('heists:client:init', plyId, initData);
});

Util.onPlayerUnloaded(plyId => {
  heistManager.leaveCurrentLocation(plyId);
});
