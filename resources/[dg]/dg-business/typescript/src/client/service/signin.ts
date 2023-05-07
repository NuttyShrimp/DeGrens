import { Notifications } from '@dgx/client';

let signedInBusinesses = new Map<string, Business.Info>();

export const isSignedInAtBusiness = (businessName: string) => signedInBusinesses.has(businessName);

export const isSignedInAtAnyOfBusinessType = (businessType: string) => {
  for (const [_, business] of signedInBusinesses) {
    if (business.business_type.name === businessType) return true;
  }
  return false;
};

export const addSignedInBusiness = (business: Business.Info) => {
  Notifications.add(`Je bent nu ingeklokt bij ${business.label}!`);
  emit('business:signedIn', business.name, business.business_type.name);
  signedInBusinesses.set(business.name, business);
};

export const removeSignedInBusiness = (business: Business.Info) => {
  Notifications.add(`Je bent nu uitgeklokt bij ${business.label}!`);
  emit('business:signedOut', business.name, business.business_type.name);
  signedInBusinesses.delete(business.name);
};
