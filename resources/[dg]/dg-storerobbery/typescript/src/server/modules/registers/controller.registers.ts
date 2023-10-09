import { Admin, Events, Inventory, Notifications, Police, Util, Financials } from '@dgx/server';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';
import { handleStartRegister } from './service.registers';

Events.onNet(
  'storerobbery:registers:tryToRob',
  async (plyId: number, storeId: Storerobbery.Id, registerCoords: Vec3, isBroken: boolean) => {
    const register = stateManager.getRegisterByCoords(storeId, registerCoords);
    if (!register) return;

    if (!register.canRob) {
      Notifications.add(plyId, 'Deze kassa is al leeg', 'error');
      return;
    }

    if (isBroken) {
      handleStartRegister(plyId, storeId, register.idx, true);
      return;
    }

    const lockpickItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'lockpick');
    if (!lockpickItem) {
      Notifications.add(plyId, 'Hoe ga je dit openen?', 'error');
      return;
    }

    Inventory.setQualityOfItem(lockpickItem.id, old => old - 5);
    handleStartRegister(plyId, storeId, register.idx, false);
  }
);

Events.onNet('storerobbery:registers:canceled', (plyId: number, storeId: Storerobbery.Id, registerIdx: number) => {
  const register = stateManager.getRegisterByIdx(registerIdx);

  const plyCoords = Util.getPlyCoords(plyId);
  if (register.storeId !== storeId || plyCoords.distance(register.coords) > 20) {
    Util.Log(
      'storerobbery:notInStore',
      { register },
      `${Util.getName(plyId)} tried to receive loot but was not in store`,
      plyId,
      true
    );
    Admin.ACBan(plyId, 'Storerobbery event without being in store');
    return;
  }

  stateManager.setCanRob(plyId, registerIdx, true);
});

Events.onNet('storerobbery:registers:rob', async (plyId: number, storeId: Storerobbery.Id, registerIdx: number) => {
  const register = stateManager.getRegisterByIdx(registerIdx);

  const plyCoords = Util.getPlyCoords(plyId);
  if (register.storeId !== storeId || plyCoords.distance(register.coords) > 20) {
    Util.Log(
      'storerobbery:notInStore',
      { register },
      `${Util.getName(plyId)} tried to receive loot but was not in store`,
      plyId,
      true
    );
    Admin.ACBan(plyId, 'Storerobbery event without being in store');
    return;
  }

  const [minRollAmount, maxRollAmount] = getConfig().register.rollAmount;
  let amount = Util.getRndInteger(minRollAmount, maxRollAmount + 1);
  const [minCash, maxCash] = getConfig().register.cashAmount;
  let cashAmount = Util.getRndInteger(minCash, maxCash);

  if (!Police.canDoActivity('storerobbery_register')) {
    amount = Math.max(1, Math.floor(amount / 2));
    cashAmount = Math.max(1, Math.floor(cashAmount / 2));
  }

  Inventory.addItemToPlayer(plyId, 'money_roll', amount);
  Financials.addCash(plyId, cashAmount, 'storerobbery-cashrobbedS');
});
