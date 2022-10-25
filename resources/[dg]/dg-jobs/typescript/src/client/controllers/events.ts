import { Events } from '@dgx/client';

onNet('jobs:client:openJobAllowlist', () => {
  Events.emitNet('jobs:whitelist:server:openJobAllowlist');
});
