import { RPC } from '@dgx/client';

// instead of doing callback every time we get items, we keep a dirty flag to avoid unnecessary calls
// flag gets set whenever an item gets added to/removed from player inventory

let isDirty = true;
let playerItemNames: string[] = [];

onNet('inventory:cache:setDirty', () => {
  isDirty = true;
});

global.asyncExports('getPlayerItemNames', async () => {
  if (isDirty) {
    playerItemNames = (await RPC.execute<string[]>('inventory:server:getAllItemNames')) ?? [];
    isDirty = false;
  }
  return playerItemNames;
});
