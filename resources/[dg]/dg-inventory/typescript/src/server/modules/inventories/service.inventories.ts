import { Admin } from '@dgx/server';
import { INVENTORY_TYPES } from '../../constants';

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
