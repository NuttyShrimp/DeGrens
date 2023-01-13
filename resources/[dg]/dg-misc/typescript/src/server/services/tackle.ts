import { Events } from '@dgx/server';

Events.onNet('misc:tackle:server', (_: number, target: number) => {
  Events.emitNet('misc:tackle:do', target);
});
