import { PolyZone } from '@dgx/client/classes';
import { STORE_DATA } from 'config/stores';
import locationManager from './classes/LocationManager';

Object.entries(STORE_DATA).forEach(([id, data]) => {
  PolyZone.addBoxZone(
    'store_building',
    data.storezone.center,
    data.storezone.length,
    data.storezone.width,
    {
      ...data.storezone.options,
      data: { id },
    },
    true
  );
});

PolyZone.onEnter('store_building', (name: string, data: { id: Store.Id }) => {
  locationManager.enteredStore(data.id);
});
PolyZone.onLeave('store_building', () => {
  locationManager.leftStore();
});
