import { Events, UI } from '@dgx/client';

let whitelistedJobs: Set<string> = new Set();

const updateUIStore = () => {
  UI.SendAppEvent('jobs', [...whitelistedJobs]);
};

Events.onNet('jobs:whitelists:seed', (jobs: string[]) => {
  whitelistedJobs = new Set(jobs);
  updateUIStore();
});

Events.onNet('jobs:whitelists:update', (job: string, action: 'remove' | 'add') => {
  switch (action) {
    case 'remove':
      whitelistedJobs.delete(job);
      break;
    case 'add':
      whitelistedJobs.add(job);
      break;
  }
  updateUIStore();
});

UI.onLoad(() => {
  Events.emitNet('jobs:whitelists:requestSeeding');
});
