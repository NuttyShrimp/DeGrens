import { Auth, Events, RPC } from '@dgx/server';
import { getConfig } from 'helpers/config';

Auth.onAuth(plyId => {
  const config = getConfig();
  const storeZones = Object.entries(config.stores).reduce<Record<Store.Id, IBoxZone>>((acc, [id, data]) => {
    acc[id as Store.Id] = data.storezone;
    return acc;
  }, {} as Record<Store.Id, IBoxZone>);
  Events.emitNet('storerobbery:client:buildStoreZones', plyId, storeZones);
});

RPC.register('storerobbery:server:getRegisterZone', async (_src: number, storeId: Store.Id) => {
  const config = getConfig();
  return config.stores[storeId].registerzone;
});

RPC.register('storerobbery:server:getSafeCoords', async (_src: number, storeId: Store.Id) => {
  const config = getConfig();
  return config.stores[storeId].safecoords;
});
