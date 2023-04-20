import { Events, Financials, Inventory, Minigames, Notifications, Police, Taskbar, Util } from '@dgx/server';
import { pickupAtm, startRobbery, unattachAtmFromWall } from './service.atm';
import { ATMS } from '../../../shared/atm/constants.atm';
import config from 'services/config';
import { atmLogger } from './logger.atm';

Events.onNet('criminal:atm:start', startRobbery);
Events.onNet('criminal:atm:unattach', unattachAtmFromWall);
Events.onNet('criminal:atm:pickup', pickupAtm);

Events.onNet('criminal:atm:dispatch', (plyId: number) => {
  const plyCoords = Util.getPlyCoords(plyId);

  Police.createDispatchCall({
    tag: '10-65',
    title: 'ATM Overval',
    description: 'Een voorbijganger meldt dat er een verdachte persoon een ATM aan het beroven is.',
    blip: {
      sprite: 272,
      color: 1,
    },
    coords: plyCoords,
  });
});

Inventory.registerUseable(
  ATMS.map(a => a.itemName),
  async (plyId, itemState) => {
    const success = await Minigames.keygame(plyId, 25, 1, 10);
    if (!success) return;

    const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
    if (!removed) {
      Notifications.add(plyId, 'Je hebt dit item niet', 'error');
      return;
    }

    const lootConfig = config.atm.loot;
    const [minCash, maxCash] = lootConfig.cash;
    const [minRolls, maxRolls] = lootConfig.rolls;

    const cash = Util.getRndInteger(minCash, maxCash + 1);
    const rolls = Util.getRndInteger(minRolls, maxRolls + 1);
    Financials.addCash(plyId, cash, 'atm-robbery');
    Inventory.addItemToPlayer(plyId, 'money_roll', rolls);
    if (Math.random() <= lootConfig.specialItem.chance) {
      const item = lootConfig.specialItem.pool[Util.getRndInteger(0, lootConfig.specialItem.pool.length)]
      Inventory.addItemToPlayer(plyId, item, 1);
    }

    const logMsg = `${Util.getName(plyId)}(${plyId}) heeft een ATM berooft (cash: ${cash}, rolls: ${rolls})`;
    atmLogger.info(logMsg);
    Util.Log('criminal:atm:loot', { cash, rolls }, logMsg, plyId);
  }
);