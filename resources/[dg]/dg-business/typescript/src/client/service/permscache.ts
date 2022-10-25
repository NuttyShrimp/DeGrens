// Keep cache to be used in peek and doorlock for checking if employed with correct permissions without needing to call server every 0.000000 seconds

import { Events } from '@dgx/client';

// Key: businessname, value: permissions set
const plyBusinesses: Map<string, Set<string>> = new Map();

// Gets used when player joins
Events.onNet('business:client:setCache', (businesses: { name: string; permissions: string[] }[]) => {
  plyBusinesses.clear();
  businesses.forEach(b => {
    plyBusinesses.set(b.name, new Set(b.permissions));
  });
});

// When player business perms get updated
Events.onNet('business:client:updateCache', (action: 'add' | 'remove', name: string, permissions: string[]) => {
  switch (action) {
    case 'add':
      plyBusinesses.set(name, new Set(permissions));
      break;
    case 'remove':
      plyBusinesses.delete(name);
      break;
  }
});

global.exports('isEmployee', (business: string, permissions?: string[]) => {
  if (!plyBusinesses.has(business)) return false;
  if (permissions == undefined) return true;
  const plyPermissions = plyBusinesses.get(business)!;
  return permissions.some(p => plyPermissions.has(p));
});

RegisterCommand(
  'business:showCache',
  () => {
    console.log(plyBusinesses);
  },
  false
);
