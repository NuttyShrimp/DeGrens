import {
  Financials,
  Inventory,
  Jobs,
  Notifications,
  Phone,
  SyncedObjects,
  Taskbar,
  Util,
  Minigames,
  DoorLock,
  Sounds,
  Events,
  Police,
} from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import heistManager from 'classes/heistmanager';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

@RPCRegister()
@EventListener()
export class JewelryManager implements Heists.TypeManager {
  private readonly logger: winston.Logger;

  private laptopLocation: Vec4 | null;

  private inTimeout: boolean;

  private awaitingEmptyLocation: boolean;
  private emptyLocationTimeout: NodeJS.Timeout | null;

  private pinCode!: string;
  private readonly lootedVitrines: Map<number, number>; // vitrineId -> plyId who looted

  private readonly state: Jewelry.State;
  private readonly actions: Jewelry.Actions;

  private cachedDoorLocation: Vec3 | null;

  constructor() {
    this.logger = mainLogger.child({ module: 'Jewelry' });

    this.laptopLocation = null;

    this.inTimeout = false;

    this.awaitingEmptyLocation = false;
    this.emptyLocationTimeout = null;

    this.generatePinCode();
    this.lootedVitrines = new Map();

    this.cachedDoorLocation = null;

    this.state = {
      doorOpen: false,
      alarmOverridden: false,
    };

    this.actions = {
      laptopHack: false,
      overridingAlarm: false,
    };
  }

  public initialize = () => {
    this.spawnLaptop();

    heistManager.onLocationEnter((locationId, plyId) => {
      if (locationId !== 'jewelry') return;
      this.handleJewelryEnter(plyId);
    });

    heistManager.onLocationLeave(locationId => {
      if (locationId !== 'jewelry') return;
      this.handleJewelryLeave();
    });

    this.logger.info(`Loaded`);
  };

  public getInitData = (): Jewelry.InitData => {
    return {
      vitrines: config.jewelry.vitrines,
      alarmEnabled: this.isAlarmAudible(),
    };
  };

  private spawnLaptop = () => {
    const locationIdx =
      Util.isDevEnv() && false ? 0 : Math.floor(Math.random() * config.jewelry.laptopLocations.length);
    this.laptopLocation = config.jewelry.laptopLocations[locationIdx];

    SyncedObjects.add({
      model: 'xm_prop_x17_laptop_lester_01',
      coords: this.laptopLocation,
      rotation: { x: 0, y: 0, z: this.laptopLocation.w },
      flags: {
        isJewelryLaptop: true,
      },
      skipStore: true,
    });
  };

  private sendMail = (plyId: number, message: string, coords?: Vec3) => {
    Phone.addMail(plyId, {
      subject: 'Angelico Juwelier',
      sender: 'Angelo J.',
      message,
      coords,
    });
  };

  private log = (
    plyId: number | undefined,
    type: 'info' | 'warn' | 'debug' | 'silly' | 'error',
    logType: string,
    message: string,
    data: Record<string, any> = {},
    important?: boolean
  ) => {
    const logMsg = `${plyId ? `${Util.getName(plyId)}(${plyId}) ` : ''}${message}`;
    this.logger[type](logMsg);
    Util.Log(`heists:jewelry:${logType}`, data, logMsg, plyId, important);
  };

  private dispatchAlert = (title: string, description: string, important = false) => {
    const locationData = config.locations['jewelry'];
    Police.createDispatchCall({
      title,
      description,
      blip: {
        sprite: 617,
        color: 1,
      },
      coords: { ...locationData.zone.points[0], z: 0 },
      entries: {
        'camera-cctv': locationData.cams.join(', '),
      },
      tag: '10-90',
    });
  };

  private generatePinCode = () => {
    this.pinCode = String(Util.getRndInteger(0, 10000)).padStart(4, '0');
  };

