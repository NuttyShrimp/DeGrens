import { EventListener, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() implements Heist.StateManager {
  constructor() {
    super();
  }

  canHack = () => {
    return true;
  };

  startHack = () => {
    return true;
  };

  failedHack(src: number, heistId: Heist.Id) {}

  finishedHack = () => {
    return true;
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
