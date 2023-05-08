import { Auth, Events } from '@dgx/server';
import config from 'services/config';

Auth.onAuth(plyId => {
  Events.emitNet('restaurants:client:cacheConfig', plyId, config.restaurants);
});
