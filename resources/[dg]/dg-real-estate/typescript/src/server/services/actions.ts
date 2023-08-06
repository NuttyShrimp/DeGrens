import { Events } from '@dgx/server';
import { instanceManager } from 'classes/instanceManager';
import { propertyManager } from 'classes/propertyManager';

export const enterProperty = (src: number, propertyName: string) => {
  const houseInfo = propertyManager.getHouseForName(propertyName);
  if (!houseInfo?.id) return;

  if (!propertyManager.hasHouseAccess(src, propertyName) && propertyManager.isLocked(propertyName)) return false;

  instanceManager.enter(houseInfo.name, src);
  Events.emitNet('realestate:enterProperty', src, houseInfo.name);
  return true
};
