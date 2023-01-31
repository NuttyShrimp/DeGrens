import { Events, PolyZone, RPC } from '@dgx/client';

import { setDoorState } from './doors';

let currentLocation: Heist.Id | null;

export const getCurrentLocation = () => currentLocation;

Events.onNet('heists:client:buildHeistZones', (zones: Record<Heist.Id, Heist.Zone>) => {
  Object.entries(zones).forEach(([id, data]) => {
    const options = {
      ...data.options,
      data: {
        id: id,
      },
    };
    PolyZone.addPolyZone('heist_location', data.vectors, options, true);
  });
});

PolyZone.onEnter<{ id: Heist.Id }>('heist_location', async (_name: string, data) => {
  currentLocation = data.id;
  const doorState = await RPC.execute<boolean>('heists:server:getDoorState', currentLocation);
  if (!doorState) return;
  setDoorState(currentLocation, doorState);
});

PolyZone.onLeave('heist_location', () => {
  currentLocation = null;
});

RPC.register('heists:client:getCurrentLocation', getCurrentLocation);
