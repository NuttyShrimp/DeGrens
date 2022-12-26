import { PolyTarget } from '@dgx/client/classes';

const builtIds = new Set<string>();

export const buildLockers = (lockers: Lockers.BuildData[]) => {
  lockers.forEach(locker => {
    if (builtIds.has(locker.id)) return;

    PolyTarget.addCircleZone('locker', locker.coords, locker.radius, {
      useZ: true,
      data: {
        id: locker.id,
      },
    });
    builtIds.add(locker.id);
  });
  console.log(`[Lockers] Successfully added ${lockers.length} ${lockers.length > 1 ? 'lockers' : 'locker'}`);
};
