import dropsManager from './classes/dropsmanager';

onNet('inventory:client:addDrop', (invId: string, coords: Vec3) => {
  dropsManager.add(invId, coords);
});

onNet('inventory:client:removeDrop', (invId: string) => {
  dropsManager.remove(invId);
});
