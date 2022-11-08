import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Config, Police, Util } from '@dgx/server';
import doorStateManager from 'controllers/classes/doorstatemanager';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() implements Heist.StateManager {
  private powerLocation: Vec3;
  private powerDisabled = false;
  private robbedBanks: Set<Fleeca.Id> = new Set();
  private allPowerLocations: Vec3[];

  setConfig = (powerLocations: Vec3[], ids: Fleeca.Id[]) => {
    this.allPowerLocations = powerLocations;
    this.chooseNewPowerLocation();
    doorStateManager.registerDoors(...ids);
  };

  private chooseNewPowerLocation = () => {
    this.powerLocation = this.allPowerLocations[Math.floor(Math.random() * this.allPowerLocations.length)];
  };

  @RPCEvent('heists:server:fleeca:getPowerLocation')
  getPowerLocation = () => {
    return this.powerLocation;
  };

  @DGXEvent('heists:server:fleeca:disablePower')
  private _disablePower = (src: number) => {
    this.powerDisabled = true;
    Util.Log(
      'heists:fleeca:power',
      {
        location: this.powerLocation,
      },
      `${GetPlayerName(String(src))} disabled the power`,
      src
    );
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
    const door = Config.getConfigValue<Heist.Door>(`heists.doors.${fleecaId}`);
    setTimeout(this.chooseNewPowerLocation, 45 * 60 * 1000);
    Police.createDispatchCall({
      tag: '10-90',
      title: 'Bank alarm: Overval',
      blip: {
        // sprite: 814,
        sprite: 618,
        color: 1,
      },
      coords: door.coords,
      entries: {
        // TODO: replace with actual label if config is cleaned up
        'building-columns': 'KUIS DE CONFIG Op',
      },
    });
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
