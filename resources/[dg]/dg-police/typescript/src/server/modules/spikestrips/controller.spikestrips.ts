import { Inventory, Notifications, Util, Sync, BaseEvents } from '@dgx/server';
import { SPIKESTRIP_AMOUNT, SPIKESTRIP_LIFETIME } from './constants.spikestrips';

const spikeEntities = new Set<number>();

Inventory.registerUseable('spike_strip', (plyId, item) => {
  const plyPed = GetPlayerPed(String(plyId));
  if (GetVehiclePedIsIn(plyPed, false) !== 0) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig');
    return;
  }

  Inventory.destroyItem(item.id);
  emitNet('police:spikestrips:doAnim', plyId);

  setTimeout(() => {
    const plyCoords = { ...Util.getEntityCoords(plyPed), w: GetEntityHeading(plyPed) };
    const modelHash = GetHashKey('p_ld_stinger_s');

    for (let i = 0; i < SPIKESTRIP_AMOUNT; i++) {
      const coords = Util.getOffsetFromCoords(plyCoords, { x: 0, y: 2 * (i + 1) + 1.7 * i, z: -1 });
      const ent = CreateObjectNoOffset(modelHash, coords.x, coords.y, coords.z, true, false, false);
      SetEntityHeading(ent, plyCoords.w);
      FreezeEntityPosition(ent, true);
      Sync.executeAction('police:spikestrips:setup', ent);
      Entity(ent).state.set('spikestrip', true, true);
      spikeEntities.add(ent);

      setTimeout(() => {
        spikeEntities.delete(ent);
        if (DoesEntityExist(ent)) {
          DeleteEntity(ent);
        }
      }, SPIKESTRIP_LIFETIME);
    }
  }, 400);
});

BaseEvents.onResourceStop(() => {
  for (const ent of spikeEntities) {
    if (DoesEntityExist(ent)) {
      DeleteEntity(ent);
    }
  }
});
