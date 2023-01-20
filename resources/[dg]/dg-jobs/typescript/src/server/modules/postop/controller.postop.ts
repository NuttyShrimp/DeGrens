import { Events, Jobs, RPC } from '@dgx/server';
import {
  finishJobForGroup,
  startDropoff,
  playerLeftGroup,
  finishDropoff,
  startJobForGroup,
  syncPostOPJobToClient,
} from './service.postop';

Events.onNet('jobs:postop:signIn', (src: number, jobType: PostOP.JobType) => {
  startJobForGroup(src, jobType);
});

Events.onNet('jobs:postop:finish', (src: number, netId: number) => {
  finishJobForGroup(src, netId);
});

Jobs.onGroupJoin((plyId, _, groupId) => {
  syncPostOPJobToClient(groupId, plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  playerLeftGroup(groupId, plyId);
});

RPC.register('jobs:postop:startDropoff', startDropoff);
Events.onNet('jobs:postop:finishDropoff', finishDropoff);
