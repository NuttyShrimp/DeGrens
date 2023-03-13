import { PolyTarget } from '@dgx/client';
import { Notifications, PolyZone, RPC } from '@dgx/client';
import { enterInterior, leaveInterior } from 'modules/interior/service.interior';

const activeLocations = new Map<string, Houserobbery.Location>();

export const activateLocation = (houseId: string, location: Houserobbery.Location) => {
  activeLocations.set(houseId, location);
  PolyTarget.addBoxZone('houserobbery_door', location.coords, 1.0, 1.0, {
    data: {
      id: houseId,
    },
    heading: location.coords.w,
    minZ: location.coords.z - 2,
    maxZ: location.coords.z + 2,
  });
};

export const deactivateLocation = (houseId: string) => {
  const house = activeLocations.get(houseId);
  if (!house) return;
  PolyTarget.removeZone('houserobbery_door', houseId);
};

export const getActiveLocation = (houseId: string) => activeLocations.get(houseId);

export const enterHouse = async (houseId: string) => {
  const canEnter = await RPC.execute<boolean>('houserobbery:server:canEnter', houseId);
  if (!canEnter) {
    Notifications.add('Deze deur is nog vast...', 'error');
    return;
  }

  enterInterior(houseId);
};

export const leaveHouse = () => {
  leaveInterior();
  PolyZone.removeZone('houserobbery_exit');
};
