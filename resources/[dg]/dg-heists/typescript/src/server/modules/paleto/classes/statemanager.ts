import { EventListener, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  constructor() {
    super();
  }

  canHack = () => {
    return true;
  };

  finishedHack = () => {};
}

const stateManager = StateManager.getInstance();
export default stateManager;
