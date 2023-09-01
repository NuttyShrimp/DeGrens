import {
  DoorLock,
  Events,
  Financials,
  Jobs,
  Minigames,
  Notifications,
  Npcs,
  Phone,
  Police,
  RPC,
  Util,
  Vehicles,
} from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import boostManager from './boostmanager';
import config, { getClassConfig, getLocationsForClass, tryClassChanceEntry } from 'helpers/config';
import { DEFAULT_CARBOOST_MAIL_DATA } from '../../shared/constants';
import contractManager from './contractmanager';

export default class Boost {
  private readonly logger: winston.Logger;
  public readonly id: string;
  private readonly owner: {
    cid: number;
    serverId: number | undefined;
  };
  public readonly groupId: string;
  public readonly vehicleClass: Vehicles.Class;
  private readonly vehicleModel: string;
  private readonly type: Carboosting.DropoffType;
  public readonly vehicleLocationIdx: number;
  private readonly radiusBlipLocation: Vec3; // save to always keep randomization
  private initialMembers: number[];

  private vehicle: Awaited<ReturnType<Vehicles.SpawnVehicleFunction>> | null;
  private tracker: {
    id: number;
    hacks: {
      done: number;
      total: number;
    };
    cooldown: {
      active: boolean;
      timeout: NodeJS.Timeout | null;
    };
  } | null;
  private guardThread: NodeJS.Timer | null;
  public dropoffLocationIdx: number | null;

  private flags: {
    zoneEntered: boolean;
    lockpicked: boolean;
    disablingTracker: boolean;
    droppedOff: boolean;
    finished: boolean;
  };

  private chances: Record<keyof Omit<Carboosting.ClassConfig['chances'], 'contract'>, boolean>;

  constructor(
    id: string,
    ownerServerId: number,
    ownerCid: number,
    groupId: string,
    vehicleClass: Vehicles.Class,
    vehicleModel: string,
    type: Carboosting.DropoffType
  ) {
    this.logger = mainLogger.child({ module: id });
    this.id = id;
    this.owner = {
      cid: ownerCid,
      serverId: ownerServerId,
    };
    this.groupId = groupId;
    this.vehicleClass = vehicleClass;
    this.vehicleModel = vehicleModel;
    this.type = type;
    this.vehicleLocationIdx = boostManager.getRandomVehicleLocationIdxForClass(vehicleClass);
    this.initialMembers = [];

    this.vehicle = null;
    this.tracker = null;
    this.guardThread = null;
    this.dropoffLocationIdx = null;

    this.flags = {
      zoneEntered: false,
      lockpicked: false,
      disablingTracker: false,
      droppedOff: false,
      finished: false,
    };

    // we preload these to be able to provide them along other data in startlog

    if (this.type === 'scratch') {
      this.chances = {
        tunes: false,
        guards: true,
        dispatch: true,
        tracker: true,
      };
    } else {
      const shouldDoDispatchAlert = tryClassChanceEntry(vehicleClass, 'dispatch');
      this.chances = {
        tunes: tryClassChanceEntry(vehicleClass, 'tunes'),
        guards: tryClassChanceEntry(vehicleClass, 'guards'),
        dispatch: shouldDoDispatchAlert,
        tracker: shouldDoDispatchAlert && tryClassChanceEntry(vehicleClass, 'tracker'), // never do tracker if no dispatch alert
      };
    }

    // Randomize radius blip location
    const vehicleLocation = this.getVehicleLocation().vehicle;
    const radiusBlipSize = this.getClassConfig().radiusBlipSize;
    this.radiusBlipLocation = {
      x: vehicleLocation.x + Util.getRndInteger(-radiusBlipSize / 2, radiusBlipSize / 2),
      y: vehicleLocation.y + Util.getRndInteger(-radiusBlipSize / 2, radiusBlipSize / 2),
      z: vehicleLocation.z,
    };
  }

  private log = (
    logName: string,
    logType: 'info' | 'warn' | 'error' | 'silly' | 'debug',
    message: string,
    data: Record<string, any> = {},
    devImportant = false
  ) => {
    this.logger[logType]?.(message);
    Util.Log(
      `carboosting:boost:${logName}`,
      {
        boostId: this.id,
        ...data,
      },
      `${message} | boostId: ${this.id}`,
      this.owner.serverId,
      devImportant
    );
  };

