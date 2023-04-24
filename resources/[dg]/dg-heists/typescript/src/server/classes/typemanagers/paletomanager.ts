import {
  DoorLock,
  Financials,
  Inventory,
  Jobs,
  Minigames,
  Notifications,
  Particles,
  Phone,
  Police,
  Sounds,
  Taskbar,
  Util,
} from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/decorators';
import heistManager from 'classes/heistmanager';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

const ACTION_TO_DOOR: Record<string, string> = {
  keypad_one: 'heist_paleto_side_entrance',
  keypad_two: 'heist_paleto_back_entrance',
  emp: 'heist_paleto_cameraroom',
};

@EventListener()
export class PaletoManager implements Heists.TypeManager {
  private readonly logger: winston.Logger;

  private currentCode: string | null;
  private lockdownTimeoutActive: boolean;
  private inLockdown: boolean;
  private actionsDone: Record<string, boolean>;

  private canHackSafe: boolean;

  constructor() {
    this.logger = mainLogger.child({ module: 'Paleto' });
    this.currentCode = null;
    this.lockdownTimeoutActive = false;
    this.inLockdown = false;
    this.actionsDone = {};
    this.canHackSafe = true;
  }

  public initialize = () => {
    this.resetActionsDone();
    this.logger.info(`Loaded`);
  };

  private generateCode = () => {
    return String(Util.getRndInteger(0, 10000)).padStart(4, '0');
  };

  private isActionDone = (action: string) => {
    return (this.actionsDone[action] ??= false);
  };

  private setActionDone = (action: string) => {
    if (!(action in this.actionsDone)) {
      this.logger.error(`tried to set unknown action '${action}' as done`);
      return;
    }

    this.actionsDone[action] = true;

    // if action has door linked, open it
    const doorName = ACTION_TO_DOOR[action];
    if (doorName) {
      DoorLock.changeDoorState(doorName, false);
    }
  };

  private resetActionsDone = () => {
    for (const action of config.paleto.actions) {
      if (action.standaloneAction) continue;
      this.actionsDone[action.id] = false;
    }
  };

  private isDone = () => {
    return heistManager.isLocationDone('paleto');
  };

  @DGXEvent('heists:paleto:buyCodes')
  private _buyCodes = async (plyId: number) => {
    if (this.currentCode !== null || this.inLockdown || this.isDone()) {
      Notifications.add(plyId, 'Ik heb niks meer', 'error');
      return;
    }

    if (!Police.canDoActivity('heist_paleto')) return;

    const codeConfig = config.paleto.code;
    const removedCrypto = await Financials.cryptoRemove(plyId, 'Manera', codeConfig.price);
    if (!removedCrypto) {
      Notifications.add(plyId, 'Je ontbreekt iets', 'error');
      return;
    }

    this.currentCode = this.generateCode();
    Inventory.addItemToPlayer(plyId, 'paper_note', 1, { tekst: this.currentCode });

    setTimeout(() => {
      this.resetCodes();
      Phone.sendMail(plyId, 'Codes', 'Pol Etto', `Ik kreeg van een contact te horen dat de codes zijn gereset`);
    }, codeConfig.resetTime * 60 * 1000);

    Phone.sendMail(
      plyId,
      'Codes',
      'Pol Etto',
      `De codes worden na ${codeConfig.resetTime} minuten gereset.<br><br>Na het ingeven heb je maar ${codeConfig.lockdownTime} minuten voordat het gebouw in lockdown gaat.`
    );

    const logMsg = `${Util.getName(plyId)}(${plyId}) has bought codes (${this.currentCode})`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:boughtCodes', { code: this.currentCode }, logMsg, plyId);
  };

  private resetCodes = () => {
    this.currentCode = null;

    const logMsg = `Codes have been reset`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:resetCodes', {}, logMsg);
  };

