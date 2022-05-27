import { Events } from '@dgx/server';
import { EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';

@RPCRegister()
@EventListener()
class DoorStateManager extends Util.Singleton<DoorStateManager>() {
  private doorStates: Record<string, boolean> = {};

  registerDoors = (...heistIds: Heist.Id[]) => {
    heistIds.forEach(id => {
      this.doorStates[id] = false;
    });
  };

  @RPCEvent('heists:server:getDoorState')
  getDoorState = (_src: number, heistId: Heist.Id) => {
    return this.doorStates[heistId];
  };

  setDoorState = (heistId: Heist.Id, state: boolean) => {
    this.doorStates[heistId] = state;
    Events.emitNet('heists:client:setDoorState', -1, heistId, state);
  };
}

const doorStateManager = DoorStateManager.getInstance();
export default doorStateManager;
