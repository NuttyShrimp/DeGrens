import { Events, Inventory, Minigames, Notifications, Npcs, Police, Sounds, Taskbar, Util } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/src/decorators';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { getRandomValidIdx } from './helpers.portrobbery';

@EventListener()
@RPCRegister()
class PortRobberyManager {
  private readonly logger: winston.Logger;

  private readonly codePeds: Map<number, { used: boolean }>;
  private readonly activeCodes: Set<number>;

  private activeLocations: Map<number, { openingPlayer: number | null }>;

  constructor() {
    this.logger = mainLogger.child({ module: 'PortRobbery' });

    this.codePeds = new Map();
    this.activeCodes = new Set();

    this.activeLocations = new Map();
  }

  public startCodePedThread = () => {
    setInterval(
      () => {
        // we add new first because removing used as an artificial timeout to not instantly add a new one, when a used one gets removed
        this.tryAddingNewCodePed();
        this.removeUsedCodePeds();
      },
      Util.isDevEnv() ? 10000 : config.portrobbery.code.scheduleDelay * 60 * 1000
    );
  };

  private removeUsedCodePeds = () => {
    const playerCoords = Util.getAllPlayers().map(ply => Util.getPlyCoords(ply));

    for (const [idx, codePed] of this.codePeds) {
      if (!codePed.used) continue;
      if (playerCoords.some(plyCoord => plyCoord.distance(config.portrobbery.code.peds[idx]) < 75)) continue;

      this.logger.debug(`Removing codeped ${idx}`);
      this.codePeds.delete(idx);
      Npcs.remove(`portrobbery_code_ped_${idx}`);
    }
  };

  private tryAddingNewCodePed = () => {
    if (this.codePeds.size >= config.portrobbery.code.maxActive) return;

    const codePedIdx = getRandomValidIdx(config.portrobbery.code.peds, idx => !this.codePeds.has(idx));
    if (codePedIdx === undefined) {
      this.logger.warn('No code ped idx available');
      return;
    }

    this.codePeds.set(codePedIdx, { used: false });
    Npcs.add({
      id: `portrobbery_code_ped_${codePedIdx}`,
      position: config.portrobbery.code.peds[codePedIdx],
      model: 's_m_m_security_01',
      distance: 50,
      settings: {
        invincible: true,
        freeze: true,
        collision: true,
        ignore: true,
      },
      flags: {
        isPortrobberyCodePed: true,
        portrobberyCodePedIdx: codePedIdx,
      },
    });

    if (Util.isDevEnv()) {
      const target = GetPlayerFromIndex(0);
      if (target) {
        Util.setWaypoint(+target, config.portrobbery.code.peds[codePedIdx]);
      }
    }
  };

  @DGXEvent('materials:portrobbery:requestCode')
  private _requestCode = (plyId: number, codePedIdx: number) => {
    const codePed = this.codePeds.get(codePedIdx);
    if (!codePed) return;

    if (codePed.used) {
      Notifications.add(plyId, 'Ik heb geen code meer voor je', 'error');
      return;
    }

    codePed.used = true;
    const code = Util.getRndInteger(100000, 999999);
    this.activeCodes.add(code);
    Inventory.addItemToPlayer(plyId, 'paper_note', 1, { code });

    const logMsg = `${Util.getName(plyId)}(${plyId}) has requested portrobbery code ${code}`;
    this.logger.info(logMsg);
    Util.Log('materials:portrobbery:requestCode', { code }, logMsg, plyId);
  };

  @DGXEvent('materials:portrobbery:inputCode')
  private _inputCode = async (plyId: number) => {
    const [_, rawInput] = await Minigames.keypad(plyId);
    const input = +rawInput;
    if (Number.isNaN(input)) return;

    const isCorrect = this.activeCodes.delete(input) || Util.isDevEnv();
    Sounds.playSuccessSoundFromCoord(config.portrobbery.code.inputZone.center, isCorrect);

    if (!isCorrect) return;

    this.addActiveLocation(plyId);
  };

  private addActiveLocation = (plyId: number) => {
    const locationIdx = getRandomValidIdx(config.portrobbery.locations, idx => !this.activeLocations.has(idx));
    if (locationIdx === undefined) {
      this.logger.warn('No location idx available');
      Notifications.add(plyId, 'Er zijn geen containers beschikbaar', 'error');
      return;
    }

    const location = config.portrobbery.locations[locationIdx];
    this.activeLocations.set(locationIdx, { openingPlayer: null });
    Events.emitNet('materials:portrobbery:buildLocationZone', -1, locationIdx, location.coords);

    const camData = config.portrobbery.cams[location.camIdx];
    Events.emitNet('materials:portrobbery:openCam', plyId, camData);

    const logMsg = `${Util.getName(plyId)}(${plyId}) has actived portrobbery location ${locationIdx}`;
    this.logger.info(logMsg);
    Util.Log('materials:portrobbery:activate', { locationIdx }, logMsg, plyId);
  };

