import { Inventory, Notifications, RPC, SyncedObjects } from '@dgx/server';
import { SPIKESTRIP_AMOUNT, SPIKESTRIP_LIFETIME } from './constants.spikestrips';

Inventory.registerUseable('spike_strip', async (plyId, item) => {
  const plyPed = GetPlayerPed(String(plyId));
  if (GetVehiclePedIsIn(plyPed, false) !== 0) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig');
    return;
  }

  const objectsCreateData = await RPC.execute<Objects.SyncedCreateData[]>(
    'police:spikestrips:getPosition',
    plyId,
    SPIKESTRIP_AMOUNT
  );
  if (!objectsCreateData) return;

  emitNet('police:spikestrips:doAnim', plyId);
  Inventory.destroyItem(item.id);

  setTimeout(async () => {
    const ids = await SyncedObjects.add(objectsCreateData);
    setTimeout(() => {
      SyncedObjects.remove(ids);
    }, SPIKESTRIP_LIFETIME);
  }, 400);
});
