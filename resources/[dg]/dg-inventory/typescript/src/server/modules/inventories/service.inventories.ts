import { Admin } from '@dgx/server';
import { INVENTORY_TYPES } from '../../constants';
import { Inv } from './classes/inv';

export const validateIdBuildData = (plyId: number, data: IdBuildData) => {
  // Players needs staff perms to be able to use override
  if ('override' in data) {
    return Admin.hasPermission(plyId, 'staff');
  }

  // First we check if type is provided and is valid type
  if (!INVENTORY_TYPES.includes(data.type)) return false;

  // Both identifier and data must not be undefined
  if (data.identifier === undefined && data.data === undefined) return false;

  return true;
};

export const calculateSizeBasedOnItems = (inv: Inv, items: { size: Vec2 }[]) => {
  items.forEach(item => {
    if (inv.size < item.size.y) {
      inv.setSize(item.size.y);
    }
    let posInfo = inv.getFirstAvailablePosition(item.size);
    let timeout = 0;
    while (!posInfo || timeout >= 10) {
      inv.setSize(inv.size + 1);
      posInfo = inv.getFirstAvailablePosition(item.size);
      timeout++;
    }
    inv.setSize(posInfo.position.y + item.size.y);
  });
};
