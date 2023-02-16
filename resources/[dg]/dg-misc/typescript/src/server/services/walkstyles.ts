import { Events } from '@dgx/server';

Events.onNet('misc:walkstyles:save', (plyId: number, set: string) => {
  const player = DGCore.Functions.GetPlayer(plyId);
  if (!player) return;
  player.Functions.SetMetaData('walkstyle', set);
});
