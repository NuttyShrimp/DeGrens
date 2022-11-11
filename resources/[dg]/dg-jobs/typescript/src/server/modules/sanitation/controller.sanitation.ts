import { Events, Jobs, RPC } from '@dgx/server';
import {
  finishJobForGroup,
  groupEnteredTarget,
  takeBagFromDumpster,
  playerLeftGroup,
  startJobForGroup,
  syncSanitationJobToClient,
  putBagInVehicle,
} from './service.sanitation';

Events.onNet('jobs:sanitation:signIn', (src: number) => {
  startJobForGroup(src);
});

Events.onNet('jobs:sanitation:finish', (src: number, netId: number) => {
  finishJobForGroup(src, netId);
});

Jobs.onGroupJoin((plyId, _, groupId) => {
  syncSanitationJobToClient(groupId, plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  playerLeftGroup(groupId, plyId);
});

Events.onNet('jobs:sanitation:enteredTarget', (src: number) => {
  groupEnteredTarget(src);
});

RPC.register('jobs:sanitation:takeFromDumpster', (src: number, location: Vec3) => {
  return takeBagFromDumpster(src, location);
});

Events.onNet('jobs:sanitation:putInVehicle', (src: number) => {
  putBagInVehicle(src);
});
