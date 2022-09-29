import { Events } from '@dgx/server';

import { loadCommands } from './service.commands';

setImmediate(() => {
  loadCommands();
});

Events.onNet('admin:server:damageEntity', (_, netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  Events.emitNet('admin:client:damageEntity', NetworkGetEntityOwner(entity), netId);
});

Events.onNet('admin:server:deleteEntity', (_, netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  DeleteEntity(entity);
});
