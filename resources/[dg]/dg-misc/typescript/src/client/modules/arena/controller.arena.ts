import { Events, UI } from '@dgx/client';
import { loadArenaInterior, unloadCurrentArenaInterior } from './service.arena';

Events.onNet('misc:arena:setInterior', (interior: Arena.Interior | undefined) => {
  unloadCurrentArenaInterior();

  if (interior != undefined) {
    setTimeout(() => {
      loadArenaInterior(interior);
    }, 100);
  }
});

UI.RegisterUICallback('arena/changeInterior', (data: { arenaType: string | null }, cb) => {
  Events.emitNet('misc:arena:changeInterior', data.arenaType);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
