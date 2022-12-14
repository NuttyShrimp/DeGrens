import { UI, RPC, Events } from '@dgx/client';
import contextManager from 'classes/contextmanager';
import itemDataManager from 'classes/itemdatamanager';

UI.RegisterUICallback('inventory/getData', async (_, cb) => {
  const secondary = await contextManager.getSecondary();
  const openingData = await RPC.execute<OpeningData>('inventory:server:open', secondary);
  if (!openingData) throw new Error('Failed to get openingdata');

  cb({
    data: {
      items: openingData.items.reduce<Record<string, Inventory.Item>>((acc, cur) => {
        acc[cur.id] = { ...cur, ...itemDataManager.get(cur.name) };
        return acc;
      }, {}),
      primary: openingData.primary,
      secondary: openingData.secondary,
    },
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('inventory/useItem', (data: { id: string }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('inventory:server:useItem', data.id);
});

UI.RegisterUICallback('inventory/bindItem', (data: { id: string; key: Inventory.Hotkey }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('inventory:server:bindItem', data.id, data.key);
});

UI.RegisterUICallback('inventory/unbindItem', (data: { id: string }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('inventory:server:unbindItem', data.id);
});

UI.RegisterUICallback('inventory/moveItem', (data: Inventory.ItemState, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('inventory:server:moveItem', data.id, data.position, data.inventory);
});

UI.RegisterUICallback('inventory/getFromShop', (data: { item: string; inventory: string; position: Vec2 }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('inventory:server:getFromShop', data.item, data.inventory, data.position);
});
