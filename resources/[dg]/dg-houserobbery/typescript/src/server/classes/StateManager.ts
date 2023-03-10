import { Events, Jobs, Notifications, Phone, Taskbar, Util, Inventory, Police, Minigames } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { mainLogger } from '../sv_logger';
import { getConfig, getLocations } from 'services/config';

@RPCRegister()
@EventListener()
class StateManager extends Util.Singleton<StateManager>() {
  private signedInPlayers: Set<number>;
  private timedOutPlayers: Set<number>;
  private activeHouses: Map<string, Houserobbery.HouseState>;
  private usedLocations: Set<number>; // used to ensure a house doesnt get chosen more than once per restart

  constructor() {
    super();
    this.signedInPlayers = new Set();
    this.timedOutPlayers = new Set();
    this.activeHouses = new Map();
    this.usedLocations = new Set();
  }

  public getUnusedLocation = (): Houserobbery.Location | undefined => {
    const locationsPerSize = getLocations();
    const shellInfo = getConfig().shellInfo;

    const sizes = Object.keys(locationsPerSize) as Houserobbery.Interior.Size[];
    const filteredSizes = sizes.filter(size => !!shellInfo[size]);

    const choosenSize = filteredSizes[Math.floor(Math.random() * filteredSizes.length)];
    const locations = locationsPerSize[choosenSize];

    let tries = locations.length;
    while (tries > 0) {
      tries--;

      const idx = Math.floor(Math.random() * locations.length);
      if (!this.usedLocations.has(idx)) {
        return { size: choosenSize, coords: locations[idx] };
      }
    }
  };

  // Get signed in players who are not timed out & not in provided skipply array
  public getPossibleTargets = (playersToSkip: number[]) => {
    const cids: number[] = [];
    for (const cid of this.signedInPlayers) {
      if (this.timedOutPlayers.has(cid)) continue;
      if (playersToSkip.indexOf(cid) !== -1) continue;
      cids.push(cid);
    }
    return cids;
  };

  private getHouseIdByGroupId = (groupId: string) => {
    for (const [houseId, house] of this.activeHouses) {
      if (house.groupId === groupId) {
        return houseId;
      }
    }
  };

  @DGXEvent('houserobbery:server:toggleSignedIn')
  private _toggleSignedIn = async (src: number) => {
    const cid = Util.getCID(src);

    // can always sign out if already signed in
    if (this.signedInPlayers.has(cid)) {
      this.signedInPlayers.delete(cid);
      Util.Log('houserobbery:signin:logout', {}, `${Util.getName(src)} left the queue for houserobberies`, src);
      Notifications.add(src, 'Bert B: "Ik heb je van de lijst gehaald"', 'info');
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

    this.signedInPlayers.add(cid);
    Notifications.add(src, 'Bert B: "Ik heb je op de lijst gezet, hou je mail in de gaten"', 'success');
    Util.Log('houserobbery:signin:login', {}, `${Util.getName(src)} joined the queue for houserobberies`, src);
  };

  @RPCEvent('houserobbery:server:canEnter')
  private _canEnter = (plyId: number, houseId: string) => {
    const house = this.activeHouses.get(houseId);
    if (!house) return false;
    if (Jobs.getCurrentJob(plyId) === 'police') return true;
    return !house.locked;
  };

  @DGXEvent('houserobbery:server:unlockHouse')
  private _unlockDoor = async (plyId: number, houseId: string, holdingCrowbar: boolean) => {
    const house = this.activeHouses.get(houseId);
    if (!house) return;

    if (!house.locked) {
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
    if (!house.locked) return;

    if (!keygameSuccess) {
      if (Util.getRndInteger(0, 101) < 10) {
        Inventory.removeItemByNameFromPlayer(plyId, 'lockpick');
      } else {
        Notifications.add(plyId, 'Je bent uitgeschoven', 'error');
        Police.addBloodDrop(plyId);
      }
      return;
    }

    house.locked = false;
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
      title: 'Poging tot inbraak',
      description: 'Er was een verdacht persoon aan een huisdeur aan het prutsen',
      blip: {
        sprite: 418,
        color: 3,
      },
      criminal: plyId,
      coords: house.location.coords,
    });

    if (house.findTimeout) {
      clearTimeout(house.findTimeout);
    }
    house.findTimeout = null;

    house.finishTimeout = setTimeout(() => {
      this.finishJob(houseId, true);
    }, getConfig().timeToRob * 60000);
  };

  @DGXEvent('houserobbery:server:lockDoor')
  private _lockDoor = (plyId: number, houseId: string) => {
    if (Jobs.getCurrentJob(plyId) !== 'police') {
      Notifications.add(plyId, 'Je hebt hier geen toegang toe', 'error');
      return;
    }

    const house = this.activeHouses.get(houseId);
    if (!house) return;
    if (house.locked) {
      Notifications.add(plyId, 'Deze deur is al vast', 'error');
      return;
    }

    house.locked = true;

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
    const house = this.activeHouses.get(houseId);
    if (!house) return;

    house.insidePlayers.add(plyId);

    Util.Log(
      'houserobbery:house:enter',
      {
        houseId,
      },
      `${Util.getName(plyId)}(${plyId}) entered a house for a robbery`,
      plyId
    );
  };

