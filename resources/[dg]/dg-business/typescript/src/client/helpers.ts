import { Peek } from '@dgx/client';
import { isSignedInAtBusiness } from 'service/signin';

export const addPeekEntryForBusinessZone = (
  businessName: string,
  zoneType: 'management' | 'register' | 'stash' | 'shop' | 'crafting',
  mustBeSignedIn: boolean,
  peekParams: PeekParams
) => {
  Peek.addZoneEntry(`business_${zoneType}`, {
    distance: peekParams.distance,
    options: peekParams.options.map(option => {
      return {
        ...option,
        canInteract: (_, __, o) => {
          if (o.data.id !== businessName) return false;
          if (mustBeSignedIn && !isSignedInAtBusiness(o.data.id)) return false;
          return option.canInteract?.(_, __, o) ?? true;
        },
      } satisfies PeekParams['options'][number];
    }),
  });
};
