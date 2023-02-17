import { deleteBusiness, getBusinessById, getBusinessByName } from 'services/business';
import { getPermissions, permissionsFromBitmask } from 'services/config';

global.exports('getBusinessById', (id: number) => getBusinessById(id));
global.exports('getBusinessByName', (name: string) => getBusinessByName(name));

global.exports('getBusinessEmployees', (name: string) => {
  const business = getBusinessByName(name);
  if (!business) return [];
  return business.getEmployees();
});

global.exports('isPlyEmployed', (name: string, cid: number) => {
  const business = getBusinessByName(name);
  if (!business) return false;
  return business.isEmployee(cid);
});

global.exports('hasPlyPermission', (name: string, cid: number, permission: string) => {
  const business = getBusinessByName(name);
  if (!business) return false;
  return business.hasPermission(cid, permission);
});

global.exports('getPermissionsFromMask', (mask: number) => {
  return permissionsFromBitmask(mask);
});

global.exports('getAllPermissions', () => {
  return getPermissions();
});

global.exports('deleteBusiness', (id: number) => {
  return deleteBusiness(id);
});

global.exports('updateOwner', (id: number, newOwner: number) => {
  const business = getBusinessById(id);
  if (!business) return;
  if (!business.isEmployee(newOwner)) {
    return;
  }
  business.updateOwner(newOwner);
});