  public getOwnerCid = () => this.owner.cid;

  public clearOwnerServerId = () => {
    this.owner.serverId = undefined;
    this.logger.debug('cleared owner serverId');
  };

  private getGroup = (ignoreUndefined = false) => {
    const group = Jobs.getGroupById(this.groupId);
    if (!group && !ignoreUndefined) {
      this.log('noGroup', 'error', 'Could not find group', { groupId: this.groupId }, true);
      this.finish('Could not find group'); // Jobs.onGroupLeave should catch this, so we can safely assume if this happens, its bugged
      return;
    }
    return group;
  };

  private addMail = (plyId: number | undefined, message: string, coords?: Vec3) => {
    if (!plyId) return;
    Phone.addMail(plyId, {
      ...DEFAULT_CARBOOST_MAIL_DATA,
      message: message,
      coords,
    });
  };

  public start = async () => {
    if (!this.owner.serverId || !GetPlayerName(String(this.owner.serverId)))
      throw new Error('owner serverId is not set or player is not online when trying to start boost');

    const group = this.getGroup();
    if (!group) return;

    // if seats of model is less than 2, we force it to NOT have a tracker
    const numberOfSeats = await RPC.execute<number>(
      'vehicles:getNumberOfSeats',
      this.owner.serverId,
      this.vehicleModel
    );
    if (!!numberOfSeats && numberOfSeats < 2) {
      this.chances.tracker = false;
    }

    // we keep this to remove rep at end so players wont leave group before failing boost to skip rep loss
    this.initialMembers = group.members.map(m => m.cid);

    const vehicleLocation = this.getVehicleLocation().vehicle;
    const radiusBlipSize = this.getClassConfig().radiusBlipSize;
    const vehicleInfo = Vehicles.getConfigByModel(this.vehicleModel);

    this.addMail(
      this.owner.serverId,
      `Je hebt het contract gestart voor een ${
        vehicleInfo ? `${vehicleInfo.brand} ${vehicleInfo.name}` : this.vehicleModel
      }(${this.vehicleClass}). Locatie staat gemarkeerd op je GPS`,
      this.radiusBlipLocation
    );

    const clientActionData: Carboosting.ClientActionData = {
      vehicleLocation,
      radiusBlip: {
        coords: this.radiusBlipLocation,
        size: radiusBlipSize,
      },
    };
    group.members.forEach(member => {
      if (!member.serverId) return;
      Events.emitNet('carboosting:boost:clientAction', member.serverId, this.id, clientActionData);
    });

    this.log(
      'start',
      'info',
      `${
        this.owner.serverId ? `${Util.getName(this.owner.serverId)}(${this.owner.serverId})` : `${this.owner.cid}`
      } started carboost (${this.type}) for ${this.vehicleModel}(${this.vehicleClass})`,
      {
        owner: this.owner,
        groupId: this.groupId,
        vehicleClass: this.vehicleClass,
        vehicleModel: this.vehicleModel,
        type: this.type,
        vehicleLocation,
        chances: this.chances,
      }
    );
  };

  public finish = (failReason?: string) => {
    if (this.flags.finished) return;
    this.flags.finished = true;

    const group = this.getGroup(true);
    if (group) {
      Jobs.changeJob(group.id, null);

      group.members.forEach(m => {
        if (!m.serverId) return;
        this.cleanupPlayer(m.serverId);
      });
    }

    if (!failReason && !this.flags.droppedOff) {
      const repDecrease = this.getClassConfig().reputation.decrease;
      const groupMemberRepDecrease = Math.round(repDecrease * config.contracts.groupReputationPercentage);
      this.initialMembers.forEach(mCid => {
        contractManager.updateReputation(mCid, (mCid === this.owner.cid ? repDecrease : groupMemberRepDecrease) * -1);
      });
    }

    if (failReason && this.owner.serverId) {
      Financials.cryptoAdd(
        this.owner.serverId,
        'Suliro',
        this.getClassConfig().price[this.type],
        `Carboosting Refund: ${failReason}`
      );
    }

    this.stopGuardThread();
    boostManager.unregisterBoost(this.id);
    if (this.vehicle) {
      boostManager.unregisterBoostVehicle(this.vehicle?.vehicle);
    }

    if (this.tracker?.cooldown.timeout) {
      clearTimeout(this.tracker.cooldown.timeout);
    }

    if (this.owner.serverId) {
      Phone.showNotification(this.owner.serverId, {
        id: `carboosting-finish-${Date.now()}`,
        title: 'Carboosting',
        description: this.flags.droppedOff ? 'Contract succesvol afgerond' : 'Contract mislukt',
        icon: 'car',
      });
    }

    const vehicleLocation = this.getVehicleLocation();
    if (vehicleLocation.doorNames) {
      vehicleLocation.doorNames.forEach(doorName => {
        DoorLock.changeDoorState(doorName, false);
      });
    }

    this.log('finish', 'info', `boost has been finished | success: ${this.flags.droppedOff}`, {
      success: this.flags.droppedOff,
      failReason,
    });
  };