  private setDoor = (open: boolean) => {
    if (this.state.doorOpen === open) return;
    this.state.doorOpen = open;
    DoorLock.changeDoorState('jewelry_entrance', !open);

    if (!this.cachedDoorLocation) {
      this.cachedDoorLocation = DoorLock.getDoorCoordsByName('jewelry_entrance');
    }

    Sounds.playSuccessSoundFromCoord(this.cachedDoorLocation, open);
  };

  private isActionBusy = (action: keyof Jewelry.Actions) => {
    return this.actions[action];
  };

  private setActionBusy = (action: keyof Jewelry.Actions, busy: boolean) => {
    this.actions[action] = busy;
  };

  @DGXEvent('heists:jewelry:buyCard')
  private _buyCard = async (plyId: number) => {
    const price = config.jewelry.prices.card;
    const paid = await Financials.cryptoRemove(plyId, 'Manera', price);
    if (!paid) {
      Notifications.add(plyId, `Je hebt niet genoeg om me te betalen`, 'error');
      return;
    }

    Inventory.addItemToPlayer(plyId, 'jewelry_sd_card', 1);

    this.log(plyId, 'silly', 'boughtCard', `has bought jewelry sd card for ${price} crypto`);
  };

  @DGXEvent('heists:jewelry:buyInfo')
  private _buyInfo = async (plyId: number) => {
    if (!this.laptopLocation) {
      this.logger.error(`Laptop location was not initialized`);
      return;
    }

    if (Jobs.getCurrentJob(plyId)) {
      Notifications.add(plyId, 'Ik vertrouw je niet!', 'error');
      return;
    }

    if (!Police.canDoActivity('heist_jewelry') || this.inTimeout) {
      Notifications.add(plyId, 'Ik kan je nog niet genoeg info geven', 'error');
      return;
    }

    const price = config.jewelry.prices.info;
    const paid = await Financials.cryptoRemove(plyId, 'Manera', price);
    if (!paid) {
      Notifications.add(plyId, `Je hebt niet genoeg om me te betalen`, 'error');
      return;
    }

    this.sendMail(
      plyId,
      'De locatie van de laptop zit bij dit bericht.<br>Er is een grote kans dat de deur binnen op slot zal zijn. Bereid je voor!',
      this.laptopLocation
    );

    this.log(plyId, 'silly', 'boughtInfo', `has bought jewelry info for ${price} crypto`, {
      laptopLocation: this.laptopLocation,
    });
  };

