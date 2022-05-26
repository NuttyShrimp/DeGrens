import { STORE_DATA } from 'config/stores';
import { PolyZone } from '@dgx/client';

export const buildRegisterZone = (storeId: Store.Id) => {
  const zone = STORE_DATA[storeId].registerzone;
  PolyZone.addBoxZone('store_registers', zone.center, zone.length, zone.width, { ...zone.options, data: {} }, true);
};

export const destroyRegisterZone = () => {
  PolyZone.removeZone('store_registers');
};