  private getClassConfig = () => getClassConfig(this.vehicleClass);

  public getVehicleLocation = () => getLocationsForClass(this.vehicleClass)[this.vehicleLocationIdx];

  public handlePlayerJoined = (plyId: number, cid: number) => {
    this.logger.debug(`syncing boost state to client ${plyId}`);

    // update serverId if this ply is owner
    if (cid === this.owner.cid) {
      this.owner.serverId = plyId;
    }

    // if vehicle is not spawned yet, we send event to add radiusblip and zone
    const clientActionData: Carboosting.ClientActionData = {};

    // if vehicle not spawned yet, we provide location to build zone
    if (this.vehicle === null) {
      clientActionData.vehicleLocation = this.getVehicleLocation().vehicle;
    }

    // if vehicle not lockpicked yet, we provide data to add radiusblip
    if (!this.flags.lockpicked) {
      clientActionData.radiusBlip = {
        coords: this.radiusBlipLocation,
        size: this.getClassConfig().radiusBlipSize,
      };
    }

    // if dropofflocation is defined, provide data to add zone
    if (this.dropoffLocationIdx !== null) {
      const dropoffLocation = config.dropoffs[this.type][this.dropoffLocationIdx];
      clientActionData.dropoff = {
        coords: dropoffLocation,
        type: this.type,
      };
    }

    if (this.tracker) {
      clientActionData.addNotification = {
        id: 'carboosting-tracker-amount',
        title: 'Carboosting',
        description: `Status: ${this.tracker.hacks.done}/${this.tracker.hacks.total} `,
        icon: 'car',
        sticky: true,
        keepOnAction: true,
        skipHasPhoneCheck: true, // this function will get triggered on char load, at that point inventory has probably not been fully loaded so client does not yet know if he has a phoneitem
      };
    }

    if (Object.keys(clientActionData).length > 0) {
      Events.emitNet('carboosting:boost:clientAction', plyId, this.id, clientActionData);
    }
  };

  public cleanupPlayer = (plyId: number) => {
    this.logger.debug(`cleaning up player ${plyId}`);
    Events.emitNet('carboosting:boost:cleanup', plyId, this.id);
  };

  public handleEnteredVehicleZone = (plyId: number) => {
    if (this.vehicle !== null) {
      Events.emitNet('carboosting:boost:destroyVehicleZone', plyId, this.id); // emit remove event again
      return;
    }

    if (this.flags.zoneEntered) return;

    const group = this.getGroup();
    if (!group) return;

    this.flags.zoneEntered = true;

    group.members.forEach(member => {
      if (!member.serverId) return;
      Events.emitNet('carboosting:boost:destroyVehicleZone', member.serverId, this.id);
    });

    this.spawnVehicle(plyId);
  };

