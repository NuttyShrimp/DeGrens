import { Events, RPC } from '@dgx/server';
import { finishJobForGroup, startDropoff, finishDropoff, startJobForGroup } from './service.postop';

Events.onNet('jobs:postop:signIn', (src: number, jobType: PostOP.JobType) => {
  startJobForGroup(src, jobType);
});

Events.onNet('jobs:postop:finish', (src: number, netId: number) => {
  finishJobForGroup(src, netId);
});

RPC.register('jobs:postop:startDropoff', startDropoff);
Events.onNet('jobs:postop:finishDropoff', finishDropoff);
