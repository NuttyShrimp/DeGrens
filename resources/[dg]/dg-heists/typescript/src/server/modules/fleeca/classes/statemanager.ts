import { Admin, Config, Police, Util } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import doorStateManager from 'controllers/classes/doorstatemanager';
import { getCamForId, getIdForType, getLabelForId } from 'services/metadata';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() implements Heist.StateManager {
  private config: Fleeca.Config = { power: [] };
  private powerLocation: Vec3 | null = null;
  private powerDisabled = false;
  private robbedBanks: Set<Fleeca.Id> = new Set();
  private bankHackers: Map<Fleeca.Id, number> = new Map();
  private callTimeouts: Map<Fleeca.Id, NodeJS.Timeout> = new Map();
  private reenablePowerTimeout: NodeJS.Timeout | null = null;

  setConfig = (config: Fleeca.Config) => {
    this.config = config;
    this.chooseNewPowerLocation();
    doorStateManager.registerDoors(...getIdForType('fleeca'));
  };

  private chooseNewPowerLocation = () => {
    this.powerLocation = this.config.power[Math.floor(Math.random() * this.config.power.length)];
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

    // reenable after 20 min
    this.reenablePowerTimeout = setTimeout(() => {
      this.chooseNewPowerLocation();
      this.reenablePowerTimeout = null;
      this.powerDisabled = false;
    }, 20 * 60 * 1000);
  };

  canHack = (src: number, fleecaId: Fleeca.Id) => {
    return this.powerDisabled && !this.robbedBanks.has(fleecaId) && !this.bankHackers.get(fleecaId);
  };

  startHack = (src: number, fleecaId: Fleeca.Id) => {
    if (this.bankHackers.get(fleecaId)) return;
    if (!this.callTimeouts.get(fleecaId)) {
      const door = Config.getConfigValue<Heist.Door>(`heists.doors.${fleecaId}`);
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
          'building-columns': getLabelForId(fleecaId),
          'camera-cctv': getCamForId(fleecaId),
        },
      });
      this.callTimeouts.set(
        fleecaId,
        setTimeout(() => {
          if (!this.callTimeouts.get(fleecaId)) return;
          this.callTimeouts.delete(fleecaId);
        })
      );
    }
    this.bankHackers.set(fleecaId, src);
  };

  failedHack(src: number, heistId: Fleeca.Id) {
    if (!this.powerDisabled) {
      Admin.ACBan(src, `Tried finishing bank without initiating process`);
    }
    if (this.robbedBanks.has(heistId) && !this.bankHackers.get(heistId)) {
      Admin.ACBan(src, `Tried finishing bank without initiating process`);
    }
    this.bankHackers.delete(heistId);
  }

  finishedHack = (src: number, fleecaId: Fleeca.Id) => {
    if (!this.bankHackers.get(fleecaId) || this.bankHackers.get(fleecaId) !== src) {
      Admin.ACBan(src, `Tried finishing bank without initiating process`);
    }
    this.powerDisabled = false;
    if (!this.robbedBanks.has(fleecaId)) {
      this.robbedBanks.add(fleecaId);
    }
    this.bankHackers.delete(fleecaId);

    if (this.reenablePowerTimeout) {
      clearTimeout(this.reenablePowerTimeout);
    }

    setTimeout(this.chooseNewPowerLocation, 45 * 60 * 1000);

    return true;
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
