import { Events, Inventory, RPC, Util } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';
import { mainLogger } from 'sv_logger';

Events.onNet('storerobbery:server:hackSafe', async (src: number, storeId: Store.Id) => {
  const isInStore = await RPC.execute<boolean>('storerobbery:client:isInStore', src);
  if (!isInStore) {
    mainLogger.warn(`Player ${src} tried to hack safe but was not in store`);
    Util.Log(
      'storerobbery:notInStore',
      { storeId },
      `${Util.getName(src)} tried to hack safe but was not in store`,
      src,
      true
    );
    return;
  }

  stateManager.setSafeState(storeId, 'decoding');
  stateManager.setSafeHacker(storeId, src);
  const timeout = (await getConfig()).safe.crackDelay * 60 * 1000;
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'decoding') return;
    stateManager.setSafeState(storeId, 'opened');
  }, timeout);
});

Events.onNet('storerobbery:server:lootSafe', async (src: number, storeId: Store.Id) => {
  const isInStore = await RPC.execute<boolean>('storerobbery:client:isInStore', src);
  if (!isInStore) {
    mainLogger.warn(`Player ${src} tried to receive loot but was not in store`);
    Util.Log(
      'storerobbery:notInStore',
      { storeId },
      `${Util.getName(src)} tried to receive loot but was not in store`,
      src,
      true
    );
    return;
  }

  const amount = Util.getRndInteger(4, 7);
  Inventory.addItemToPlayer(src, 'moneyroll', amount);

  const receiveSpecial = Util.getRndInteger(0, 100) < (await getConfig()).safe.specialItemChance;
  if (receiveSpecial) {
    Inventory.addItemToPlayer(src, 'drive_v1', 1);
  }

  mainLogger.info(
    `Player ${src} has robbed a safe and received the loot${receiveSpecial ? 'and the special item' : ''}`
  );
  Util.Log(
    'storerobbery:robbedSafe',
    { amount, storeId },
    `${Util.getName(src)} has robbed a register and received ${amount} moneyrolls${
      receiveSpecial ? 'and the special item' : ''
    }`,
    src
  );

  stateManager.setSafeState(storeId, 'looted');
  stateManager.setSafeHacker(storeId, null);

  const timeout = (await getConfig()).safe.refillTime * 60 * 1000;
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'looted') return;
    stateManager.setSafeState(storeId, 'closed');
  }, timeout);
});

Events.onNet('storerobbery:server:cancelHack', (src: number, storeId: Store.Id) => {
  stateManager.setSafeState(storeId, 'closed');
  stateManager.setSafeHacker(storeId, null);
});
