// Keep cache to be used in peek and doorlock for checking if employed with correct permissions without needing to call server every 0.000000 seconds

// Key: businessname, value: permissions set
const plyBusinesses: Map<string, Set<string>> = new Map();

// Gets used when player joins
export const setBusinessPermsCache = (businesses: { name: string; permissions: string[] }[]) => {
  plyBusinesses.clear();
  businesses.forEach(b => {
    plyBusinesses.set(b.name, new Set(b.permissions));
  });
};

// When player business perms get updated
export const updateBusinessPermsCache = (action: 'add' | 'remove', name: string, permissions: string[]) => {
  switch (action) {
    case 'add':
      plyBusinesses.set(name, new Set(permissions));
      break;
    case 'remove':
      plyBusinesses.delete(name);
      break;
  }
};

export const isEmployee = (businessName: string, permissions?: string[]) => {
  const plyPermissions = plyBusinesses.get(businessName);
  if (!plyPermissions) return false;
  if (permissions == undefined) return true;
  return permissions.some(p => plyPermissions.has(p));
};
