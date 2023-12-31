import { Events, Inventory, Notifications, Police, RPC, Util, Minigames, Phone, Core } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';
import { mainLogger } from 'sv_logger';
import { BUSY_MESSAGE } from './constants.safes';
import { handlePlayerCanceledHack } from './service.safes';

Events.onNet('storerobbery:safes:hack', async (plyId: number, storeId: Storerobbery.Id) => {
  const safeState = stateManager.getSafeState(storeId);
  if (safeState !== 'closed') {
    Notifications.add(plyId, BUSY_MESSAGE[safeState], 'error');
    return;
  }

  const decodingItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'decoding_tool');
  if (!decodingItem) {
    Notifications.add(plyId, 'Hoe ga je dit openen?', 'error');
    return;
  }

  Inventory.setQualityOfItem(decodingItem.id, old => old - getConfig().safe.qualityDecrease);

  const storeConfig = getConfig().stores[storeId];
  Police.createDispatchCall({
    tag: '10-35',
    title: `Inbraak winkelkluis`,
    description: `Het inbraakalarm op een winkelkluis is net afgegaan`,
    coords: storeConfig.registerzone.center,
    entries: {
      'camera-cctv': storeConfig.cam,
    },
    blip: {
      sprite: 628,
      color: 5,
    },
  });
  Util.changePlayerStress(plyId, Util.getRndInteger(10, 15));

  const gameSuccess = await Minigames.sequencegame(plyId, 4, 5, 4);
  if (!gameSuccess) {
    Notifications.add(plyId, 'Mislukt...', 'error');
    return;
  }

  Phone.addMail(plyId, {
    subject: 'Decodering Kluis',
    sender: 'Hackerman',
    message:
      'Het decoderen van de kluis zal even duren. <br><br>Geef me 5 minuten. <br><br>Ga niet uit de winkel of de verbinding zal verbreken!',
  });

  stateManager.safeHackers.set(plyId, storeId);
  Events.emitNet('storerobbery:safes:setIsHacker', plyId, true);

  Util.Log('storerobbery:safes:hack', { storeId }, `${Util.getName(plyId)} has hacked safe ${storeId}`, plyId);

  stateManager.setSafeState(storeId, 'decoding');
  const timeout = getConfig().safe.crackDelay * 60 * 1000;
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'decoding') return;
    stateManager.setSafeState(storeId, 'opened');
    stateManager.safeHackers.delete(plyId);
    Events.emitNet('storerobbery:safes:setIsHacker', plyId, false);
  }, timeout);
});

RPC.register('storerobbery:safes:tryToLoot', async (src: number, storeId: Storerobbery.Id) => {
  const safeState = stateManager.getSafeState(storeId);
  if (safeState !== 'opened') return false;

  const safeConfig = getConfig().safe;
  const [minRollAmount, maxRollAmount] = safeConfig.rollAmount;
  const amount = Util.getRndInteger(minRollAmount, maxRollAmount + 1);
  Inventory.addItemToPlayer(src, 'money_roll', amount);

  const receiveSpecial = Util.getRndInteger(1, 101) < safeConfig.specialItemChance;
  if (receiveSpecial) {
    Inventory.addItemToPlayer(src, 'drive_v1', 1);
  }

  const receiveGoldBar = Util.getRndInteger(1, 101) < safeConfig.goldBarChance;
  if (receiveGoldBar) {
    Inventory.addItemToPlayer(src, 'gold_bar', 1);
  }

  const logMsg = `${Util.getName(src)} has looted a safe for ${amount} moneyrolls${
    receiveSpecial ? ' and the special item' : ''
  }`;
  mainLogger.info(logMsg);
  Util.Log(
    'storerobbery:safe:rob',
    {
      amount,
      receiveSpecial,
      receiveGoldBar,
      storeId,
    },
    logMsg,
    src
  );

  stateManager.setSafeState(storeId, 'looted');

  const timeout = getConfig().safe.refillTime * 60 * 1000;
  setTimeout(() => {
    if (stateManager.getSafeState(storeId) !== 'looted') return;
    stateManager.setSafeState(storeId, 'closed');
  }, timeout);

  return true;
});

Events.onNet('storerobbery:safes:cancelHack', (plyId: number, storeId: Storerobbery.Id) => {
  handlePlayerCanceledHack(plyId);
});

Core.onPlayerUnloaded(plyId => {
  handlePlayerCanceledHack(plyId);
});
