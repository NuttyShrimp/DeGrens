import { PolyZone, RPC } from '@dgx/client';
import heistData from '../config/heistdata';
import { setDoorState } from './doors';

let currentLocation: Heist.Id;

export const getCurrentLocation = (): Heist.Id => {
  return currentLocation;
};

// build zones on start
setImmediate(() => {
  Object.entries(heistData).forEach(([id, data]) => {
    const options = {
      ...data.zone.options,
      data: {
        id: id,
      },
    };
    PolyZone.addPolyZone('heist_location', data.zone.vectors, options, true);
  });
});

PolyZone.onEnter<{ id: string }>('heist_location', async (_name: string, data: { id: Heist.Id }) => {
  currentLocation = data.id;
  const doorState = await RPC.execute<boolean>('heists:server:getDoorState', currentLocation);
  setDoorState(currentLocation, doorState);
});

PolyZone.onLeave('heist_location', () => {
  currentLocation = null;
});

RPC.register('heists:client:getCurrentLocation', getCurrentLocation);
