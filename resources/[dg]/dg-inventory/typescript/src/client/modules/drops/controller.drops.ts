import { Events } from '@dgx/client';
import dropsManager from './classes/dropsmanager';

Events.onNet('inventory:client:updateDrop', (action: 'remove' | 'add', drop: Vec3) => {
  switch (action) {
    case 'add':
      dropsManager.add(drop);
      break;
    case 'remove':
      dropsManager.remove(drop);
      break;
  }
});
