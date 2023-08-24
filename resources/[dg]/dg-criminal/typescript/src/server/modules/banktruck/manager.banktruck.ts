import {
  DGXEvent,
  EventListener,
  Inventory,
  LocalEvent,
  Notifications,
  Npcs,
  Phone,
  Police,
  RPCEvent,
  RPCRegister,
  Sounds,
  Taskbar,
  Util,
  Vehicles,
} from '@dgx/server';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { DEFAULT_BANKTRUCK_STATE, GUARD_MODELS, GUARD_WEAPONS } from './constants.banktruck';

@RPCRegister()
@EventListener()
class BanktruckManager {
  private readonly logger: winston.Logger;

  private inTimeout: boolean;

  private startScheduling: NodeJS.Timeout | null;
  private active: Criminal.Banktruck.Active | null;
  private guardThread: NodeJS.Timer | null;
  private openingTimeout: NodeJS.Timeout | null;

  constructor() {
    this.logger = mainLogger.child({ module: 'Banktrucks' });

    this.inTimeout = false;

    this.startScheduling = null;
    this.active = null;
    this.guardThread = null;
    this.openingTimeout = null;
  }

  public scheduleStart = () => {
    if (this.startScheduling) {
      clearTimeout(this.startScheduling);
    }

    this.startScheduling = setTimeout(this.start, config.banktruck.scheduleInterval * 60 * 1000);
  };

  public stopStartScheduling = () => {
    if (this.startScheduling === null) return;

    clearTimeout(this.startScheduling);
    this.startScheduling = null;
  };

  private start = async () => {
    if (
      this.inTimeout ||
      this.active !== null ||
      !Police.canDoActivity('banktruck') ||
      Math.random() > config.banktruck.startChance
    )
      return;

    this.stopStartScheduling();

    const locationIdx = Math.floor(Math.random() * config.banktruck.locations.length);
    const location = config.banktruck.locations[locationIdx];

    const spawnedVehicle = await Vehicles.spawnVehicle({
      model: 'stockade',
      position: location.vehicle,
      doorsLocked: true,
      upgrades: {
        primaryColor: 112, // white
      },
    });
    if (!spawnedVehicle) {
      this.logger.error('Failed to spawn vehicle');
      this.scheduleStart();
      return;
    }

    const [minBagAmount, maxBagAmount] = config.banktruck.loot.bagAmount;
    const bagAmount = Util.getRndInteger(minBagAmount, maxBagAmount + 1);

    this.active = {
      vehicle: spawnedVehicle.vehicle,
      locationIdx,
      state: { ...DEFAULT_BANKTRUCK_STATE },
      lootRemaining: bagAmount,
    };

    Vehicles.setVehicleCannotBeLockpicked(spawnedVehicle.vin, true, 'Dit slot is te sterk');
    Entity(spawnedVehicle.vehicle).state.set('banktruckAction', 'closed', true); // used for peek

    Phone.addMail(-1, {
      subject: '四五六七。 我的朋友在哪里？',
      sender: '周 刘',
      message: `我們有一些關於一些中國人從第六集團偷了一輛銀行卡車的
      信息 該位置與您手機上的這封郵件一起提供 請注意，
      因為您不會獨自一人在該地點。警衛全副武裝，會毫不猶豫地保護自己的東西`,
      coords: location.vehicle,
    });

    const logMsg = `Started banktruck activity`;
    this.logger.info(logMsg);
    Util.Log(
      'criminal:banktruck:start',
      {
        location: location.vehicle,
        vin: spawnedVehicle.vin,
        bagAmount,
      },
      logMsg
    );
  };

  public end = () => {
    if (this.active === null) return;

    if (this.active.vehicle && DoesEntityExist(this.active.vehicle)) {
      const veh = this.active.vehicle;
      const vehCoords = Util.getEntityCoords(veh);
      Util.awaitCondition(
        () => {
          return !DoesEntityExist(veh) || !Util.isAnyPedInRange(vehCoords, 150, true);
        },
        300 * 1000,
        5000
      ).then(() => {
        if (!DoesEntityExist(veh)) return;
        Vehicles.deleteVehicle(veh);
      });
    }

    if (this.guardThread) {
      clearInterval(this.guardThread);
      this.guardThread = null;
    }

    if (this.openingTimeout) {
      clearTimeout(this.openingTimeout);
      this.openingTimeout = null;
    }

    this.active = null;
    this.scheduleStart();

    setTimeout(
      () => {
        this.inTimeout = false;
      },
      config.banktruck.timeout * 60 * 1000
    );

    const logMsg = `Ended banktruck activity`;
    this.logger.info(logMsg);
    Util.Log('criminal:banktruck:end', {}, logMsg);
  };

  @LocalEvent('entityRemoved')
  private _handleEntityRemoval = (entity: number) => {
    if (this.active?.vehicle !== entity) return;
    this.end();
  };

