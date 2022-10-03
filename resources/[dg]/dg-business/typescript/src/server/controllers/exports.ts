import { getBusinessById } from "services/business";
import { permissionsFromBitmask } from "services/config";

global.exports('getBusinessById', (id: number) => getBusinessById(id));

global.exports('getBusinessEmployees', (id: number) => {
  const business = getBusinessById(id);
  if (!business) return [];
  return business.getEmployees();
});

global.exports('isPlyEmployed', (id: number, cid: number) => {
  const business = getBusinessById(id);
  if (!business) return false;
  return business.isEmployee(cid);
});

global.exports('hasPlyPermission', (id: number, cid: number, permission: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  return business.hasPermission(cid, permission);
});

global.exports('getPermissionsFromMask', (mask: number) => {
  return permissionsFromBitmask(mask) 
})