  @DGXEvent('heists:paleto:enterCode')
  private _enterCode = async (plyId: number, keypadId: string) => {
    if (this.isActionDone(keypadId)) {
      Notifications.add(plyId, 'Deur is al open', 'error');
      return;
    }

    if (this.inLockdown) {
      Notifications.add(plyId, 'Gebouw in lockdown', 'error');
      return;
    }

    const keypadCoords = config.paleto.actions.find(z => z.id === keypadId)?.coords;
    if (!keypadCoords) return;

    const keypadSuccess = await Minigames.keypad(plyId, {
      solution: this.currentCode ?? '', // we catch if no code active after input finish
    });

    const success = this.currentCode !== null && keypadSuccess;
    Sounds.playSuccessSoundFromCoord(keypadCoords, success);

    if (!success) return;

    this.setActionDone(keypadId);

    // start lockdown timer
    if (!this.lockdownTimeoutActive) {
      Police.createDispatchCall({
        tag: '10-90',
        title: 'Paleto Bank Stilalarm',
        description:
          'Stil alarm is afgegaan nadat een onbevoegde persoon de priveruimtes van de Paleto Bank heeft betreden',
        blip: {
          sprite: 619,
          color: 1,
        },
        coords: Util.getPlyCoords(plyId),
        skipCoordsRandomization: true,
        entries: {
          'camera-cctv': config.locations.paleto.cams.join(', '),
        },
        important: true,
      });

      this.lockdownTimeoutActive = true;
      setTimeout(() => {
        this.lockdownTimeoutActive = false;
        this.inLockdown = true;
      }, config.paleto.code.lockdownTime * 60 * 1000);
    }

    const logMsg = `${Util.getName(plyId)}(${plyId}) has succesfully entered code for ${keypadId}`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:keypadSuccess', { keypadId }, logMsg, plyId);
  };

  @DGXEvent('heists:paleto:emp')
  private _empElectronics = async (plyId: number) => {
    if (this.isActionDone('emp')) {
      Notifications.add(plyId, 'Dit staat al uit', 'error');
      return;
    }

    if (this.inLockdown) {
      Notifications.add(plyId, 'Gebouw in lockdown', 'error');
      return;
    }

    // keypad_one must be done as that opens the door to access this action
    if (!this.isActionDone('keypad_one')) return;

    const empCoords = config.paleto.actions.find(z => z.id === 'emp')?.coords;
    if (!empCoords) return;

    const empRemoved = await Inventory.removeItemByNameFromPlayer(plyId, 'mini_emp');
    if (!empRemoved) return;

    const empConfig = config.paleto.emp;
    const hackSuccess = await Minigames.sequencegame(plyId, empConfig.gridSize, empConfig.length, empConfig.time);
    if (!hackSuccess) return;

    const plyCoords = Util.getPlyCoords(plyId);
    const heading = Util.getHeadingToFaceCoordsFromCoord(empCoords, plyCoords);
    Particles.add(plyId, {
      dict: 'core',
      name: 'ent_sht_electrical_box',
      looped: false,
      coords: empCoords,
      rotation: { x: 0, y: 0, z: heading },
    });

    this.setActionDone('emp');

    const logMsg = `${Util.getName(plyId)}(${plyId}) has emped electronics`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:emp', {}, logMsg, plyId);
  };

  @DGXEvent('heists:paleto:hackSafe')
  private _hackSafeForKey = async (plyId: number) => {
    if (!this.canHackSafe) {
      Notifications.add(plyId, 'Kluis is al open', 'error');
      return;
    }

    const itemRemoved = await Inventory.removeItemByNameFromPlayer(plyId, 'decoding_tool');
    if (!itemRemoved) return;

    const hackSuccess = await Minigames.keygameCustom(
      plyId,
      [...new Array(5)].map((_, i) => ({ speed: (i + 1) * 2, size: 15 }))
    );
    if (!hackSuccess) return;

    this.canHackSafe = false;
    setTimeout(() => {
      this.canHackSafe = true;
    }, config.paleto.safeDelay * 60 * 1000);

    Inventory.addItemToPlayer(plyId, 'heist_paleto_key', 1);

    const logMsg = `${Util.getName(plyId)}(${plyId}) has hacked safe for paleto key`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:hackedSafe', {}, logMsg, plyId);
  };

  @DGXEvent('heists:paleto:unlock')
  private _unlockWithKey = async (plyId: number) => {
    if (this.isActionDone('unlock')) {
      Notifications.add(plyId, 'Apparatuur staat al aan', 'error');
      return;
    }

    if (this.inLockdown) {
      Notifications.add(plyId, 'Gebouw in lockdown', 'error');
      return;
    }

    // keypad_two must be done as that opens the door to access this action
    if (!this.isActionDone('keypad_two')) return;

    const [canceled] = await Taskbar.create(plyId, 'key', 'Aanzetten', 3000, {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disablePeek: true,
      controlDisables: {
        movement: true,
        carMovement: true,
        combat: true,
      },
    });
    if (canceled) return;

    const itemRemoved = await Inventory.removeItemByNameFromPlayer(plyId, 'heist_paleto_key');
    if (!itemRemoved) return;

    this.setActionDone('unlock');

    const logMsg = `${Util.getName(plyId)}(${plyId}) has unlocked heist using key`;
    this.logger.info(logMsg);
    Util.Log('heists:paleto:unlock', {}, logMsg, plyId);
  };

  public canHack = () => {
    console.log({ done: this.isDone(), actions: this.actionsDone });
    return !this.isDone() && Object.values(this.actionsDone).every(v => v);
  };
}