  private startGuardThread = () => {
    if (!this.active || this.guardThread !== null || this.active.state.guardsSpawned) return;

    const guardLocations = config.banktruck.locations[this.active.locationIdx].guards;
    const idxOrder = [...Array(config.banktruck.amountOfGuards)].map(() =>
      Util.getRndInteger(0, guardLocations.length)
    );

    this.logger.debug('Starting guard interval');
    this.active.state.guardsSpawned = true;

    // we calculate total possible time activity takes (max hack time + opening delay + looting time) and divide it by amount of guards to get spawn interval
    const spawnInterval = Math.ceil(
      (config.banktruck.hack.time +
        config.banktruck.openingDelay +
        config.banktruck.loot.timePerBag * this.active.lootRemaining) /
        config.banktruck.amountOfGuards
    );

    this.guardThread = setInterval(() => {
      const idx = idxOrder.pop();

      Npcs.spawnGuard({
        model: GUARD_MODELS[Math.floor(Math.random() * GUARD_MODELS.length)],
        weapon: GUARD_WEAPONS[Math.floor(Math.random() * GUARD_WEAPONS.length)],
        position: guardLocations[idx ?? 0],
        deleteTime: {
          dead: 5,
          alive: 300,
        },
      });

      this.logger.debug(`Spawned guard`);

      if (idxOrder.length === 0) {
        if (this.guardThread) {
          clearInterval(this.guardThread);
          this.guardThread = null;
          this.logger.debug(`Stopped guard interval`);
        }
      }
    }, spawnInterval * 1000);
  };

  @RPCEvent('criminal:banktruck:startHacking')
  private _startHacking = async (
    plyId: number,
    netId: number
  ): Promise<Criminal.Banktruck.Config['hack'] | undefined> => {
    if (!this.active) return;
    if (this.active.state.open || this.active.state.opening || this.active.state.hackingPlayer !== null) return;

    const hasLaptop = await Inventory.doesPlayerHaveItems(plyId, 'laptop');
    if (!hasLaptop) {
      Notifications.add(plyId, 'Je hebt geen laptop bij je om de hack te starten', 'error');
      return;
    }

    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    if (this.active?.vehicle !== vehicle) return;

    this.active.state.hackingPlayer = plyId;
    FreezeEntityPosition(this.active.vehicle, true);
    this.startGuardThread();

    return config.banktruck.hack;
  };

  @DGXEvent('criminal:banktruck:finishHacking')
  private _finishHacking = (plyId: number, success: boolean) => {
    if (!this.active) return;
    if (this.active.state.hackingPlayer !== plyId) return;

    this.active.state.hackingPlayer = null;

    const logMsg = `${Util.getName(plyId)}(${plyId}) has finished banktruck hack | Success: ${success}`;
    this.logger.info(logMsg);
    Util.Log('criminal:banktruck:hack', { success }, logMsg, plyId);

    if (!success) return;

    this.active.state.opening = true;

    Entity(this.active.vehicle).state.set('banktruckAction', null, true); // disable peek actions
    Phone.addMail(plyId, {
      sender: 'Hackermans',
      subject: 'Hack',
      message: `Geef me even om de deuren te ontgrendelen`,
    });

    this.openingTimeout = setTimeout(
      () => {
        if (!this.active) return;

        this.openingTimeout = null;
        this.active.state.opening = false;
        this.active.state.open = true;
        Vehicles.setVehicleDoorOpen(this.active.vehicle, 2, true);
        Vehicles.setVehicleDoorOpen(this.active.vehicle, 3, true);
        Sounds.playSuccessSoundFromCoord(Util.getEntityCoords(this.active.vehicle), true);

        Entity(this.active.vehicle).state.set('banktruckAction', 'opened', true); // used for peek
      },
      Util.isDevEnv() ? 1000 : config.banktruck.openingDelay * 1000
    );
  };

  @DGXEvent('criminal:banktruck:startLooting')
  private _startLooting = async (plyId: number, netId: number) => {
    if (!this.active) return;
    if (!this.active.state.open) return;

    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;
    if (this.active?.vehicle !== vehicle) return;

    if (this.active.lootRemaining <= 0) {
      Notifications.add(plyId, 'Hier is niks meer', 'error');
      return;
    }

    if (this.active.state.looting) {
      Notifications.add(plyId, 'Iemand is hier al mee bezig', 'error');
      return;
    }

    this.active.state.looting = true;

    const itemThread = setInterval(() => {
      if (!this.active || this.active.lootRemaining <= 0) {
        clearInterval(itemThread);
        return;
      }
      Inventory.addItemToPlayer(plyId, 'marked_bills', 1);
      this.active.lootRemaining--;
    }, config.banktruck.loot.timePerBag * 1000);

    await Taskbar.create(
      plyId,
      'sack-dollar',
      'Beroven',
      (this.active.lootRemaining + 1) * config.banktruck.loot.timePerBag * 1000,
      {
        canCancel: true,
        cancelOnDeath: true,
        cancelOnMove: true,
        disableInventory: true,
        disablePeek: true,
        controlDisables: {
          movement: true,
          carMovement: true,
          combat: true,
        },
        animation: {
          animDict: 'missexile3',
          anim: 'ex03_dingy_search_case_a_michael',
          flags: 1,
        },
      }
    );

    this.active.state.looting = false;
    clearInterval(itemThread);

    if (this.active.lootRemaining > 0) return;

    Entity(this.active.vehicle).state.set('banktruckAction', null, true); // disable peek actions
    this.end();
  };

  public handlePlayerLeft = (plyId: number) => {
    if (this.active?.state.hackingPlayer === plyId) {
      this.active.state.hackingPlayer = null;
    }
  };

  public handleResourceStop = () => {
    if (!this.active) return;

    Vehicles.deleteVehicle(this.active.vehicle);
  };
}

const banktruckManager = new BanktruckManager();
export default banktruckManager;
