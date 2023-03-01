import { BlipManager, Events, Notifications, Peek, PolyTarget, PolyZone } from '@dgx/client';
import { doCooking } from './actions';

// This servicefile handles the general locations of restaurants.
// This includes the building/destroying zones
// Signing in, menuitems etc

let restaurants: Restaurants.Config['restaurants'];

let currentRestaurant: string | null = null;
let restaurantZonesBuilt = false;
let restaurantEmployeeZonesBuilt = false;
let peekIds: string[] = [];
let isSignedIn = false;

export const getCurrentRestaurant = () => currentRestaurant;
export const isInARestaurant = () => currentRestaurant !== null;

export const handleLocationEnter = (restaurant: string) => {
  currentRestaurant = restaurant;
  Events.emitNet('restaurants:location:entered', restaurant);
  buildRestaurantZones(restaurant);
};

export const handleLocationLeave = (restaurant: string) => {
  currentRestaurant = null;
  Events.emitNet('restaurants:location:left', restaurant);
  destroyRestaurantZones();
};

/**
 * You can assume ply is business employee when this returns true
 */
export const getIsSignedIn = () => isSignedIn;

export const setIsSignedIn = (restaurantId: string, signedIn: boolean) => {
  isSignedIn = signedIn;

  const label = restaurants[restaurantId].label;
  if (signedIn) {
    Notifications.add(`Je bent nu ingeklokt bij ${label}`);
    buildRestaurantEmployeeZones(restaurantId);
  } else {
    Notifications.add(`Je bent nu uitgeklokt bij ${label}`);
    destroyRestaurantEmployeeZones();
  }
};

// Each restaurant zone gets build on load
export const loadRestaurants = (config: Restaurants.Config['restaurants']) => {
  restaurants = config;

  for (const [id, restaurant] of Object.entries(restaurants)) {
    PolyZone.addPolyZone('restaurant_location', restaurant.restaurantZone.points, {
      minZ: restaurant.restaurantZone.minZ,
      maxZ: restaurant.restaurantZone.maxZ,
      data: {
        id,
      },
    });
    BlipManager.addBlip({
      id,
      category: 'restaurants',
      text: restaurant.label,
      scale: 0.9,
      sprite: 409,
      coords: restaurant.managementZone.center,
    });
  }
};

// these zones per restaurant get build on enter for everyone
const buildRestaurantZones = (restaurantId: string) => {
  if (restaurantZonesBuilt) return;

  const restaurant = restaurants[restaurantId];
  if (!restaurant) return;

  PolyTarget.addBoxZone(
    'restaurant_management',
    restaurant.managementZone.center,
    restaurant.managementZone.width,
    restaurant.managementZone.length,
    {
      ...restaurant.managementZone.options,
      data: {
        id: restaurantId,
      },
    }
  );
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
const buildRestaurantEmployeeZones = (restaurantId: string) => {
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
          canInteract: (_, __, option) => isSignedIn && option.data.id === idx, //  only show this cooking entry at this zone because we use general zone name
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
          canInteract: (_, __, option) => isSignedIn && option.data.id === item, //  only show this item entry at this zone because we use general zone name
        },
      ],
      distance: 2,
    });
    peekIds.push(...newPeekIds);
  });

  restaurantEmployeeZonesBuilt = true;
};

const destroyRestaurantZones = () => {
  if (!restaurantZonesBuilt) return;

  PolyTarget.removeZone('restaurant_management');
  PolyTarget.removeZone('restaurant_register');
  PolyTarget.removeZone('restaurant_leftover');

  restaurantZonesBuilt = false;
};

const destroyRestaurantEmployeeZones = () => {
  if (!restaurantEmployeeZonesBuilt) return;

  PolyTarget.removeZone('restaurant_stash');
  PolyTarget.removeZone('restaurant_cook');
  PolyTarget.removeZone('restaurant_item');
  Peek.removeZoneEntry(peekIds);
  peekIds = [];

  restaurantEmployeeZonesBuilt = false;
};