  public getHousePlayerIsIn = (plyId: number) => {
    for (const [houseId, house] of this.activeHouses) {
      if (house.insidePlayers.has(plyId)) {
        return houseId;
      }
    }
  };

  @DGXEvent('houserobbery:server:leaveHouse')
  private leaveHouse = (plyId: number, houseId: string) => {
    const house = this.activeHouses.get(houseId);
    if (!house) return;

    house.insidePlayers.delete(plyId);

    Util.Log(
      'houserobbery:house:leave',
      {
        houseId,
      },
      `${Util.getName(plyId)}(${plyId}) left a house for a robbery`,
      plyId
    );
  };

  @DGXEvent('houserobbery:server:doLootZone')
  private _doLootZone = async (plyId: number, houseId: string, zoneName: string, lootTableId = 0) => {
    const house = this.activeHouses.get(houseId);
    if (!house) return;

    const hasObject = await Inventory.hasObject(plyId);
    if (hasObject) {
      Notifications.add(plyId, 'Je hebt nog iets vast...', 'error');
      return false;
    }

    if (!house.insidePlayers.has(plyId)) return;
    if (house.searchedZones.has(zoneName)) {
      Notifications.add(plyId, 'Deze plek is al eens doorzocht...', 'error');
      return;
    }

    if (Jobs.isWhitelisted(plyId, 'police')) {
      Notifications.add(plyId, 'Dit is niet de bedoeling he...');
      return;
    }

    house.searchedZones.add(zoneName);

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
      house.searchedZones.delete(zoneName);
      return;
    }

    const lootTable = getConfig().lootTables[lootTableId];
    const item = lootTable[Math.floor(Math.random() * lootTable.length)];
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

    if (Util.getRndInteger(1, 1001) <= getConfig().moldChance * 10) {
      global.exports['dg-materials'].tryGivingKeyMold(plyId);
    }

    const shellInfo = getConfig().shellInfo[house.location.size];
    if (shellInfo) {
      const amountOfLootZones = shellInfo.lootZones;
      if (house.searchedZones.size >= amountOfLootZones) {
        this.finishJob(houseId);
      }
    }
  };

  public startJobForPly(cid: number, location: Houserobbery.Location) {
    const group = Jobs.getGroupByCid(cid);
    if (!group) {
      mainLogger.debug(`could not find job group for player ${cid}`);
      return false;
    }

    const plyId = DGCore.Functions.getPlyIdForCid(cid);
    if (!plyId) {
      mainLogger.debug(`player ${cid} was no longer online to start job`);
      return false;
    }

    if (this.getHouseIdByGroupId(group.id)) {
      mainLogger.debug(`player group was already busy`);
      return false;
    }

    const couldChange = Jobs.changeGroupJob(plyId, 'houserobbery');
    if (!couldChange) {
      mainLogger.debug(`could not change job for group of player ${cid} - ${plyId}`);
      return false;
    }

    let houseId = Util.uuidv4();
    while (this.activeHouses.has(houseId)) {
      houseId = Util.uuidv4();
    }

    const timeToFind = getConfig().timeToFind;

    this.activeHouses.set(houseId, {
      searchedZones: new Set(),
      insidePlayers: new Set(),
      location,
      locked: true,
      groupId: group.id,
      findTimeout: setTimeout(() => {
        this.finishJob(houseId, true);
      }, timeToFind * 60 * 1000),
      finishTimeout: null,
    });

    Events.emitNet('houserobbery:client:activateLocation', -1, houseId, location);

    group.members.forEach(m => {
      if (m.serverId === null) return;
      Events.emitNet('houserobbery:client:setSelectedHouse', m.serverId, houseId, location.coords, timeToFind);
    });

    Util.Log(
      'houserobbery:job:start',
      {
        houseId,
        location,
        others: group.members,
      },
      `${Util.getName(plyId)}(${plyId}) started a house robbery job`,
      plyId
    );
    mainLogger.debug(`Started job for player ${cid} in house ${JSON.stringify(location)}`);

    return true;
  }

  private finishJobForPly(plyId: number | null, cid: number, failed = false) {
    this.timedOutPlayers.add(cid);
    setTimeout(() => {
      this.timedOutPlayers.delete(cid);
    }, getConfig().playerCooldown * 60 * 1000);

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

  private finishJob(houseId: string, failed = false) {
    const house = this.activeHouses.get(houseId);
    if (!house) return;

    if (house.finishTimeout) {
      clearTimeout(house.finishTimeout);
    }

    const group = Jobs.getGroupById(house.groupId);
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

    setTimeout(() => {
      this.activeHouses.delete(houseId);
      Events.emitNet('houserobbery:client:deactivateLocation', -1, houseId);
    }, 10 * 60000);
  }

  public cleanupPlayer(plyId: number | null) {
    if (plyId == null) return;
    Events.emitNet('houserobbery:client:cleanup', plyId);
  }

  public handlePlayerLeft = (plyId: number, cid: number) => {
    this.signedInPlayers.delete(cid);

    // If ply is in house when ply leaves, remove from inside plys
    const houseId = this.getHousePlayerIsIn(plyId);
    if (houseId) {
      this.leaveHouse(plyId, houseId);
    }
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
