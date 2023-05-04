import { Events, Util } from '@dgx/client';
import { charModule } from 'helpers/core';

on('misc:walkstyles:set', (data: any) => {
  const walkstyle = data.walk;
  if (!walkstyle) return;
  setWalkstyle(walkstyle);
});

export const setWalkstyle = async (walkstyle: string, save = true) => {
  await Util.loadAnimSet(walkstyle);
  SetPedMovementClipset(PlayerPedId(), walkstyle, 0.2);
  RemoveAnimSet(walkstyle);
  if (save) {
    Events.emitNet('misc:walkstyles:save', walkstyle);
  }
};

global.exports('setWalkstyle', setWalkstyle);

Util.onCharSpawn(isNewChar => {
  if (isNewChar) return;

  const plyMetadata = charModule.getMetadata();
  if (!plyMetadata?.walkStyle) return;
  setWalkstyle(plyMetadata.walkStyle, false);
});

on('misc:expressions:set', async (data: { expression: string }) => {
  if (!data.expression) return;
  //@ts-ignore
  SetFacialIdleAnimOverride(PlayerPedId(), data.expression, 0);
});
