import { UI } from '@dgx/client';
import { startGridGame, finishGridGame } from './service.gridgames';

UI.RegisterUICallback('gridgame/finished', (data: { id: string; success: boolean }, cb) => {
  finishGridGame(data.id, data.success);
  cb({ data, meta: { ok: true, message: 'done' } });
});

global.asyncExports('gridgame', (data: Minigames.GridGame.GenericGameData) => {
  return startGridGame(data);
});
