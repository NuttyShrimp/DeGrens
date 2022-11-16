import { Events, Jobs } from '@dgx/server';
import { showBadge } from './service.badges';

Events.onNet('police:badges:showPoliceBadge', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  showBadge(src, 'police');
});

global.exports('showBadge', showBadge);
