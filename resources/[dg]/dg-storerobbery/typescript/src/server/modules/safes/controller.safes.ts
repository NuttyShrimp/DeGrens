import { Events, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';

Events.onNet('storerobbery:server:hackSafe', async (src: number, storeId: Store.Id) => {
  stateManager.setSafeState(storeId, 'decoding');
  stateManager.setSafeHacker(storeId, src);
  const timeout = (await getConfig()).safe.crackDelay * 60 * 1000
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'decoding') return;
    stateManager.setSafeState(storeId, 'opened');
  }, timeout);
});

Events.onNet('storerobbery:server:lootSafe', async (src: number, storeId: Store.Id) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const amount = Util.getRndInteger(4, 7);
  Player.Functions.AddItem('moneyroll', amount);
  emitNet('inventory:client:ItemBox', src, 'moneyroll', 'add');

  if (Util.getRndInteger(0, 100) < (await getConfig()).safe.specialItemChance) {
    Player.Functions.AddItem('drive_v1', 1);
    emitNet('inventory:client:ItemBox', src, 'drive_v1', 'add');
  }

  stateManager.setSafeState(storeId, 'looted');
  stateManager.setSafeHacker(storeId, null);

  const timeout = (await getConfig()).safe.refillTime * 60 * 1000
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'looted') return;
    stateManager.setSafeState(storeId, 'closed');
  }, timeout);
});

Events.onNet('storerobbery:server:cancelHack', (src: number, storeId: Store.Id) => {
  stateManager.setSafeState(storeId, 'closed');
  stateManager.setSafeHacker(storeId, null);
});