  @RPCEvent('materials:portrobbery:canLoot')
  private _canLootLocation = async (plyId: number, locationIdx: number): Promise<boolean> => {
    const location = this.activeLocations.get(locationIdx);
    if (!location || location.openingPlayer !== null) return false;

    const hasItem = await Inventory.doesPlayerHaveItems(plyId, 'angle_grinder');
    if (!hasItem) return false;

    location.openingPlayer = plyId;

    Police.createDispatchCall({
      title: 'Inbraak Havencontainer',
      coords: Util.getPlyCoords(plyId),
      tag: '10-31',
      blip: {
        sprite: 478,
        color: 12,
      },
    });

    return true;
  };

  @DGXEvent('materials:portrobbery:loot')
  private _lootLocation = async (plyId: number, locationIdx: number) => {
    const location = this.activeLocations.get(locationIdx);
    if (!location || location.openingPlayer !== plyId) return;

    const itemsToReceive = this.getLootItems();
    if (!itemsToReceive) {
      Notifications.add(plyId, 'Er is iets foutgelopen', 'error');
      this.removeActiveLocation(locationIdx);
      return;
    }

    const lootTime = Util.isDevEnv() ? 10000 : config.portrobbery.loot.time;
    const itemThread = setInterval(
      async () => {
        const itemToReceive = itemsToReceive.pop();
        if (!itemToReceive) {
          clearInterval(itemThread);
          return;
        }

        const [itemId] = await Inventory.addItemToPlayer(plyId, itemToReceive.name, 1);

        if (itemToReceive.quality !== undefined) {
          Inventory.setQualityOfItem(itemId, () => itemToReceive.quality!);
        }
      },
      Math.floor(lootTime / itemsToReceive.length)
    );

    await Taskbar.create(plyId, 'boxes-stacked', 'Leeghalen', lootTime, {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disableInventory: true,
      disablePeek: true,
      disarm: true,
      controlDisables: {
        combat: true,
        carMovement: true,
        movement: true,
      },
      animation: {
        animDict: 'missexile3',
        anim: 'ex03_dingy_search_case_a_michael',
        flags: 1,
      },
    });
    clearInterval(itemThread);

    this.removeActiveLocation(locationIdx);

    const logMsg = `${Util.getName(plyId)}(${plyId}) has looted portrobbery location ${locationIdx}`;
    this.logger.info(logMsg);
    Util.Log('materials:portrobbery:loot', { locationIdx }, logMsg, plyId);
  };

  private removeActiveLocation = (locationIdx: number) => {
    const success = this.activeLocations.delete(locationIdx);
    if (!success) return;
    Events.emitNet('materials:portrobbery:destroyLocationZone', -1, locationIdx);
  };

  public getInitData = (): Materials.PortRobbery.InitData => {
    const activeLocationZones: Materials.PortRobbery.InitData['activeLocationZones'] = [];
    for (const [idx] of this.activeLocations) {
      activeLocationZones.push({ idx, coords: config.portrobbery.locations[idx].coords });
    }

    return {
      codeInputZone: config.portrobbery.code.inputZone,
      activeLocationZones,
    };
  };

  /**
   * @returns random loot pool index choosen based on each pools weight
   */
  private getLootPoolIdx = () => {
    let rndWeight = Util.getRndInteger(
      0,
      config.portrobbery.loot.pool.reduce((acc, cur) => acc + cur.weight, 0)
    );
    for (let i = 0; i < config.portrobbery.loot.pool.length; i++) {
      rndWeight -= config.portrobbery.loot.pool[i].weight;
      if (rndWeight >= 0) continue;
      return i;
    }
  };

  private getLootItems = () => {
    const lootPoolIdx = this.getLootPoolIdx();
    if (lootPoolIdx === undefined) {
      this.logger.error('Failed to get loot pool idx');
      return;
    }

    const itemsToReceive: { name: string; quality?: number }[] = [];
    const poolItems = config.portrobbery.loot.pool[lootPoolIdx]?.items ?? [];
    for (const poolItem of poolItems) {
      const amount = Array.isArray(poolItem.amount)
        ? Util.getRndInteger(poolItem.amount[0], poolItem.amount[1] + 1)
        : poolItem.amount;
      for (let i = 0; i < amount; i++) {
        itemsToReceive.push({ name: poolItem.name, quality: poolItem.quality });
      }
    }

    return itemsToReceive;
  };
}

const portRobberyManager = new PortRobberyManager();
export default portRobberyManager;
