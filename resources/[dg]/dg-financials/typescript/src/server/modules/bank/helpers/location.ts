import { bankLogger } from '../utils';

const locationMap = new Map<number, string | null>();

export const setPlyLoc = (src: number, loc: string | null) => {
  locationMap.set(src, loc);
  bankLogger.debug(`Set location for ${src} to ${loc}`);
};

export const isPlyInLoc = (src: number, loc: string) => {
  const plyLoc = locationMap.get(src);
  bankLogger.debug(`Checking if ${src} is in ${loc}`);
  return plyLoc === loc;
};
