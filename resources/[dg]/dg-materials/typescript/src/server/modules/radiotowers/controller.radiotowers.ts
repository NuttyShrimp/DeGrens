import { Events, Inventory, Notifications, Police, RPC, Sounds, Taskbar, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { mainLogger } from 'sv_logger';
import {
  debugTowerPlayers,
  getTowerPlyAt,
  getTowerState,
  playerLeftTower,
  resetTowerState,
  setPlayerAtTower,
  setTowerState,
  tryToSpawnTowerPeds,
} from './service.radiotowers';
import { radioTowerLogger } from './logger.radiotowers';

Events.onNet('materials:radiotower:entered', (plyId: number, towerId: string) => {
  setPlayerAtTower(towerId, plyId);
  tryToSpawnTowerPeds(towerId, plyId);
});

Events.onNet('materials:radiotower:left', (plyId: number, towerId: string) => {
  playerLeftTower(towerId, plyId);
});

RPC.register('materials:radiotower:canDisable', (src: number, towerId: string) => {
  return !getTowerState(towerId).disabled;
});

Events.onNet('materials:radiotower:disable', (src: number, towerId: string) => {
  if (getTowerState(towerId).disabled) return;
  setTowerState(towerId, 'disabled', true);

  const coords = getConfig().radiotowers.towers[towerId].position;
  Police.createDispatchCall({
    tag: '10-31',
    title: 'Onbevoegde persoon aan vliegveld radiotoren',
    description: 'Er is een onbevoegde persoon gespot aan de radiotoren op het vliegveld',
    coords,
    criminal: src,
    blip: {
      sprite: 307,
      color: 11,
    },
  });

  const configTimeout = getConfig().radiotowers.timeout;
  const timeout = Util.getRndInteger(configTimeout - 30, configTimeout + 30);
  setTimeout(() => {
    resetTowerState(towerId, false);
  }, timeout * 60 * 1000);
});

Events.onNet('materials:radiotowers:override', (src: number, towerId: string, key: Materials.Radiotowers.Action) => {
  if (key !== 'overrideOne' && key !== 'overrideTwo') return;

  if (!getTowerState(towerId).disabled) {
    Notifications.add(src, 'Knop staat uit', 'error');
    return;
  }

  if (getTowerState(towerId)[key]) {
    Notifications.add(src, 'Al ingedrukt', 'error');
    return;
  }

  setTowerState(towerId, key, true);
  setTimeout(() => {
    const { overrideOne, overrideTwo } = getTowerState(towerId);
    const overrideSuccess = overrideOne && overrideTwo;

    const soundPosition = getConfig().radiotowers.towers[towerId].actions.find(a => a.action === key)?.position;
    if (soundPosition) {
      const soundName = overrideSuccess ? 'Keycard_Success' : 'Keycard_Fail';
      Sounds.playFromCoord(
        `radiotower_${key}_${towerId}`,
        soundName,
        'DLC_HEISTS_BIOLAB_FINALE_SOUNDS',
        soundPosition,
        10
      );
    }

    if (!overrideSuccess) {
      setTowerState(towerId, key, false);
    }
  }, 1000);
});

Events.onNet('materials:radiotowers:loot', async (src: number, towerId: string) => {
  const towerState = getTowerState(towerId);
  if (!towerState.pedsSpawned || !towerState.disabled || !towerState.overrideOne || !towerState.overrideTwo) {
    Notifications.add(src, 'Hier zit nog spanning op', 'error');
    return;
  }

  if (towerState.looted) {
    Notifications.add(src, 'Hier is niks meer te vinden', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'screwdriver', 'Onderdelen nemen', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'missmechanic',
      anim: 'work_base',
      flags: 1,
    },
  });
  if (canceled) return;

  if (towerState.looted) {
    Notifications.add(src, 'Hier is niks meer te vinden', 'error');
    return;
  }

  const item = await Inventory.getFirstItemOfName('player', String(Util.getCID(src)), 'screwdriver');
  if (!item) return;
  Inventory.setQualityOfItem(item.id, oldQuality => oldQuality - 50);

  setTowerState(towerId, 'looted', true);
  Inventory.addItemToPlayer(src, 'material_electronics', getConfig().radiotowers.amountOfItems);
  Util.Log('materials:radiotower:loot', { towerId }, `${Util.getName(src)} has looted a radiotower`, src);
  mainLogger.info(`Radiotower ${towerId} has been looted by ${src}`);
});

// we delete spawned peds after 10 min
Events.onNet('materials:radiotower:despawnPeds', (plyId, pedNetIds: number[]) => {
  const peds = pedNetIds.map(netId => ({ netId, entity: NetworkGetEntityFromNetworkId(netId) }));

  setTimeout(() => {
    for (const ped of peds) {
      if (
        DoesEntityExist(ped.entity) &&
        GetEntityType(ped.entity) === 1 &&
        NetworkGetNetworkIdFromEntity(ped.entity) === ped.netId
      ) {
        DeleteEntity(ped.entity);
        radioTowerLogger.debug(`Deleted ped for tower ${ped.netId}`);
      }
    }
  }, 10 * 60 * 1000);
});

Util.onPlayerUnloaded(plyId => {
  const towerId = getTowerPlyAt(plyId);
  if (!towerId) return;
  playerLeftTower(towerId, plyId);
});

RegisterCommand(
  'radiotower:debug',
  () => {
    debugTowerPlayers();
  },
  true
);
