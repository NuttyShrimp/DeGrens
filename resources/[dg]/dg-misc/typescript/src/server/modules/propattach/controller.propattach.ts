import { Events, Util } from '@dgx/server';
import {
  clearProps,
  handlePlayerJoin,
  handlePlayerLeave,
  handleRoutingBucketChange,
  registerPropToPlayer,
  removePropFromPlayer,
} from './service.propattach';

global.exports('clearProps', clearProps);

Events.onNet('propattach:register', (src: number, netId: number) => {
  registerPropToPlayer(src, netId);
});

Events.onNet('propattach:remove', (src: number, netId: number) => {
  removePropFromPlayer(src, netId);
});

on('lib:instance:change', (plyId: number, routingBucket: number) => {
  handleRoutingBucketChange(plyId, routingBucket);
});

on('playerJoining', () => {
  handlePlayerJoin(source);
});

on('playerDropped', () => {
  handlePlayerLeave(source);
});

on('onResourceStart', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  Util.getAllPlayers().forEach(plyId => {
    handlePlayerJoin(plyId);
  });
});

on('onResourceStop', (resourceName: string) => {
  if (resourceName !== GetCurrentResourceName()) return;
  Util.getAllPlayers().forEach(plyId => {
    handlePlayerLeave(plyId);
  });
});

Util.onPlayerUnloaded(plyId => {
  clearProps(plyId);
});
