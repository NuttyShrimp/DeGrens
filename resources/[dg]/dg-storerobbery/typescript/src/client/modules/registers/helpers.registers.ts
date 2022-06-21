import { PolyZone, RPC } from '@dgx/client';

export const buildRegisterZone = async (storeId: Store.Id) => {
  const zone = await RPC.execute<IBoxZone>('storerobbery:server:getRegisterZone', storeId);
  PolyZone.addBoxZone('store_registers', zone.center, zone.length, zone.width, { ...zone.options, data: {} }, true);
};

export const destroyRegisterZone = () => {
  PolyZone.removeZone('store_registers');
};
