import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';
import doorStateManager from 'controllers/classes/doorstatemanager';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private powerLocation: Vec3;
  private powerDisabled = false;
  private robbedBanks: Set<Fleeca.Id> = new Set();
  private allPowerLocations: Vec3[];

  setConfig = (powerLocations: Vec3[], ids: Fleeca.Id[]) => {
    this.allPowerLocations = powerLocations;
    this.chooseNewPowerLocation()
    doorStateManager.registerDoors(...ids);
  }

  private chooseNewPowerLocation = () => {
    this.powerLocation = this.allPowerLocations[Math.floor(Math.random() * this.allPowerLocations.length)];
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
    setTimeout(this.chooseNewPowerLocation, 45 * 60 * 1000);
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
