import { Auth, Business, Events, Util } from '@dgx/server';
import restaurantManager from 'classes/restaurantmanager';
import config from 'services/config';

Auth.onAuth(plyId => {
  Events.emitNet('restaurants:client:init', plyId, config.restaurants);
});

Util.onPlayerUnloaded(plyId => {
  restaurantManager.leaveCurrentRestaurant(plyId);
});

Business.onPlayerFired((_, restaurantId, cid) => {
  const plyId = DGCore.Functions.getPlyIdForCid(cid);
  if (!plyId) return;
  restaurantManager.handlePlayerFired(plyId, restaurantId);
});
