import { Events } from '@dgx/client';

let cache: Record<string, number> = {};

Events.onNet('jobs:client:updateAmountCache', (amounts: typeof cache) => {
  cache = amounts;
});

global.exports('getAmountForJob', (jobName: string) => {
  return cache[jobName] ?? 0;
});
