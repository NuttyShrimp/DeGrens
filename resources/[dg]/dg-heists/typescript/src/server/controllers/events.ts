import { Auth, Config, Core, Events } from '@dgx/server';
import heistManager from 'classes/heistmanager';
import config from 'services/config';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();

  const initData: Heists.InitData = {
    shopPickupZone: config.shop.pickupZone,
    locations: Object.entries(config.locations).map(([locationId, location]) => ({
      id: locationId as Heists.LocationId,
      zone: location.zone,
      policeDoorReset: location.policeDoorReset,
    })),
    paletoActions: config.paleto.actions,
  };

  Events.emitNet('heists:client:init', plyId, initData);
});

Core.onPlayerUnloaded(plyId => {
  heistManager.leaveCurrentLocation(plyId);
});
