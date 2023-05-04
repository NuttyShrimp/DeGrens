import { Auth, Business, Core, Events, Util } from '@dgx/server';
import restaurantManager from 'classes/restaurantmanager';
import config from 'services/config';

Auth.onAuth(plyId => {
  Events.emitNet('restaurants:client:init', plyId, config.restaurants);
});

Core.onPlayerUnloaded(plyId => {
  restaurantManager.leaveCurrentRestaurant(plyId);
});

Business.onPlayerFired((_, restaurantId, cid) => {
  const charModule = Core.getModule('characters');
  const plyId = charModule.getServerIdFromCitizenId(cid);
  if (!plyId) return;
  restaurantManager.handlePlayerFired(plyId, restaurantId);
});
