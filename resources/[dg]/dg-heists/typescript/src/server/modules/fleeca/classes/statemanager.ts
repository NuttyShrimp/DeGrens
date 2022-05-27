import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';
import doorStateManager from 'controllers/classes/doorstatemanager';
import { FLEECA_IDS, POWER_LOCATIONS } from '../constants.fleeca';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private powerLocation: Vec3;
  private powerDisabled = false;
  private robbedBanks: Set<Fleeca.Id> = new Set();

  constructor() {
    super();
    this.powerLocation = POWER_LOCATIONS[Math.floor(Math.random() * POWER_LOCATIONS.length)];
    console.log(this.powerLocation);
    doorStateManager.registerDoors(...FLEECA_IDS);
  }

  @RPCEvent('heists:server:fleeca:getPowerLocation')
  getPowerLocation = () => {
    return this.powerLocation;
  };

  @DGXEvent('heists:server:fleeca:disablePower')
  private _disablePower = () => {
    this.powerDisabled = true;
    this.powerLocation = null;
  };

  canHack = (fleecaId: Fleeca.Id) => {
    return this.powerDisabled && !this.robbedBanks.has(fleecaId);
  };

  finishedHack = (fleecaId: Fleeca.Id) => {
    this.powerDisabled = false;
    if (!this.robbedBanks.has(fleecaId)) {
      this.robbedBanks.add(fleecaId);
    }
    setTimeout(() => {
      this.powerLocation = POWER_LOCATIONS[Math.floor(Math.random() * POWER_LOCATIONS.length)];
    }, 40 * 60 * 1000);
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
