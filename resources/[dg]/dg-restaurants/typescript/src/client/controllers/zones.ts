import { PolyZone } from '@dgx/client';
import { handleLocationEnter, handleLocationLeave } from 'services/locations';

PolyZone.onEnter<{ id: string }>('restaurant_location', (_, data) => {
  handleLocationEnter(data.id);
});

PolyZone.onLeave<{ id: string }>('restaurant_location', (_, data) => {
  handleLocationLeave(data.id);
});
