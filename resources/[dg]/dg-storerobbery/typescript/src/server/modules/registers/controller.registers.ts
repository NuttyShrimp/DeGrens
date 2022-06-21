import { Events, RPC, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import stateManager from 'classes/StateManager';
import { getConfig } from 'helpers/config';

Events.onNet('storerobbery:server:robRegister', async (src: number, register: Vector3) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const [min, max] = (await getConfig()).register.rollAmount
  const amount = Util.getRndInteger(min, max);
  Player.Functions.AddItem('moneyroll', amount);
  emitNet('inventory:client:ItemBox', src, 'moneyroll', amount);

  stateManager.setRegisterAsRobbed(register);
});
