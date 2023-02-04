import { Events, Notifications, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';

export const handlePlayerCanceledHack = (plyId: number) => {
  const storeId = stateManager.safeHackers.get(plyId);
  if (!storeId || stateManager.getSafeState(storeId) !== 'decoding') return;

  const isInServer = Util.getName(plyId);

  stateManager.setSafeState(storeId, 'closed');
  stateManager.safeHackers.delete(plyId);
  if (isInServer) {
    Notifications.add(plyId, 'Verbinding verbroken...', 'error');
    Events.emitNet('storerobbery:safes:setIsHacker', plyId, false);
  }

  Util.Log(
    'storerobbery:safes:canceledHack',
    { storeId },
    `${Util.getName(plyId)} has canceled hack ${storeId}`,
    plyId
  );
};
