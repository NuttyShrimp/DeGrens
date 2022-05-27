import { RPC } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import stateManager from './classes/statemanager';

RPC.register('heists:server:fleeca:getPowerPercentage', (_src: number, coords: Vec3) => {
  const powerLocation = stateManager.getPowerLocation();
  if (!powerLocation) return 0;
  const distance = new Vector3(powerLocation.x, powerLocation.y, powerLocation.z).distance(coords);
  const powerAmount = 100 - Math.max(0, Math.min(distance, 2000)) / 20;
  return Math.round(powerAmount);
});
