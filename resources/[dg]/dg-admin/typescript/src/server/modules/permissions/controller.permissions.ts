import { Config, RPC } from '@dgx/server';

import { hasPlayerPermission, loadPlayerRoles, loadRoles } from './service.permissions';

setImmediate(async () => {
  await Config.awaitConfigLoad();
  const roles = Config.getConfigValue('admin.roles');
  loadRoles(roles);
  loadPlayerRoles();
});

global.exports('hasPlayerPermission', (src: number, permission: string) => hasPlayerPermission(src, permission));

on('dg-config:moduleLoaded', (module: string, data: Permissions.Role[]) => {
  if (module === 'admin.roles') {
    loadRoles(data);
  }
});

RPC.register('admin:permissions:hasPermission', (src: number, permission: string) => {
  return hasPlayerPermission(src, permission);
});

RegisterCommand(
  'admin:refreshRoles',
  () => {
    loadPlayerRoles();
  },
  true
);
