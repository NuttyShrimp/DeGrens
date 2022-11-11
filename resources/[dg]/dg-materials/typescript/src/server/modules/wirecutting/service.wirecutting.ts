import { getConfig } from 'services/config';

const timedoutLocations = new Set<number>();

export const canCutLocation = (locationId: number) => {
  return !timedoutLocations.has(locationId);
};

export const cutLocation = (locationId: number) => {
  timedoutLocations.add(locationId);
  const timeout = getConfig().wirecutting.cutTimeout * 60 * 1000;
  setTimeout(() => {
    timedoutLocations.delete(locationId);
  }, timeout);
};