  @DGXEvent('heists:jewelry:useCard')
  private _useCard = async (plyId: number) => {
    if (!this.laptopLocation) {
      this.logger.error(`Laptop location was not initialized`);
      return;
    }

    if (this.inTimeout) {
      Notifications.add(plyId, 'De laptop staat momenteel uit', 'error');
      return;
    }

    if (this.lootedVitrines.size === 0) {
      if (!Police.canDoActivity('heist_jewelry') || heistManager.isGlobalTimeoutActive()) {
        Notifications.add(plyId, 'De laptop staat momenteel uit', 'error');
        return;
      }
    } else {
      if (!this.state.alarmOverridden) {
        Notifications.add(plyId, 'Het alarm van de juwelier staat nog aan', 'error');
        return;
      }
    }

    const dist = Util.getPlyCoords(plyId).distance(this.laptopLocation);
    if (dist > 10) {
      Notifications.add(plyId, `Je bent niet bij de laptop`, 'error');
      return;
    }

    if (this.isActionBusy('laptopHack')) {
      Notifications.add(plyId, `Er is al iemand deze op deze laptop bezig`, 'error');
      return;
    }

    if (this.state.doorOpen) {
      Notifications.add(plyId, `De laptop is de vorige lezing nog aan het verwerken`, 'error');
      return;
    }

    this.setActionBusy('laptopHack', true);

    const [canceled] = await Taskbar.create(plyId, 'sd-card', 'Uitlezen...', 5000, {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disableInventory: true,
      disablePeek: true,
      disarm: true,
      controlDisables: {
        movement: true,
        carMovement: true,
        combat: true,
      },
      animation: {
        animDict: 'anim@heists@prison_heiststation@cop_reactions',
        anim: 'cop_b_idle',
        flags: 16,
      },
    });
    if (canceled) {
      this.setActionBusy('laptopHack', false);
      return;
    }

    const removed = await Inventory.removeItemByNameFromPlayer(plyId, 'jewelry_sd_card');
    if (!removed) {
      this.setActionBusy('laptopHack', false);
      Notifications.add(plyId, 'Je mist iets', 'error');
      return;
    }

    const hackConfig = config.jewelry.hack;
    const success = await Minigames.ordergame(
      plyId,
      hackConfig.gridSize,
      hackConfig.amount,
      hackConfig.length,
      hackConfig.displayTime,
      hackConfig.inputTime
    );
    this.setActionBusy('laptopHack', false);
    if (!success) return;

    this.setDoor(true);

    this.dispatchAlert(
      'Storing Deuren Juwelier',
      'Automatische melding dat er zich een storing heeft voorgedaan bij de deuren van de Angelico Juwelier.'
    );

    if (this.state.alarmOverridden) {
      this.awaitingEmptyLocation = true;
      this.log(plyId, 'info', 'hackedLaptop', `has opened jewelry doors when alarm was overridden`);
      return;
    }

    this.sendMail(plyId, `De code die je nodig zal hebben is '${this.pinCode}'`);

    const doorOpenTime = config.jewelry.doorOpenTime;
    setTimeout(() => {
      this.setDoor(false);
    }, doorOpenTime * 1000);
    this.log(plyId, 'info', 'hackedLaptop', `has opened jewelry doors for ${doorOpenTime} seconds`);
  };

  @RPCEvent('heists:jewelry:startLootingVitrine')
  private _startLootingVitrine = (plyId: number, vitrineId: number) => {
    if (this.inTimeout || this.lootedVitrines.has(vitrineId)) return false;

    if (
      this.lootedVitrines.size === 0 &&
      (!Police.canDoActivity('heist_jewelry') || heistManager.isGlobalTimeoutActive())
    )
      return false;

    this.lootedVitrines.set(vitrineId, plyId);

    // on first vitrine start alarm, dispatch notif & global timeout
    if (this.lootedVitrines.size === 1) {
      this.dispatchAlarmToClients();
      heistManager.startGlobalTimeout();

      this.dispatchAlert(
        'Angelico Juwelier Overval',
        'Meerdere meldingen van een gewapende overval op de Angelico Juwelier.',
        true
      );
    }

    return true;
  };

  @DGXEvent('heists:jewelry:finishLootingVitrine')
  private _finishLootingVitrine = async (plyId: number, vitrineId: number) => {
    const plyWhoStartedLooting = this.lootedVitrines.get(vitrineId);
    if (plyWhoStartedLooting !== plyId) return false;

    const loot = config.jewelry.loot[Math.floor(Math.random() * config.jewelry.loot.length)];
    const [minAmount, maxAmount] = loot.amount;
    const amount = Util.getRndInteger(minAmount, maxAmount + 1);

    const [itemId] = await Inventory.addItemToPlayer(plyId, loot.itemName, amount);

    this.log(
      plyId,
      'debug',
      'lootedVitrine',
      `has looted jewelry vitrine ${vitrineId} for ${amount} ${loot.itemName}`,
      { itemId, amount, vitrineId }
    );
  };

  private isAlarmAudible = () => this.lootedVitrines.size > 0 && !this.state.alarmOverridden;

  private dispatchAlarmToClients = () => {
    const toggle = this.isAlarmAudible();
    Events.emitNet('heists:jewelry:toggleAlarm', -1, toggle);
  };

