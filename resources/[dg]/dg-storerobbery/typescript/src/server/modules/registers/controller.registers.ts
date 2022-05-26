import { Events, RPC, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import stateManager from 'classes/StateManager';

Events.onNet('storerobbery:server:robRegister', (src: number, register: Vector3) => {
  const Player = DGCore.Functions.GetPlayer(src);
  const amount = Util.getRndInteger(1, 4);
  Player.Functions.AddItem('moneyroll', amount);
  emitNet('inventory:client:ItemBox', src, 'moneyroll', amount);

  stateManager.setRegisterAsRobbed(register);
});
