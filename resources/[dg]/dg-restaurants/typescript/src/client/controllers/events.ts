import { Business, Events } from '@dgx/client';
import {
  buildRestaurantZones,
  buildRestaurantEmployeeZones,
  cacheRestaurantConfig,
  destroyRestaurantEmployeeZones,
  destroyRestaurantZones,
} from 'services/locations';

Events.onNet('restaurants:client:cacheConfig', (restaurants: Restaurants.Config['restaurants']) => {
  cacheRestaurantConfig(restaurants);
});

Business.onSignIn(
  businessName => {
    buildRestaurantEmployeeZones(businessName);
  },
  {
    businessType: 'restaurant',
  }
);

Business.onSignOut(
  () => {
    destroyRestaurantEmployeeZones();
  },
  {
    businessType: 'restaurant',
  }
);

Business.onEnterBusinessZone(
  businessName => {
    buildRestaurantZones(businessName);
  },
  {
    businessType: 'restaurant',
  }
);

Business.onLeaveBusinessZone(
  () => {
    destroyRestaurantZones();
  },
  {
    businessType: 'restaurant',
  }
);
