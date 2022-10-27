import { finishGridGame, getActiveGridGameId } from 'modules/gridgames/service.gridgames';
import { finishKeygame, getActiveKeyGameId } from 'modules/keygame/service.keygame';

on('dg-ui:reload', () => {
  // if any game is active, return false as result
  const activeGridId = getActiveGridGameId();
  if (activeGridId !== null) {
    finishGridGame(activeGridId, false);
  }
  const activeKey = getActiveKeyGameId();
  if (activeKey !== null) {
    finishKeygame(activeKey, false);
  }
});
