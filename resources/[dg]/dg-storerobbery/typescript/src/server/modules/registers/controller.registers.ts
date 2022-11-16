import { Events, Inventory, RPC, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';
import { mainLogger } from 'sv_logger';

Events.onNet('storerobbery:server:robRegister', async (src: number, register: Vector3) => {
  const isInStore = await RPC.execute<boolean>('storerobbery:client:isInStore', src);
  if (!isInStore) {
    mainLogger.warn(`Player ${src} tried to receive loot but was not in store`);
    Util.Log(
      'storerobbery:notInStore',
      { register },
      `${Util.getName(src)} tried to receive loot but was not in store`,
      src,
      true
    );
    return;
  }

  const [min, max] = (await getConfig()).register.rollAmount;
  const amount = Util.getRndInteger(min, max);
  Inventory.addItemToPlayer(src, 'money_roll', amount);

  stateManager.setRegisterAsRobbed(register);
  mainLogger.info(`Player ${src} has robbed a register and received ${amount} moneyrolls`);
  Util.Log(
    'storerobbery:robbedRegister',
    { amount, register },
    `${Util.getName(src)} has robbed a register and received ${amount} moneyrolls`,
    src
  );
});
