import { Config, Events, Jobs, Notifications, Phone, Taskbar, Util, Inventory, Police } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';

import { mainLogger } from '../sv_logger';
import { HouseState, PlayerState } from '../enums/states';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private config!: Config;
  playerStates: Map<number, PlayerState> = new Map();
  // The prevent players from logging out and back in when in a job
  private plyInCd: Set<number> = new Set();
  private houseStates: Map<string, House.State<HouseState>> = new Map();
  // Map of jobgroup id to house
  private groupIdToHouse: Map<string, string> = new Map();
  private groupIdToFindTimeout: Map<string, NodeJS.Timer> = new Map();
  private groupIdsToActiveTimeout: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    super();
    this.loadLocations();
  }

  private async loadLocations() {
    await Config.awaitConfigLoad();
    this.config = Config.getModuleConfig<Config>('houserobbery');
    this.config.locations.forEach((_, idx) => {
      let houseId = Util.uuidv4();
      while (this.houseStates.has(houseId)) {
        houseId = Util.uuidv4();
      }
      this.houseStates.set(houseId, {
        searched: new Set(),
        players: new Set(),
        dataIdx: idx,
        state: HouseState.FREE,
      });
    });
  }

  @DGXEvent('houserobbery:server:toggleSignedIn')
  toggleSignedIn = async (src: number) => {
    const cid = Util.getCID(src);

    // can always sign out if already signed in
    if (this.playerStates.has(cid) && this.playerStates.get(cid) !== PlayerState.WAITING) {
      this.cleanupPlayer(src, cid);
      Util.Log('houserobbery:signin:logout', {}, `${Util.getName(src)} left the queue for houserobberies`, src);
      Notifications.add(src, 'Je bent niet langer aangemeld...', 'error');
      return;
    }

    if (Jobs.isWhitelisted(src, 'police')) {
      Notifications.add(src, 'Bert B: "Ik kan niks voor u betekenen"');
      Util.Log(
        'houserobbery:signin:failed',
        {},
        `${Util.getName(src)} tried to signin for houserobberies but has the police job`,
        src
      );
      return;
    }

    const hasVPN = await Inventory.doesPlayerHaveItems(src, 'vpn');
    if (!hasVPN) {
      Notifications.add(src, 'Bert B: "Ik kan niks voor u betekenen"');
      Util.Log(
        'houserobbery:signin:failed',
        {},
        `${Util.getName(src)} tried to signin for houserobberies but has no vpn`,
        src
      );
      return;
    }

    this.playerStates.set(cid, PlayerState.WAITING);
    const plyJobGroup = Jobs.getGroupByCid(cid);
    if (!plyJobGroup) {
      Jobs.createGroup(src);
    }
    Util.Log('houserobbery:signin:login', {}, `${Util.getName(src)} joined the queue for houserobberies`, src);
  };

  private checkUserIsDoingJob(src: number, houseId: string): boolean {
    if (!this.houseStates.has(houseId)) {
      mainLogger.debug(`Could not find house ${houseId}`);
      return false;
    }

    if (Jobs.getCurrentJob(src) === 'police') return true;
    const jobGroup = Jobs.getGroupByServerId(src);
    if (!jobGroup) {
      mainLogger.debug(`Could not find job group for player ${src}`);
      return false;
    }
    if (this.groupIdToHouse.get(jobGroup.id) !== houseId) {
      mainLogger.debug(`Group ${jobGroup.id} is not assigned to this house ${houseId}`);
      return false;
    }

    if (this.groupIdToFindTimeout.has(houseId)) {
      clearTimeout(this.groupIdToFindTimeout.get(houseId));
      this.groupIdToFindTimeout.delete(houseId);

      this.groupIdsToActiveTimeout.set(
        houseId,
        setTimeout(() => {
          if (!jobGroup.owner.serverId) return;
          if (!this.checkUserIsDoingJob(jobGroup.owner.serverId, houseId)) return;
          // And remove zone after 10minutes for police
          const plyCheckInterval = setInterval(() => {
            if (!jobGroup.owner.serverId) return;
            if (!this.checkUserIsDoingJob(jobGroup.owner.serverId, houseId)) return;
            const houseStates = this.houseStates.get(houseId);
            if (!houseStates || houseStates.players.size > 0) return;
            this.finishJob(jobGroup.owner.serverId, houseId);
            clearInterval(plyCheckInterval);
          }, 2000);
        }, this.config.timeToRob * 60000)
      );
    }
    return true;
  }

  @RPCEvent('houserobbery:server:getDoorState')
  getDoorState = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return false;
    const Player = DGCore.Functions.GetPlayer(src);
    const state = this.houseStates.get(houseId)?.state ?? -1;
    if (Jobs.getCurrentJob(src) === 'police' && state === HouseState.LOCKED) return true;
    return state === HouseState.UNLOCKED;
  };

  @DGXEvent('houserobbery:server:unlockDoor')
  unlockDoor = (src: number, houseId: string) => {
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    const houseConfig = this.config.locations[houseState.dataIdx];
    if (!houseConfig) return;
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    Util.Log(
      'houserobbery:door:unlock',
      {
        houseId,
      },
      `${GetPlayerName(String(src))} unlocked a house robbery door`,
      src
    );
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Poging to inbraak',
      description: 'Er was een verdacht persoon aan een huisdeur aan het prutsen',
      blip: {
        sprite: 418,
        color: 3,
      },
      criminal: src,
      coords: houseConfig.coords,
    });
    if (!houseState) return;
    houseState.state = HouseState.UNLOCKED;
  };

  @DGXEvent('houserobbery:server:lockDoor')
  lockDoor = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) return;
    if (Jobs.getCurrentJob(src) === 'police') return;
    Util.Log(
      'houserobbery:door:lock',
      {
        houseId,
      },
      `${GetPlayerName(String(src))} locked a house robbery door`,
      src
    );
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    houseState.state = HouseState.LOCKED;
  };

  @DGXEvent('houserobbery:server:enterHouse')
  enterHouse = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return false;
    const Player = DGCore.Functions.GetPlayer(src);
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    houseState.players.add(Player.PlayerData.citizenid);
    Util.Log(
      'houserobbery:house:enter',
      {
        houseId,
        players: houseState.players,
        searchedLocations: houseState.searched,
      },
      `${GetPlayerName(String(src))} entered a house for a robbery`,
      src
    );
  };

  @DGXEvent('houserobbery:server:leaveHouse')
  leaveHouse = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    const Player = DGCore.Functions.GetPlayer(src);
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    houseState.players.delete(Player.PlayerData.citizenid);
    Util.Log(
      'houserobbery:house:leave',
      {
        houseId,
        players: houseState.players,
        searchedLocations: houseState.searched,
      },
      `${GetPlayerName(String(src))} left a house for a robbery`,
      src
    );
  };

  @DGXEvent('houserobbery:server:doLootZone')
  doLootZone = async (src: number, houseId: string, zoneName: string, lootTableId = 0) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return false;

    const hasObject = await Inventory.hasObject(src);
    if (hasObject) {
      Notifications.add(src, 'Je hebt nog iets vast...', 'error');
      return false;
    }

    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    if (houseState.searched.has(zoneName)) {
      Notifications.add(src, 'Deze plek is al eens doorzocht...', 'error');
      return;
    }
    if (Jobs.isWhitelisted(src, 'police')) {
      Notifications.add(src, 'Dit is niet de bedoeling he...');
      return;
    }
    houseState.searched.add(zoneName);

    const [wasCancelled] = await Taskbar.create(src, 'magnifying-glass', 'Doorzoeken...', 15000, {
      canCancel: true,
      cancelOnDeath: true,
      disarm: true,
      disableInventory: true,
      controlDisables: {
        movement: true,
        carMovement: true,
        combat: true,
      },
      animation: {
        animDict: 'anim@gangops@facility@servers@bodysearch@',
        anim: 'player_search',
        flags: 17,
      },
    });
    if (wasCancelled) {
      houseState.searched.delete(zoneName);
      return;
    }

    const lootTable = this.config.lootTables[lootTableId];
    const item = lootTable[Util.getRndInteger(0, lootTable.length)];
    Inventory.addItemToPlayer(src, item, 1);
    Util.Log(
      'houserobbery:house:loot',
      {
        houseId,
        item,
        zoneName,
      },
      `${GetPlayerName(String(src))} got ${item} from a house robbery`,
      src
    );

    if (Util.getRndInteger(1, 1001) <= this.config.moldChance * 10) {
      global.exports['dg-materials'].tryGivingKeyMold(src);
    }
  };

  getRobableHouse = (): string | null => {
    const robableHouse = [...this.houseStates.entries()].filter(([_, state]) => state.state === HouseState.FREE);
    if (robableHouse.length == 0) return null;
    const chosenHouse = robableHouse[Util.getRndInteger(0, robableHouse.length)];
    return chosenHouse[0];
  };

  startJobForPly(plyCID: number, houseId: string) {
    const jobGroup = Jobs.getGroupByCid(plyCID);
    if (!jobGroup) {
      mainLogger.debug(`Could not find job group for player ${plyCID}`);
      return false;
    }
    const plyId = DGCore.Functions.getPlyIdForCid(plyCID);
    if (!plyId) return false;
    const couldChange = Jobs.changeGroupJob(plyId, 'houserobbery');
    if (!couldChange) {
      mainLogger.debug(`Could not change job for player ${plyCID} - ${plyId}`);
      return false;
    }

    this.groupIdToHouse.set(jobGroup.id, houseId);
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return false;
    const houseInfo = this.config.locations[houseState.dataIdx];
    Phone.sendMail(
      plyId,
      'Huisinbraak',
      'Bert B.',
      `Je bent geselecteerd voor de job. Je hebt ${this.config.timeToFind}min om binnen te geraken! De locatie staat op je GPS gemarkeerd.`
    );

    jobGroup.members.forEach(m => {
      this.playerStates.set(m.cid, PlayerState.ASSIGNED);
      if (m.serverId !== null) {
        Events.emitNet('houserobbery:client:setSelectedHouse', m.serverId, houseId, houseInfo, this.config.timeToFind);
      }
    });

    // build zone for everyone so other players can also enter
    Events.emitNet('houserobbery:client:buildHouseZone', -1, houseId, houseInfo);

    this.groupIdToFindTimeout.set(
      jobGroup.id,
      setTimeout(() => {
        if (!this.groupIdToFindTimeout.has(jobGroup.id)) return;
        Util.Log(
          'houserobbery:job:findtimeout',
          {
            houseId,
            others: jobGroup.members,
          },
          `${GetPlayerName(String(plyId))} timed out finding a house`,
          plyId
        );
        this.failJob(plyId);
      }, this.config.timeToFind * 60000)
    );

    Util.Log(
      'houserobbery:job:start',
      {
        houseId,
        others: jobGroup.members,
      },
      `${GetPlayerName(String(plyId))} started a house robbery job`,
      plyId
    );
    mainLogger.debug(`Started job for player ${plyCID} in house ${JSON.stringify(houseInfo.coords)}`);
    return true;
  }

  private failJob(src: number) {
    const jobGroup = Jobs.getGroupByServerId(src);
    if (!jobGroup) return;
    const houseId = this.groupIdToHouse.get(jobGroup.id);
    if (!houseId) return;
    if (!this.houseStates.has(houseId)) return;
    if (this.groupIdToHouse.get(jobGroup.id) !== houseId) return;
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    houseState.state = HouseState.FREE;
    this.groupIdToHouse.delete(jobGroup.id);
    this.groupIdToFindTimeout.delete(jobGroup.id);
    Phone.sendMail(
      src,
      'Huisinbraak',
      'Bert B.',
      'Je deed er te lang over! Ik zal je taak overhandige aan een echte professional'
    );
    mainLogger.debug(`${src} failed his houserobbery job`);
    Jobs.changeGroupJob(src, null);
    jobGroup.members.forEach(m => {
      this.cleanupPlayer(m.serverId, m.cid);
    });
  }

  private finishJobForPly(src: number, cid: number) {
    this.plyInCd.add(cid);
    this.playerStates.set(cid, PlayerState.COOLDOWN);
    setTimeout(() => {
      if (!this.playerStates.has(cid)) return;
      this.plyInCd.delete(cid);
      this.playerStates.set(cid, PlayerState.WAITING);
    }, this.config.playerCooldown * 60000);
    emitNet('houserobbery:client:cleanup', src);
  }

  finishJob(src: number, houseId: string) {
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    const jobGroup = Jobs.getGroupByServerId(src);
    Jobs.changeGroupJob(src, null);
    Phone.sendMail(
      src,
      'Taak voltooid',
      'Bert B.',
      'Je hebt je taak volbracht, maak nu dat we daar weggaat voordat iemand je ontdekt'
    );
    Util.Log(
      'houserobbery:job:finish',
      {
        houseId,
        members: jobGroup?.members ?? 'No members defined',
      },
      `${jobGroup?.owner.name ?? 'unknown group owner'} finished his house robbery job`
    );
    jobGroup?.members.forEach(m => {
      if (!m.serverId) return;
      this.finishJobForPly(m.serverId, m.cid);
    });

    // destroy zone for everyone when job is finished
    Events.emitNet('houserobbery:client:destroyHouseZone', -1, houseId);
  }

  cleanupPlayer(src: number | null, cid: number) {
    this.playerStates.delete(cid);
    if (src !== null) {
      emitNet('houserobbery:client:cleanup', src);
    }
  }
}

const stateManager = StateManager.getInstance();
export default stateManager;
