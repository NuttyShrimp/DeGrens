import { Police, Util, UI, Inventory } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { Vector3 } from '@dgx/shared';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

@RPCRegister()
@EventListener()
export class FleecaManager implements Heists.TypeManager {
  private readonly logger: winston.Logger;

  private powerLocation: Vec3 | null;
  private hackAvailable: boolean;

  private resetTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.logger = mainLogger.child({ module: 'Fleeca' });
    this.powerLocation = null;
    this.hackAvailable = false;
  }

  public initialize = () => {
    this.pickNewPowerLocation();
    this.logger.info(`Loaded`);
  };

  private pickNewPowerLocation = () => {
    const locations = config.fleeca.powerLocations;
    this.powerLocation = locations[Math.floor(Math.random() * locations.length)];
    this.logger.debug(`Picked new power location (${JSON.stringify(this.powerLocation)})`);
  };

  private getPowerLocationPercentage = (location: Vec3) => {
    if (this.powerLocation === null) return -1;
    if (!Police.canDoActivity('heist_fleeca')) return -1;

    const distance = Vector3.create(this.powerLocation).distance(location);
    if (distance < 2) return 100;

    const powerAmount = 100 - Math.max(0, Math.min(distance, 2000)) / 20;
    return Math.floor(powerAmount);
  };

  @DGXEvent('heists:fleeca:checkLocationPercentage')
  private _checkPowerLocationPercentage = (plyId: number, location: Vec3) => {
    const percentage = this.getPowerLocationPercentage(location);

    UI.openContextMenu(plyId, [
      {
        title: percentage === -1 ? 'Uitgeschakeld' : `Signaalsterkte:  ${percentage}%`,
        icon: 'bolt',
        disabled: true,
      },
    ]);

    const logMsg = `${Util.getName(plyId)}(${plyId}) has checked power for location`;
    this.logger.silly(logMsg);
    Util.Log(
      'heists:fleeca:checkPower',
      {
        location: this.powerLocation,
      },
      logMsg,
      plyId
    );
  };

  @RPCEvent('heists:fleeca:canDisableLocation')
  private _canDisablePowerLocation = (plyId: number, location: Vec3): Fleeca.CanDisable => {
    const percentage = this.getPowerLocationPercentage(location);

    switch (percentage) {
      case -1:
        return 'unfulfilledRequirements';
      case 100:
        return 'correctLocation';
      default:
        return 'incorrectLocation';
    }
  };

  @DGXEvent('heists:fleeca:disablePower')
  private _disablePowerLocation = (plyId: number, location: Vec3, hackSuccess: boolean) => {
    const percentage = this.getPowerLocationPercentage(location);
    if (percentage !== 100) return;

    Inventory.removeItemByNameFromPlayer(plyId, 'mini_emp');
    if (!hackSuccess) return;

    const logMsg = `${Util.getName(plyId)}(${plyId}) disabled the power`;
    this.logger.silly(logMsg);
    Util.Log(
      'heists:fleeca:disablePower',
      {
        location: this.powerLocation,
      },
      logMsg,
      plyId
    );

    this.hackAvailable = true;
    this.powerLocation = null;

    this.startResetPowerTimeout(config.fleeca.reenablePowerDelay);
  };

  public canHack = () => this.hackAvailable;

  public startedHack = () => {
    this.hackAvailable = false;
    this.logger.debug(`Started hack`);
  };

  public finishedHack = (success: boolean) => {
    this.logger.debug(`Finished hack | success: ${success}`);

    if (!success) {
      this.hackAvailable = true;
    } else {
      this.startResetPowerTimeout(45);
    }
  };

  private startResetPowerTimeout = (minutes: number) => {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    this.resetTimeout = setTimeout(() => {
      this.logger.info(`Power has been reset`);
      this.hackAvailable = false;
      this.pickNewPowerLocation();
      this.resetTimeout = null;
    }, minutes * 60 * 1000);
  };
}
