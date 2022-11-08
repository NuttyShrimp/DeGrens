import { Config, Events, Jobs, Notifications, Phone, Taskbar, Util, Inventory, Police } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';

import { mainLogger } from '../sv_logger';
import { HouseState, PlayerState } from '../enums/states';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private config: Config;
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

  @RPCEvent('houserobbery:server:toggleSignedIn')
  toggleSignedIn = (src: number) => {
    const Player = DGCore.Functions.GetPlayer(src);
    if (Jobs.isWhitelisted(src, 'police')) {
      Notifications.add(src, 'Bert B: "Ik kan niks voor u betekenen"');
      Util.Log(
        'houserobbery:signin:failed',
        {},
        `${Player.PlayerData.name} tried to signin for houserobberies but is has the police job`,
        src
      );
      return;
    }
    const cid = Player.PlayerData.citizenid;
    if (this.playerStates.has(cid) && this.playerStates.get(cid) !== PlayerState.WAITING) {
      this.cleanupPlayer(src);
      Util.Log('houserobbery:signin:logout', {}, `${Player.PlayerData.name} left the queue for houserobberies`, src);
      return false;
    }
    this.playerStates.set(cid, PlayerState.WAITING);
    const plyJobGroup = Jobs.getGroupByCid(cid);
    if (!plyJobGroup) {
      Jobs.createGroup(src);
    }
    Util.Log('houserobbery:signin:login', {}, `${Player.PlayerData.name} joined the queue for houserobberies`, src);
    return true;
  };

  private checkUserIsDoingJob(src: number, houseId: string): boolean {
    if (!this.houseStates.has(houseId)) {
      mainLogger.debug(`Could not find house ${houseId}`);
      return false;
    }
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) return;
    if (Jobs.getCurrentJob(src) === 'police') return true;
    const jobGroup = Jobs.getGroupByServerId(src);
    if (!jobGroup) {
      mainLogger.debug(`Could not find job group for player ${src}`);
      return false;
    }
    if (this.groupIdToHouse.get(jobGroup.id) !== houseId) {
      mainLogger.debug(`Group ${jobGroup.id} is assigned this house ${houseId}`);
      return false;
    }
    if (this.groupIdToFindTimeout.has(houseId)) {
      clearTimeout(this.groupIdToFindTimeout.get(houseId));
      this.groupIdToFindTimeout.delete(houseId);
      this.groupIdsToActiveTimeout.set(
        houseId,
        setTimeout(() => {
          if (!this.checkUserIsDoingJob(jobGroup.owner.serverId, houseId)) return;
          // And remove zone after 10minutes for police
          const plyCheckInterval = setInterval(() => {
            if (!this.checkUserIsDoingJob(jobGroup.owner.serverId, houseId)) return;
            const houseStates = this.houseStates.get(houseId);
            if (houseStates.players.size > 0) return;
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
    const state = this.houseStates.get(houseId).state;
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
    this.houseStates.get(houseId).state = HouseState.UNLOCKED;
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
    this.houseStates.get(houseId).state = HouseState.LOCKED;
  };

  @DGXEvent('houserobbery:server:enterHouse')
  enterHouse = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return false;
    const Player = DGCore.Functions.GetPlayer(src);
    this.houseStates.get(houseId).players.add(Player.PlayerData.citizenid);
    Util.Log(
      'houserobbery:house:enter',
      {
        houseId,
        players: this.houseStates.get(houseId).players,
        searchedLocations: this.houseStates.get(houseId).searched,
      },
      `${GetPlayerName(String(src))} entered a house for a robbery`,
      src
    );
  };

  @DGXEvent('houserobbery:server:leaveHouse')
  leaveHouse = (src: number, houseId: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    const Player = DGCore.Functions.GetPlayer(src);
    this.houseStates.get(houseId).players.delete(Player.PlayerData.citizenid);
    Util.Log(
      'houserobbery:house:leave',
      {
        houseId,
        players: this.houseStates.get(houseId).players,
        searchedLocations: this.houseStates.get(houseId).searched,
      },
      `${GetPlayerName(String(src))} left a house for a robbery`,
      src
    );
  };

  @RPCEvent('houserobbery:server:canLootZone')
  canLootZone = (src: number, houseId: string, zoneName: string) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return false;
    if (Inventory.hasObject(src)) return false;
    const houseState = this.houseStates.get(houseId);
    return !houseState?.searched.has(zoneName);
  };

  @DGXEvent('houserobbery:server:doLootZone')
  doLootZone = async (src: number, houseId: string, zoneName: string, lootTableId = 0) => {
    if (!this.checkUserIsDoingJob(src, houseId)) return;
    const houseState = this.houseStates.get(houseId);
    if (houseState.searched.has(zoneName)) {
      Notifications.add(src, 'Deze plek is al eens doorzocht...', 'error');
      return;
    }
    if (Jobs.isWhitelisted(src, 'police')) {
      Notifications.add(src, 'Dit is niet de bedoeling he...');
      return;
    }
    houseState.searched.add(zoneName);

    const [wasCancelled] = await Taskbar.create(
      src,
      `houserob-loot-${zoneName}`,
      'magnifying-glass',
      'Doorzoeken...',
      15000,
      {
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
      }
    );
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

    const chance = Util.getRndInteger(0, 5);
    if (chance < 1) {
      Inventory.addItemToPlayer(src, 'drive_v1', 1);
      Util.Log(
        'houserobbery:house:specialLoot',
        {
          houseId,
          item,
          zoneName,
          chance,
        },
        `${GetPlayerName(String(src))} got ${item} from a house robbery`,
        src
      );
    }
  };

  getRobableHouse = (): string | null => {
    const robableHouse = [...this.houseStates.entries()].filter(([_, state]) => state.state === HouseState.FREE);
    if (robableHouse.length == 0) return null;
    const chosenHouse = robableHouse[Util.getRndInteger(0, robableHouse.length)];
    return chosenHouse[0];
  };

  async startJobForPly(plyCID: number, houseId: string) {
    const jobGroup = Jobs.getGroupByCid(plyCID);
    if (!jobGroup) {
      mainLogger.debug(`Could not find job group for player ${plyCID}`);
      return false;
    }
    const plyId = DGCore.Functions.GetPlayerByCitizenId(plyCID).PlayerData.source;
    const couldChange = await Jobs.changeGroupJob(plyId, 'houserobbery');
    if (!couldChange) {
      mainLogger.debug(`Could not change job for player ${plyCID} - ${plyId}`);
      return false;
    }

    this.groupIdToHouse.set(jobGroup.id, houseId);
    const houseInfo = this.config.locations[this.houseStates.get(houseId).dataIdx];
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
      this.cleanupPlayer(m.serverId);
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
        members: jobGroup.members,
      },
      `${jobGroup.owner.name} finished his house robbery job`
    );
    jobGroup.members.forEach(m => this.finishJobForPly(m.serverId, m.cid));
  }

  cleanupPlayer(src: number) {
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) return;
    const cid = Player.PlayerData.citizenid;
    this.playerStates.delete(cid);
    emitNet('houserobbery:client:cleanup', src);
  }
}

const stateManager = StateManager.getInstance();
export default stateManager;
