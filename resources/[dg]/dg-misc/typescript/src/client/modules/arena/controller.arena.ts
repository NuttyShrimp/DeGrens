import { Events } from '@dgx/client';
import { loadArenaInterior, unloadCurrentArenaInterior } from './service.arena';

Events.onNet('misc:arena:setInterior', (interior: Arena.Interior | undefined) => {
  unloadCurrentArenaInterior();

  if (interior != undefined) {
    setTimeout(() => {
      loadArenaInterior(interior);
    }, 100);
  }
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;

  unloadCurrentArenaInterior();
});
