import { Core, Events } from '@dgx/server';

Events.onNet('misc:walkstyles:save', (plyId: number, set: string) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;
  player.updateMetadata('walkStyle', set);
});
