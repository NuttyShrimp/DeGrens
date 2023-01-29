import { BLACKLISTED_PED_MODELS, BLACKLISTED_VEHICLE_MODELS } from '../shared/constants';

export const BLACKLISTED_MODELS = new Set(
  [...BLACKLISTED_PED_MODELS, ...BLACKLISTED_VEHICLE_MODELS].map(i => GetHashKey(i) >>> 0)
);
