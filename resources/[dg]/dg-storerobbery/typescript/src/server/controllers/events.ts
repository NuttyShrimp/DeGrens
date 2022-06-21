import { RPC } from "@dgx/server";
import { getConfig } from "helpers/config";

RPC.register('storerobbery:server:getStoreZones', async () => {
  const config = await getConfig();
  const storeZones = {} as Record<Store.Id, IBoxZone>
  Object.entries(config.stores).forEach(([id, data]) => {
    storeZones[id as Store.Id] = data.storezone;
  });
  return storeZones;
})

RPC.register('storerobbery:server:getRegisterZone', async (_src: number, storeId: Store.Id) => {
  const config = await getConfig();
  return config.stores[storeId].registerzone;
})

RPC.register('storerobbery:server:getSafeCoords', async (_src: number, storeId: Store.Id) => {
  const config = await getConfig();
  return config.stores[storeId].safecoords;
})