import { Events } from '@dgx/server';
import { seedBusinessTypes } from './business';

export let config: Config.Config;
export let permissions: Record<string, number> = {};

export const setConfig = async (data: Config.Config) => {
  config = data;
  await seedBusinessTypes();
  validatePermissions();
};

const validatePermissions = () => {
  // Check labels
  const allPermissions = Object.keys(config.permissions.base).concat(Object.keys(config.permissions.extra));
  for (const permission of allPermissions) {
    if (!config.permissions.labels[permission]) {
      throw new Error(`${permission} is missing a label in the business config`);
    }
  }
  // check if types don include non-existing permissions
  for (const businessType of Object.keys(config.types)) {
    const missingPermissions = config.types[businessType].filter(t => !allPermissions.includes(t));
    if (missingPermissions.length > 0) {
      throw new Error(
        `${businessType} business type has unkown special permissions assigned: ${missingPermissions.join(',')}`
      );
    }
  }
  Object.entries(config.permissions.base).forEach(([perm, val]) => {
    permissions[perm] = config.permissions.base[perm];
  });
  Object.entries(config.permissions.extra).forEach(([perm, val]) => {
    permissions[perm] = config.permissions.extra[perm];
  });

  Events.emitNet('business:client:setPermLabels', -1, config.permissions.labels);
};

export const getBitmaskForPermissions = (perms: string[]) => {
  let bitmask = 0;
  perms.forEach(perm => {
    bitmask |= permissions[perm];
  });
  return bitmask;
};

export const permissionsFromBitmask = (permMask: number) => {
  const perms: string[] = [];
  for (const perm in permissions) {
    if (permMask & permissions[perm]) {
      perms.push(perm);
    }
  }
  return perms;
};
