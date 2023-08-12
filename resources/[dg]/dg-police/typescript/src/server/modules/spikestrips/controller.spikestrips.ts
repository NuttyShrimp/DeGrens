import { Inventory, Notifications, SyncedObjects, Util } from '@dgx/server';
import { SPIKESTRIP_AMOUNT, SPIKESTRIP_LIFETIME } from './constants.spikestrips';

Inventory.registerUseable('spike_strip', async (plyId, item) => {
  const plyPed = GetPlayerPed(String(plyId));
  if (GetVehiclePedIsIn(plyPed, false) !== 0) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig');
    return;
  }

  emitNet('police:spikestrips:doAnim', plyId);
  Inventory.destroyItem(item.id);

  const plyCoords = { ...Util.getEntityCoords(plyPed), w: GetEntityHeading(plyPed) };
  const objectsCreateData: Objects.SyncedCreateData[] = [];
  for (let i = 0; i < SPIKESTRIP_AMOUNT; i++) {
    const coords = Util.getOffsetFromCoords(plyCoords, { x: 0.0, y: 0.5 + 2 * (i + 1) + 1.7 * i, z: 1.0 });
    objectsCreateData.push({
      model: 'p_ld_stinger_s',
      skipScheduling: true,
      skipStore: true,
      coords,
      rotation: { x: 0, y: 0, z: plyCoords.w },
      flags: {
        onFloor: true,
        isSpikestrip: true,
      },
    });
  }

  setTimeout(async () => {
    const ids = await SyncedObjects.add(objectsCreateData);
    setTimeout(() => {
      SyncedObjects.remove(ids);
    }, SPIKESTRIP_LIFETIME);
  }, 400);
});
