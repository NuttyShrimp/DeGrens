import { BLACKLISTED_PED_MODELS, BLACKLISTED_VEHICLE_MODELS } from '../shared/constants';

export const BLACKLISTED_MODELS = new Set([
  ...Object.entries(BLACKLISTED_PED_MODELS).reduce<number[]>((acc, [m, { delete: del }]) => {
    if (del) {
      acc.push(GetHashKey(m) >>> 0);
    }
    return acc;
  }, []),
  ...Object.entries(BLACKLISTED_VEHICLE_MODELS).reduce<number[]>((acc, [m, { delete: del }]) => {
    if (del) {
      acc.push(GetHashKey(m) >>> 0);
    }
    return acc;
  }, []),
]);