  @DGXEvent('heists:jewelry:overrideAlarm')
  private _overrideAlarm = async (plyId: number) => {
    if (this.lootedVitrines.size === 0 || this.state.alarmOverridden) {
      Notifications.add(plyId, 'Het alarm staat niet aan', 'error');
      return;
    }

    if (this.isActionBusy('overridingAlarm')) {
      Notifications.add(plyId, 'Dit wordt momenteel al uitgeschakeld', 'error');
      return;
    }

    this.setActionBusy('overridingAlarm', true);

    const success = await Minigames.keypad(plyId, { solution: this.pinCode });
    Sounds.playSuccessSoundFromCoord(Util.getPlyCoords(plyId), success);

    if (!success) {
      this.setActionBusy('overridingAlarm', false);
      return;
    }

    const timeout = config.jewelry.overrideDuration;
    this.sendMail(plyId, `Het zal ongeveer ${timeout} minuten duren om het alarm uit te schakelen`);

    setTimeout(() => {
      this.setActionBusy('overridingAlarm', false);
      this.state.alarmOverridden = true;
      this.dispatchAlarmToClients();
      this.sendMail(plyId, `Het alarm is uitgeschakeld`);
    }, timeout * 60 * 1000);

    this.log(plyId, 'info', 'overrideAlarm', `has overriden jewelry alarm system`);
  };

  @DGXEvent('heists:jewelry:resetScuff')
  private _resetScuff = (plyId: number) => {
    if (this.awaitingEmptyLocation || this.inTimeout || this.state.doorOpen) return;

    this.state.alarmOverridden = true;
    this.dispatchAlarmToClients();
    this.setDoor(true);
    this.awaitingEmptyLocation = true;
    this.log(plyId, 'warn', 'resetScuff', `has scuff reset jewelry heist`, {}, true);
  };

  private handleJewelryEnter = (plyId: number) => {
    Events.emitNet('heists:jewelry:smashVitrine', plyId, [...this.lootedVitrines.keys()]);

    if (this.emptyLocationTimeout) {
      clearTimeout(this.emptyLocationTimeout);
      this.emptyLocationTimeout = null;
    }
  };

  private handleJewelryLeave = () => {
    if (heistManager.getAmountOfPlayersInLocation('jewelry') > 0) return;
    if (!this.awaitingEmptyLocation) return;

    if (this.emptyLocationTimeout) clearTimeout(this.emptyLocationTimeout);

    const timeout = config.jewelry.emptyLocationRequirementTime;
    this.emptyLocationTimeout = setTimeout(() => {
      this.emptyLocationTimeout = null;
      this.startResetTimeout();
    }, timeout * 60 * 1000);
  };

  private startResetTimeout = () => {
    this.awaitingEmptyLocation = false;
    this.inTimeout = true;

    this.setDoor(false);

    // make sure alarm stops for everyone
    this.state.alarmOverridden = true;
    this.dispatchAlarmToClients();

    this.log(undefined, 'info', 'startReset', `All players have left jewelry, starting restart timeout`);

    setTimeout(() => {
      this.inTimeout = false;

      this.state.alarmOverridden = false;
      this.generatePinCode();
      this.lootedVitrines.clear();

      this.setActionBusy('laptopHack', false);
      this.setActionBusy('overridingAlarm', false);

      // relock thermiteable door
      DoorLock.changeDoorState('jewelry_office', true);

      this.log(undefined, 'info', 'reset', `Jewelry has been reset`);
    }, config.jewelry.resetTime * 60 * 1000);
  };

  @DGXEvent('heists:jewelry:smashVitrine')
  private _smashVitrine = (plyId: number, vitrineId: number) => {
    if (!this.lootedVitrines.has(vitrineId)) return;

    const playersAtLocations = heistManager.getPlayersAtLocation('jewelry');
    playersAtLocations.forEach(target => {
      Events.emitNet('heists:jewelry:smashVitrine', target, vitrineId);
    });
  };
}
