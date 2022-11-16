import { Events, Inventory, Notifications } from '@dgx/server';

Inventory.registerUseable('spike_strip', (plyId, item) => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false) !== 0) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig');
    return;
  }

  Inventory.destroyItem(item.id);
  Events.emitNet('police:spikestrips:place', plyId);
});

Events.onNet('police:spikestrips:add', (src: number, netIds: number[], center: Vec3, heading: number) => {
  const entities = netIds.map(netId => NetworkGetEntityFromNetworkId(netId));
  if (entities.some(ent => !DoesEntityExist(ent))) return console.log('ent doesnt exist');

  const timeout = 3000;
  Events.emitNet('police:spikestrips:sync', -1, timeout, center, heading);
  setTimeout(() => {
    entities.forEach(ent => DeleteEntity(ent));
  }, timeout);
});