  private spawnVehicle = async (plyId: number) => {
    const vehicleLocation = this.getVehicleLocation();
    const spawnedVehicle = await Vehicles.spawnVehicle({
      model: this.vehicleModel,
      position: vehicleLocation.vehicle,
      fuel: Util.getRndInteger(80, 90),
      doorsLocked: true,
    });
    if (!spawnedVehicle) {
      this.log('failedToSpawnVehicle', 'error', `Failed to spawn vehicle`, {}, true);
      this.finish('Failed To Spawn Vehicle');
      return;
    }

    this.vehicle = spawnedVehicle;
    Entity(spawnedVehicle.vehicle).state.set('boostId', this.id, true);
    Vehicles.skipDispatchOnLockpickForVin(spawnedVehicle.vin, true);
    boostManager.registerBoostVehicle(this.id, spawnedVehicle.vehicle);

    if (this.chances.tunes) {
      Vehicles.addMaxPerformanceTunesForVin(spawnedVehicle.vin, this.vehicleClass);
    }

    if (vehicleLocation.doorNames) {
      vehicleLocation.doorNames.forEach(doorName => {
        DoorLock.changeDoorState(doorName, true);
      });
    }

    this.log(
      'spawnVehicle',
      'silly',
      `${Util.getName(plyId)}(${plyId}) has triggered boost vehicle spawn ${spawnedVehicle.vin} (${this.vehicleModel})`,
      {
        vin: spawnedVehicle.vin,
        netId: spawnedVehicle.netId,
      }
    );
  };

  public validateVehicle = (vehicle: number | undefined = this.vehicle?.vehicle) => {
    if (!this.vehicle || this.vehicle.vehicle !== vehicle || !DoesEntityExist(vehicle)) {
      this.finish();
      return false;
    }
    const boostId = Entity(vehicle).state.boostId;
    if (boostId !== this.id) {
      this.finish();
      return false;
    }
    return true;
  };

  public handleVehicleLockpick = (plyId: number) => {
    if (this.flags.lockpicked) return;
    this.flags.lockpicked = true;

    const group = this.getGroup();
    if (!group) return;

    group.members.forEach(member => {
      if (!member.serverId) return;
      Events.emitNet('carboosting:boost:removeRadiusBlip', member.serverId, this.id);
    });

    if (this.chances.guards) {
      this.startGuardThread();
    }

    if (this.chances.dispatch) {
      this.doDispatchAlert();
    }

    if (this.chances.tracker) {
      this.addTracker();
    } else {
      this.startDropoff();
    }

    this.log('lockpick', 'info', `${Util.getName(plyId)}(${plyId}) started lockpicking boostvehicle`);
  };

  private startGuardThread = () => {
    if (this.guardThread) return;

    const guardLocations = this.getVehicleLocation().npcs;
    let lastGuardLocationIdx = -1;

    const guardConfig = this.getClassConfig().guards;
    let guardsLeftToSpawn = guardConfig.amount;

    this.logger.debug(`starting guard thread`);

    this.guardThread = setInterval(() => {
      let guardLocationIdx = 0;
      let tries = guardLocations.length; // failsafe to prevent infinite loop
      while (tries > 0) {
        tries--;
        guardLocationIdx = Math.floor(Math.random() * guardLocations.length);
        if (guardLocationIdx !== lastGuardLocationIdx) break;
      }

      lastGuardLocationIdx = guardLocationIdx;

      Npcs.spawnGuard({
        model: guardConfig.models[Math.floor(Math.random() * guardConfig.models.length)],
        weapon:
          guardConfig.weapons.length === 0
            ? undefined
            : guardConfig.weapons[Math.floor(Math.random() * guardConfig.weapons.length)],
        position: guardLocations[guardLocationIdx],
        deleteTime: {
          dead: 15,
          alive: 300,
        },
      });

      this.logger.debug(`Guard spawned`);
      guardsLeftToSpawn--;

      if (guardsLeftToSpawn <= 0) {
        this.stopGuardThread();
        return;
      }
    }, 5000);
  };

  private stopGuardThread = () => {
    if (!this.guardThread) return;
    clearInterval(this.guardThread);
    this.guardThread = null;
    this.logger.debug('stopping guard thread');
  };

  private doDispatchAlert = () => {
    if (!this.validateVehicle() || !this.vehicle) return; // !this.vehicle check to keep TS happy

    Police.createDispatchCall({
      tag: '10-31',
      title: `Diefstal van voertuig${this.chances.tracker ? ' met tracker' : ''}`,
      description: 'Eigenaar meld dat zijn voertuig wordt gestolen',
      vehicle: this.vehicle.vehicle,
      coords: Util.getEntityCoords(this.vehicle.vehicle),
      skipCoordsRandomization: true,
      important: ['S', 'X'].includes(this.vehicleClass),
      entries: this.chances.tracker
        ? {
            'location-dot': 'Actuele trackerlocatie is te bekijken op GPS',
          }
        : undefined,
      blip: this.chances.tracker
        ? undefined
        : {
            sprite: 645,
            color: 0,
          },
    });
  };

