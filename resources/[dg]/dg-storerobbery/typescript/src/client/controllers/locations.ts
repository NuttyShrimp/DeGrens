import { PolyZone, RPC } from '@dgx/client/classes';
import locationManager from './classes/LocationManager';

setImmediate(async () => {
  const storeZones = await RPC.execute<Record<Store.Id, IBoxZone>>('storerobbery:server:getStoreZones');
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
})

PolyZone.onEnter('store_building', (name: string, data: { id: Store.Id }) => {
  locationManager.enteredStore(data.id);
});
PolyZone.onLeave('store_building', () => {
  locationManager.leftStore();
});
