import { Events } from '@dgx/client';
import { loadRestaurants, setIsSignedIn } from 'services/locations';

Events.onNet('restaurants:client:init', (restaurants: Restaurants.Config['restaurants']) => {
  loadRestaurants(restaurants);
});

Events.onNet('restaurants:location:setSignedIn', (restaurantId: string, signedIn: boolean) => {
  setIsSignedIn(restaurantId, signedIn);
});
