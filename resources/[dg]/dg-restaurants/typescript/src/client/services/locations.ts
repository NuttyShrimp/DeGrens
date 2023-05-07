import { Business, Events, Peek, PolyTarget } from '@dgx/client';
import { doCooking } from './actions';

let restaurants: Restaurants.Config['restaurants'];

let restaurantZonesBuilt = false;
let restaurantEmployeeZonesBuilt = false;
let peekIds: string[] = [];

export const cacheRestaurantConfig = (config: Restaurants.Config['restaurants']) => {
  restaurants = config;
};

// these zones per restaurant get build on enter for everyone
export const buildRestaurantZones = (restaurantId: string) => {
  if (restaurantZonesBuilt) return;

  const restaurant = restaurants[restaurantId];
  if (!restaurant) return;

  restaurant.registerZones.forEach((registerZone, idx) => {
    PolyTarget.addBoxZone('restaurant_register', registerZone.center, registerZone.width, registerZone.length, {
      ...registerZone.options,
      data: {
        id: `${restaurantId}_${idx}`,
        registerId: idx,
        restaurantId,
      },
    });
  });
  PolyTarget.addBoxZone(
    'restaurant_leftover',
    restaurant.leftoverZone.center,
    restaurant.leftoverZone.width,
    restaurant.leftoverZone.length,
    {
      ...restaurant.leftoverZone.options,
      data: {
        id: restaurantId,
      },
    }
  );
  PolyTarget.addBoxZone(
    'restaurant_stash',
    restaurant.stashZone.center,
    restaurant.stashZone.width,
    restaurant.stashZone.length,
    {
      ...restaurant.stashZone.options,
      data: {
        id: restaurantId,
      },
    }
  );

  restaurantZonesBuilt = true;
};

// these zones per restaurant get build on signin
export const buildRestaurantEmployeeZones = (restaurantId: string) => {
  if (restaurantEmployeeZonesBuilt) return;

  const restaurant = restaurants[restaurantId];
  if (!restaurant) return;

  restaurant.cooking.forEach((c, idx) => {
    PolyTarget.addBoxZone('restaurant_cook', c.zone.center, c.zone.width, c.zone.length, {
      ...c.zone.options,
      data: {
        id: idx,
        restaurantId,
      },
    });
    const newPeekIds = Peek.addZoneEntry('restaurant_cook', {
      options: [
        {
          label: c.peekLabel,
          icon: 'fas fa-oven',
          action: option => {
            doCooking(option.data.restaurantId, c.from);
          },
          canInteract: (_, __, option) => {
            if (!Business.isSignedIn(option.data.restaurantId)) return false;
            return option.data.id === idx; //  only show this cooking entry at this zone because we use general zone name
          },
        },
      ],
      distance: 2,
    });
    peekIds.push(...newPeekIds);
  });
  Object.entries(restaurant.items).forEach(([item, data]) => {
    PolyTarget.addBoxZone('restaurant_item', data.zone.center, data.zone.width, data.zone.length, {
      ...data.zone.options,
      data: {
        id: item,
        restaurantId,
      },
    });
    const newPeekIds = Peek.addZoneEntry('restaurant_item', {
      options: [
        {
          label: data.peekLabel,
          icon: 'fas fa-knife-kitchen',
          action: option => {
            Events.emitNet('restaurants:location:showCreateMenu', option.data.restaurantId, item);
          },
          canInteract: (_, __, option) => {
            if (!Business.isSignedIn(option.data.restaurantId)) return false;
            return option.data.id === item; //  only show this cooking entry at this zone because we use general zone name
          },
        },
      ],
      distance: 2,
    });
    peekIds.push(...newPeekIds);
  });

  restaurantEmployeeZonesBuilt = true;
};

export const destroyRestaurantZones = () => {
  if (!restaurantZonesBuilt) return;

  PolyTarget.removeZone('restaurant_register');
  PolyTarget.removeZone('restaurant_leftover');
  PolyTarget.removeZone('restaurant_stash');

  restaurantZonesBuilt = false;
};

export const destroyRestaurantEmployeeZones = () => {
  if (!restaurantEmployeeZonesBuilt) return;

  PolyTarget.removeZone('restaurant_cook');
  PolyTarget.removeZone('restaurant_item');
  Peek.removeZoneEntry(peekIds);
  peekIds = [];

  restaurantEmployeeZonesBuilt = false;
};
