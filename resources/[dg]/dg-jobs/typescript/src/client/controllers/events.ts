import { Events } from '@dgx/client';

on('jobs:client:openJobAllowlist', () => {
  Events.emitNet('jobs:whitelist:server:openJobAllowlist');
});
