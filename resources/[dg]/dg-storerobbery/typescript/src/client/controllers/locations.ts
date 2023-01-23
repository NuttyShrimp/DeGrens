import { Events, PolyZone, RPC } from '@dgx/client/classes';
import locationManager from './classes/LocationManager';

Events.onNet('storerobbery:client:buildStoreZones', (storeZones: Record<Store.Id, IBoxZone>) => {
  Object.entries(storeZones).forEach(([id, data]) => {
    PolyZone.addBoxZone(
      'store_building',
      data.center,
      data.length,
      data.width,
      {
        ...data.options,
        data: { id },
      },
      true
    );
  });
});

PolyZone.onEnter('store_building', (name: string, data: { id: Store.Id }) => {
  locationManager.enteredStore(data.id);
});
PolyZone.onLeave('store_building', () => {
  locationManager.leftStore();
});

RPC.register('storerobbery:client:isInStore', () => {
  return locationManager.currentStore !== null;
});
