import { Events, Inventory, Notifications, Police, RPC, Sounds, Taskbar, Util } from '@dgx/server';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import { getTowerState, resetTowerState, setTowerState, tryToSpawnTowerPeds } from './service.radiotowers';

Events.onNet('materials:radiotower:entered', (_, towerId: string) => {
  tryToSpawnTowerPeds(towerId);
});

RPC.register('materials:radiotower:canDisable', (src: number, towerId: string) => {
  return !getTowerState(towerId).disabled;
});

Events.onNet('materials:radiotower:disable', (src: number, towerId: string) => {
  if (getTowerState(towerId).disabled) return;
  setTowerState(towerId, 'disabled', true);

  const coords = config.radiotowers.towers[towerId].position;
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

  const configTimeout = config.radiotowers.timeout;
  const timeout = Util.getRndInteger(configTimeout - 5, configTimeout + 5);
  setTimeout(
    () => {
      resetTowerState(towerId, false);
    },
    timeout * 60 * 1000
  );
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

    const soundPosition = config.radiotowers.towers[towerId].actions.find(a => a.action === key)?.position;
    if (soundPosition) {
      Sounds.playSuccessSoundFromCoord(soundPosition, overrideSuccess);
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
  Inventory.addItemToPlayer(src, 'material_electronics', config.radiotowers.amountOfItems);

  const logMsg = `${Util.getName(src)} has looted a radiotower ${towerId}`;
  Util.Log('materials:radiotower:loot', { towerId }, logMsg, src);
  mainLogger.info(logMsg);
});
