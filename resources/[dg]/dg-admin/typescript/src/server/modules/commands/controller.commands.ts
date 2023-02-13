import { Events, Util } from '@dgx/server';

import { loadCommands } from './service.commands';
import { getHiddenPlayers, setPlayerDefaultCommandState } from './state.commands';

setImmediate(() => {
  loadCommands();
  Util.getAllPlayers().forEach(setPlayerDefaultCommandState);
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

Events.onNet('admin:server:toggleFreezeEntity', (_, netId: number, isFrozen: boolean) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (!entity || !DoesEntityExist(entity)) return;
  FreezeEntityPosition(entity, !isFrozen);
});

on('playerJoining', () => {
  setPlayerDefaultCommandState(source);
});

global.exports('getHiddenPlys', getHiddenPlayers);
