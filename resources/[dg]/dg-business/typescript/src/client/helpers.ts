import { PolyZone, PolyTarget, Peek } from '@dgx/client';
import { isSignedInAtBusiness } from 'service/signin';

export const buildAnyZone = (
  type: 'PolyZone' | 'PolyTarget',
  name: string,
  zone: Zones.Poly | Zones.Circle | Zones.Box,
  data: Record<string, any> = {}
) => {
  // if vectors is defined, we build polyzone
  if ('vectors' in zone) {
    if (type === 'PolyTarget') throw new Error('Tried to build PolyTarget polyzone');
    PolyZone.addPolyZone(name, zone.vectors, {
      ...zone.options,
      data,
    });
    return;
  }

  if (!('center' in zone)) throw new Error(`Zone ${name} has no center or vectors property`);

  // if radius is defined, we build circlezone
  if ('radius' in zone) {
    (type === 'PolyZone' ? PolyZone : PolyTarget).addCircleZone(name, zone.center, zone.radius, {
      ...zone.options,
      data,
    });
    return;
  }

  // if no vectors or radius, we build box
  (type === 'PolyZone' ? PolyZone : PolyTarget).addBoxZone(name, zone.center, zone.width, zone.length, {
    ...zone.options,
    data,
  });
};

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
