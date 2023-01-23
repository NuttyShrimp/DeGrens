import { Events } from '@dgx/client';
import dropsManager from './classes/dropsmanager';

onNet('inventory:client:addDrop', (invId: string, coords: Vec3) => {
  dropsManager.add(invId, coords);
});

onNet('inventory:client:removeDrop', (invId: string) => {
  dropsManager.remove(invId);
});

// initialization of drops when ply joins server
Events.onNet('inventory:drops:initialize', (drops: [string, Vec3][], range: number) => {
  dropsManager.initialize(drops, range);
});
