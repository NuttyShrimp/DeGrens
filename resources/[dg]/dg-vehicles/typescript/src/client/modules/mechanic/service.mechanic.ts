import { Business } from '@dgx/client';

// Returns the mechanic business the player is inside and signed into
export const getCurrentMechanicBusiness = () => {
  const inside = Business.getBusinessPlayerIsInsideOf();
  if (inside === null || inside.type !== 'mechanic') return;

  if (!Business.isSignedIn(inside.name)) return;

  return inside.name;
};
