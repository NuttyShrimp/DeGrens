import {
  createBusiness,
  deleteBusiness,
  getBusinessById,
  getBusinessByName,
  getBusinessPlayerIsInsideOf,
  getSignedInPlayersForBusinessType,
  isPlayerSignedInAtAnyOfBusinessType,
} from 'services/business';
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

asyncExports('createBusiness', createBusiness);

global.exports('isPlayerSignedInAtBusiness', (plyId: number, name: string) => {
  const business = getBusinessByName(name);
  if (!business) return [];
  return business.isSignedIn(plyId);
});

global.exports('getSignedInPlayersForBusiness', (name: string): number[] => {
  const business = getBusinessByName(name);
  if (!business) return [];
  return business.getSignedInPlayers();
});

global.exports('isPlayerSignedInAtAnyOfBusinessType', isPlayerSignedInAtAnyOfBusinessType);
global.exports('getSignedInPlayersForBusinessType', getSignedInPlayersForBusinessType);

global.exports('isPlayerInsideBusiness', (plyId: number, name: string) => {
  const business = getBusinessByName(name);
  if (!business) return [];
  return business.isPlayerInside(plyId);
});

global.exports('getPlayersInsideBusiness', (name: string) => {
  const business = getBusinessByName(name);
  if (!business) return [];
  return [...business.getInsidePlayers()];
});

global.exports('getBusinessPlayerIsInsideOf', (plyId: number) => {
  const business = getBusinessPlayerIsInsideOf(plyId);
  if (!business) return;
  const businessInfo = business.getInfo();
  return { name: businessInfo.name, type: businessInfo.business_type.name };
});

global.exports('getItemPrice', (name: string, item: string) => {
  const business = getBusinessByName(name);
  if (!business) return;
  return business.getItemPrice(item);
});