  private addTracker = () => {
    if (!this.validateVehicle() || !this.vehicle) return; // !this.vehicle check to keep TS happy

    this.logger.debug(`adding tracker`);

    const trackerConfig = this.getClassConfig().tracker;
    const trackerId = Police.addTrackerToVehicle(this.vehicle.vehicle, trackerConfig.delay);
    this.tracker = {
      id: trackerId,
      hacks: {
        total: Util.isDevEnv() ? 2 : trackerConfig.amount,
        done: 0,
      },
      cooldown: {
        active: false,
        timeout: null,
      },
    };

    const phoneNotifData: Phone.Notification = {
      id: 'carboosting-tracker-amount',
      title: 'Carboosting',
      description: `Status: ${this.tracker.hacks.done}/${this.tracker.hacks.total}`,
      icon: 'car',
      sticky: true,
      keepOnAction: true,
    };

    this.getGroup()?.members.forEach(member => {
      if (!member.serverId) return;
      Phone.showNotification(member.serverId, phoneNotifData);
    });
  };

  public hasTracker = () => this.tracker !== null;

  public disableTracker = async (plyId: number) => {
    if (!this.flags.lockpicked) throw new Error('started disabling vehicle tracker before lockpicking');

    if (this.tracker === null || !this.vehicle) return;

    if (this.flags.disablingTracker) {
      Notifications.add(plyId, 'Er is momenteel al iemand hiermee bezig', 'error');
      return;
    }

    if (this.tracker.cooldown.active) {
      Notifications.add(plyId, 'Software is nog aan het resetten, even geduld', 'error');
      return;
    }

    this.flags.disablingTracker = true;

    const trackerConfig = this.getClassConfig().tracker;
    const success = await Minigames.ordergame(
      plyId,
      trackerConfig.hack.gridSize,
      1,
      trackerConfig.hack.length,
      trackerConfig.hack.displayTime,
      trackerConfig.hack.inputTime
    );

    this.flags.disablingTracker = false;

    const group = this.getGroup();
    if (!group) return;

    this.tracker.hacks.done = Math.max(this.tracker.hacks.done + (success ? 1 : -1), 0);

    // check if enough hacks are done
    if (this.tracker.hacks.done >= this.tracker.hacks.total) {
      Police.removeTrackerFromVehicle(this.tracker.id);
      this.tracker = null;
      this.startDropoff();
      this.log('disableTracker', 'info', `${Util.getName(plyId)}(${plyId}) has removed tracker`);
      return;
    }

    const phoneNotifData: Pick<Phone.Notification, 'description'> = {
      description: `Status: ${this.tracker.hacks.done}/${this.tracker.hacks.total}`,
    };
    group.members.forEach(member => {
      if (!member.serverId) return;
      Phone.updateNotification(member.serverId, 'carboosting-tracker-amount', phoneNotifData);
    });

    const trackerDelay = trackerConfig.delay + this.tracker.hacks.done * trackerConfig.increase;
    if (Police.isTrackerActive(this.tracker.id)) {
      Police.changeVehicleTrackerDelay(this.tracker.id, trackerDelay);
    } else {
      const newTrackerId = Police.addTrackerToVehicle(this.vehicle.vehicle, trackerDelay);
      this.tracker.id = newTrackerId;
    }

    // start cooldown delay
    this.tracker.cooldown.active = true;
    this.tracker.cooldown.timeout = setTimeout(
      () => {
        if (!this.tracker) return;
        this.tracker.cooldown.active = false;
      },
      Util.isDevEnv() ? 3000 : trackerConfig.cooldown
    );

    this.log(
      'hackTracker',
      'debug',
      `${Util.getName(plyId)}(${plyId}) has ${success ? 'succeeded' : 'failed'} trackerdisabler hack | Done: ${
        this.tracker.hacks.done
      }/${this.tracker.hacks.total}`,
      { hackSuccess: success }
    );
  };

