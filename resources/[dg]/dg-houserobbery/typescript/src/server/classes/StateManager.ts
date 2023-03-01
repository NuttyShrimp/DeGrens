import { Config, Events, Jobs, Notifications, Phone, Taskbar, Util, Inventory, Police, Minigames } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';

import { mainLogger } from '../sv_logger';
import { HouseState, PlayerState } from '../enums/states';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private config!: Config;
  public playerStates: Map<number, PlayerState> = new Map();

  // The prevent players from logging out and back in when in a job
  private houseStates: Map<string, House.State<HouseState>> = new Map();

  // Map of jobgroup id to house
  private activeJobs: Map<
    string,
    {
      houseId: string;
      findTimeout: NodeJS.Timeout | null;
      finishTimeout: NodeJS.Timeout | null;
    }
  >;

  constructor() {
    super();
    this.activeJobs = new Map();
    this.loadLocations();
  }

  private async loadLocations() {
    await Config.awaitConfigLoad();
    this.config = Config.getModuleConfig<Config>('houserobbery');

    // Init state for every house
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
  private _toggleSignedIn = async (src: number) => {
    const cid = Util.getCID(src);
    const playerState = this.playerStates.get(cid);

    // can always sign out if already signed in
    if (playerState !== undefined) {
      if (playerState === PlayerState.ASSIGNED) {
        Notifications.add(src, 'Bert B: "Je bent nog met een job bezig"', 'error');
      } else {
        this.playerStates.delete(cid);
        Util.Log('houserobbery:signin:logout', {}, `${Util.getName(src)} left the queue for houserobberies`, src);
        Notifications.add(src, 'Bert B: "Ik heb je van de lijst gehaald"', 'info');
      }
      return;
    }

    if (Jobs.isWhitelisted(src, 'police')) {
      Notifications.add(src, 'Bert B: "Ik kan niks voor u betekenen"', 'error');
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
      Notifications.add(src, 'Bert B: "Ik kan niks voor u betekenen"', 'error');
      Util.Log(
        'houserobbery:signin:failed',
        {},
        `${Util.getName(src)} tried to signin for houserobberies but has no vpn`,
        src
      );
      return;
    }

    if (!Jobs.getGroupByCid(cid)) {
      Notifications.add(src, 'Bert B: "Ik kan je niet op de lijst zetten zolang je niet in een groep zit"', 'error');
      return;
    }

    this.playerStates.set(cid, PlayerState.WAITING);

    Notifications.add(src, 'Bert B: "Ik heb je op de lijst gezet, hou je mail in de gaten"', 'success');
    Util.Log('houserobbery:signin:login', {}, `${Util.getName(src)} joined the queue for houserobberies`, src);
  };

  @RPCEvent('houserobbery:server:getHouseInfo')
  private _getHouseInfo = (src: number, houseId: string) => {
    const houseState = this.houseStates.get(houseId);
    if (!houseState) return;
    const houseInfo = this.config.locations[houseState.dataIdx];
    return houseInfo;
  };

  @RPCEvent('houserobbery:server:canEnter')
  private _canEnter = (plyId: number, houseId: string) => {
    const state = this.houseStates.get(houseId)?.state;
    if (!state) return false;
    if (Jobs.getCurrentJob(plyId) === 'police') return true;
    return state === HouseState.UNLOCKED;
  };

  @DGXEvent('houserobbery:server:unlockHouse')
  private _unlockDoor = async (plyId: number, houseId: string, holdingCrowbar: boolean) => {
    const house = this.houseStates.get(houseId);
    if (!house) return;
    const houseConfig = this.config.locations[house.dataIdx];
    if (!houseConfig) return;
    const group = Jobs.getGroupByServerId(plyId);
    if (!group) return;
    const activeJob = this.activeJobs.get(group.id);
    if (!activeJob || activeJob.houseId !== houseId) return;

    if (house.state !== HouseState.LOCKED) {
      Notifications.add(plyId, 'Deze deur is al los...', 'error');
      return;
    }

    // need crowbar or lockpick
    if (!holdingCrowbar) {
      const hasLockpick = await Inventory.doesPlayerHaveItems(plyId, 'lockpick');
      if (!hasLockpick) {
        Notifications.add(plyId, 'Hoe ga je dit openen?', 'error');
        return;
      }
    }

    const keygameSuccess = await Minigames.keygame(plyId, 3, 7, 20);

    // double check to avoid multiple people lockpicking at same time causing problems
    if (house.state !== HouseState.LOCKED) return;

    if (!keygameSuccess) {
      if (Util.getRndInteger(0, 100) < 10) {
        Inventory.removeItemByNameFromPlayer(plyId, 'lockpick');
      } else {
        Notifications.add(plyId, 'Je bent uitgeschoven', 'error');
        Police.addBloodDrop(plyId);
      }
      return;
    }

    house.state = HouseState.UNLOCKED;
    Notifications.add(plyId, 'De deur is opengebroken!', 'success');

    Util.Log(
      'houserobbery:door:unlock',
      {
        houseId,
      },
      `${Util.getName(plyId)}(${plyId}) unlocked a house robbery door`,
      plyId
    );
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Poging to inbraak',
      description: 'Er was een verdacht persoon aan een huisdeur aan het prutsen',
      blip: {
        sprite: 418,
        color: 3,
      },
      criminal: plyId,
      coords: houseConfig.coords,
    });

    if (activeJob.findTimeout) {
      clearTimeout(activeJob.findTimeout);
    }
    activeJob.findTimeout = null;

    activeJob.finishTimeout = setTimeout(
      groupId => {
        this.finishJob(groupId, houseId);
      },
      this.config.timeToRob * 60000,
      group.id
    );
  };

  @DGXEvent('houserobbery:server:lockDoor')
  private _lockDoor = (plyId: number, houseId: string) => {
    if (Jobs.getCurrentJob(plyId) !== 'police') {
      Notifications.add(plyId, 'Je hebt hier geen toegang toe', 'error');
      return;
    }

    const house = this.houseStates.get(houseId);
    if (!house) return;
    if (house.state === HouseState.LOCKED) {
      Notifications.add(plyId, 'Deze deur is al vast', 'error');
      return;
    }

    house.state = HouseState.LOCKED;

    Notifications.add(plyId, 'Je hebt het huis vergrendeld', 'success');
    Util.Log(
      'houserobbery:door:lock',
      {
        houseId,
      },
      `${Util.getName(plyId)} locked a house robbery door`,
      plyId
    );
  };

  @DGXEvent('houserobbery:server:enterHouse')
  private _enterHouse = (plyId: number, houseId: string) => {
    const cid = Util.getCID(plyId);
    const house = this.houseStates.get(houseId);
    if (!house) return;
    house.players.add(cid);

    Util.Log(
      'houserobbery:house:enter',
      {
        houseId,
        players: house.players,
        searchedLocations: house.searched,
      },
      `${Util.getName(plyId)}(${plyId}) entered a house for a robbery`,
      plyId
    );
  };

  @DGXEvent('houserobbery:server:leaveHouse')
  private _leaveHouse = (plyId: number, houseId: string) => {
    const cid = Util.getCID(plyId);
    const house = this.houseStates.get(houseId);
    if (!house) return;
    house.players.delete(cid);

    Util.Log(
      'houserobbery:house:leave',
      {
        houseId,
        players: house.players,
        searchedLocations: house.searched,
      },
      `${Util.getName(plyId)}(${plyId}) left a house for a robbery`,
      plyId
    );

    // Check if everything is searched
    if (house.searched.size === this.config.shellInfo[this.config.locations[house.dataIdx].size].lootZones) {
      const group = Jobs.getGroupByServerId(plyId);
      if (!group) return;
      this.finishJob(group.id, houseId);
    }
  };

  @DGXEvent('houserobbery:server:doLootZone')
  private _doLootZone = async (plyId: number, houseId: string, zoneName: string, lootTableId = 0) => {
    const hasObject = await Inventory.hasObject(plyId);
    if (hasObject) {
      Notifications.add(plyId, 'Je hebt nog iets vast...', 'error');
      return false;
    }

    const house = this.houseStates.get(houseId);
    if (!house) return;

    const cid = Util.getCID(plyId);
    if (!house.players.has(cid)) return;
    if (house.searched.has(zoneName)) {
      Notifications.add(plyId, 'Deze plek is al eens doorzocht...', 'error');
      return;
    }
    if (Jobs.isWhitelisted(plyId, 'police')) {
      Notifications.add(plyId, 'Dit is niet de bedoeling he...');
      return;
    }
    house.searched.add(zoneName);

    const [cancelled] = await Taskbar.create(plyId, 'magnifying-glass', 'Doorzoeken...', 15000, {
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
    if (cancelled) {
      house.searched.delete(zoneName);
      return;
    }

    const lootTable = this.config.lootTables[lootTableId];
    const item = lootTable[Util.getRndInteger(0, lootTable.length)];
    const [itemId] = await Inventory.addItemToPlayer(plyId, item, 1);

    // broken phone in loottable is added as a way for a solo player to consistently get electronics by recycling
    if (item === 'phone') {
      Inventory.setQualityOfItem(itemId, () => 20);
    }

    Util.Log(
      'houserobbery:house:loot',
      {
        houseId,
        item,
        zoneName,
        itemId,
      },
      `${Util.getName(plyId)}(${plyId}) got ${item} from a house robbery`,
      plyId
    );

    if (Util.getRndInteger(1, 1001) <= this.config.moldChance * 10) {
      global.exports['dg-materials'].tryGivingKeyMold(plyId);
    }
  };

  public getRobableHouse = () => {
    const robableHouse = [...this.houseStates.entries()].filter(([_, state]) => state.state === HouseState.FREE);
    if (robableHouse.length == 0) return null;
    const chosenHouse = robableHouse[Util.getRndInteger(0, robableHouse.length)];
    return chosenHouse[0];
  };

  public startJobForPly(cid: number, houseId: string) {
    const group = Jobs.getGroupByCid(cid);
    if (!group) {
      mainLogger.debug(`Could not find job group for player ${cid}`);
      return false;
    }

    const plyId = DGCore.Functions.getPlyIdForCid(cid);
    if (!plyId) return false;

    const couldChange = Jobs.changeGroupJob(plyId, 'houserobbery');
    if (!couldChange) {
      mainLogger.debug(`Could not change job for player ${cid} - ${plyId}`);
      return false;
    }

    const house = this.houseStates.get(houseId);
    if (!house) return false;

    const findTimeout = setTimeout(() => {
      Util.Log(
        'houserobbery:job:findtimeout',
        {
          houseId,
          others: group.members,
        },
        `${Util.getName(plyId)}(${plyId}) timed out finding a house`,
        plyId
      );
      this.failJob(group.id, plyId);
    }, this.config.timeToFind * 60000);

    this.activeJobs.set(group.id, {
      houseId,
      findTimeout,
      finishTimeout: null,
    });
    house.state = HouseState.LOCKED;

    const houseInfo = this.config.locations[house.dataIdx];

    group.members.forEach(m => {
      this.playerStates.set(m.cid, PlayerState.ASSIGNED);
      if (m.serverId !== null) {
        Events.emitNet('houserobbery:client:setSelectedHouse', m.serverId, houseId, houseInfo, this.config.timeToFind);
        Phone.sendMail(
          plyId,
          'Huisinbraak',
          'Bert B.',
          `Je bent geselecteerd voor de job. Je hebt ${this.config.timeToFind}min om binnen te geraken! De locatie staat op je GPS gemarkeerd.`
        );
      }
    });

    // build zone for everyone so other players can also enter
    Events.emitNet('houserobbery:client:buildHouseZone', -1, houseId, houseInfo);

    Util.Log(
      'houserobbery:job:start',
      {
        houseId,
        others: group.members,
      },
      `${Util.getName(plyId)} started a house robbery job`,
      plyId
    );
    mainLogger.debug(`Started job for player ${cid} in house ${JSON.stringify(houseInfo.coords)}`);
    return true;
  }

  private failJob(groupId: string, plyId: number) {
    const activeJob = this.activeJobs.get(groupId);
    if (!activeJob) return;
    const house = this.houseStates.get(activeJob.houseId);
    if (!house) return;

    house.state = HouseState.FREE;

    mainLogger.debug(`${plyId} failed his houserobbery job`);

    this.finishJob(groupId, activeJob.houseId, true);
  }

  private finishJobForPly(plyId: number | null, cid: number, failed = false) {
    this.playerStates.set(cid, PlayerState.COOLDOWN);

    setTimeout(() => {
      if (this.playerStates.has(cid)) {
        this.playerStates.set(cid, PlayerState.WAITING);
      }
    }, this.config.playerCooldown * 60000);

    if (plyId) {
      Events.emitNet('houserobbery:client:cleanup', plyId);

      Phone.sendMail(
        plyId,
        'Taak voltooid',
        'Bert B.',
        failed
          ? 'Je deed er te lang over! Ik zal je taak overhandige aan een echte professional'
          : 'Je hebt je taak volbracht, ik laat je staan op de lijst voor een nieuwe opdracht'
      );
    }
  }

  private finishJob(groupId: string, houseId: string, failed = false) {
    const house = this.houseStates.get(houseId);
    if (!house) return;
    const activeJob = this.activeJobs.get(groupId);
    if (!activeJob) return;

    this.activeJobs.delete(groupId);

    const group = Jobs.getGroupById(groupId);
    if (group) {
      if (group.owner.serverId) {
        Jobs.changeGroupJob(group.owner.serverId, null);
      }
      group.members.forEach(m => {
        this.finishJobForPly(m.serverId, m.cid, failed);
      });
    }

    Util.Log(
      'houserobbery:job:finish',
      {
        houseId,
        members: group?.members ?? 'No members defined',
      },
      `${group?.owner.name ?? 'unknown group owner'} finished his house robbery job`
    );
    house.state = HouseState.COOLDOWN;
    setTimeout(() => {
      house.state = HouseState.FREE;

      // destroy zone for everyone when job is finished
      Events.emitNet('houserobbery:client:destroyHouseZone', -1, houseId);
    }, 10 * 60000);
  }

  public cleanupPlayer(plyId: number | null) {
    if (plyId == null) return;
    Events.emitNet('houserobbery:client:cleanup', plyId);
  }

  public handlePlayerLeft = (cid: number) => {
    this.playerStates.delete(cid);
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
