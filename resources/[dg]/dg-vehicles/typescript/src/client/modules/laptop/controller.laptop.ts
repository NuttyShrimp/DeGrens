import { Events, RPC, UI } from '@dgx/client';

import { createPickupBlip, createPickupZone, getStoreItems } from './service.laptop';

UI.RegisterUICallback('laptop/bennys/getItems', async (_, cb) => {
  const items = await getStoreItems();
  cb({ data: items, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('laptop/bennys/purchase', async (data: { items: Record<string, number> }, cb) => {
  const success = await RPC.execute('vehicles:laptop:benny:doPurchase', data.items);
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

Events.onNet('vehicles:client:laptop:createPickupZone', (location: Laptop.Bennys.PickUp) => {
  createPickupBlip(location);
  createPickupZone(location);
});