  private startDropoff = () => {
    if (!this.vehicle || !this.flags.lockpicked || this.tracker !== null) return;

    const group = this.getGroup();
    if (!group) return;

    this.dropoffLocationIdx = boostManager.getRandomDropoffLocationIdx(this.type);
    const dropoffLocation = config.dropoffs[this.type][this.dropoffLocationIdx];

    const clientActionData: Carboosting.ClientActionData = {
      dropoff: {
        coords: dropoffLocation,
        type: this.type,
      },
      removeNotification: 'carboosting-tracker-amount',
      mail: {
        message: `${
          this.chances.tracker ? 'De tracker is uitgeschakeld.<br>' : ''
        }Breng het voertuig naar de locatie op je GPS.<br>Neem geen politie mee!`,
        coords: dropoffLocation,
      },
    };

    group.members.forEach(member => {
      if (!member.serverId) return;
      Events.emitNet('carboosting:boost:clientAction', member.serverId, this.id, clientActionData);
    });

    this.logger.debug('started dropoff');
  };

  public dropoff = async (plyId: number, healthPercentage: number) => {
    if (this.dropoffLocationIdx === null)
      throw new Error('tried to dropoff vehicle but dropofflocation was not defined');

    if (!this.validateVehicle() || !this.vehicle) return;

    const group = this.getGroup();
    if (!group) return;

    if (this.flags.droppedOff) {
      Notifications.add(plyId, 'Dit is al gebeurd', 'error');
      return;
    }
    this.flags.droppedOff = true;

    const vehicleCoords = Util.getEntityCoords(this.vehicle.vehicle);
    const dropoffLocation = config.dropoffs[this.type][this.dropoffLocationIdx];

    const distanceToDropoff = vehicleCoords.distance(dropoffLocation);
    if (distanceToDropoff > 20) {
      Notifications.add(plyId, 'Je bent niet op de locatie', 'error');
      this.flags.droppedOff = false;
      return;
    }

    if (Police.isAnyPoliceInRange(vehicleCoords, 75)) {
      Notifications.add(plyId, 'Er is nog politie in de buurt', 'error');
      this.flags.droppedOff = false;
      return;
    }

    // dont give rep if they scratched the bitch
    if (this.type === 'boost') {
      const repIncrease = this.getClassConfig().reputation.increase * healthPercentage;
      const groupMemberRepIncrease = Math.round(repIncrease * config.contracts.groupReputationPercentage);
      group.members.forEach(m => {
        contractManager.updateReputation(m.cid, m.cid === this.owner.cid ? repIncrease : groupMemberRepIncrease);
      });
    }

    this.log(
      'dropoff',
      'silly',
      `${Util.getName(plyId)}(${plyId}) has dropped off vehicle | Health: ${healthPercentage}`,
      { healthPercentage }
    );

    if (this.type === 'scratch') {
      const success = await Vehicles.setExistingVehicleAsPlayerOwned(this.vehicle.vehicle, this.owner.cid, true);
      if (!success) {
        Notifications.add(
          plyId,
          'Er is iets foutgelopen bij het opslaan van het voertuig. Gelieve een reportje te maken',
          'error'
        );
      }
      this.addMail(
        this.owner.serverId ?? plyId,
        `Het voertuig staat vanaf nu op jouw naam.<br>Draag er wel zorg voor want het is niet verzekerd!`
      );
      this.finish();
      return;
    }

    // handle normal boost

    Vehicles.setEngineState(this.vehicle.vehicle, false, true);
    FreezeEntityPosition(this.vehicle.vehicle, true);
    SetVehicleDoorsLocked(this.vehicle.vehicle, 10);

    Phone.showNotification(plyId, {
      id: `carboosting-leave-area-${Date.now()}`,
      title: 'Carboosting',
      description: `Verlaat het gebied om payment te ontvangen`,
      icon: 'car',
    });

    await Util.awaitCondition(
      () => this.flags.finished || !Util.isAnyPedInRange(vehicleCoords, 100, true),
      60 * 1000,
      1000
    );

    if (this.flags.finished) return;

    const fullReward = this.getClassConfig().price.boost * config.contracts.finishRewardPriceMultiplier;
    const reward = Math.max(Math.round(fullReward * healthPercentage), 1); // always receive minimum of 1 or player would get nothing for D because its free
    Financials.cryptoAdd(this.owner.serverId ?? plyId, 'Suliro', reward, `Finished ${this.vehicleClass} Contract`);

    this.finish();

    // After finish or entityRemoved evt will catch it
    Vehicles.deleteVehicle(this.vehicle.vehicle);
  };
}
