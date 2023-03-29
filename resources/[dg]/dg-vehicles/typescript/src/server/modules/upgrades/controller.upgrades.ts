import { Auth, Config, Events, Inventory, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { getVehicleItemUpgrades, updateVehicleItemUpgrades } from 'db/repository';
import { getVinForNetId, getVinForVeh } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';

import { upgradeItems, windowTintMenuEntries } from './constants.upgrades';
import { upgradesLogger } from './logger.upgrades';
import { applyUpgradesToVeh, getPerformance, saveCosmeticUpgrades } from './service.upgrades';
import { TUNE_PARTS } from '../../../shared/upgrades/constants.upgrades';

const tunesInventoryUpdateTimeouts: Record<string, NodeJS.Timeout> = {};

Events.onNet('vehicles:upgrades:installItem', async (src: number, netId: number, item: keyof typeof upgradeItems) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;

  const veh = NetworkGetEntityFromNetworkId(netId);
  if (Util.getPlyCoords(src).distance(Util.getEntityCoords(veh)) > 4) {
    Notifications.add(src, 'Je staat niet dicht genoeg bij het voertuig', 'error');
    return;
  }

  if (!vinManager.isVinFromPlayerVeh(vin)) {
    Notifications.add(src, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  const installedItems = await getVehicleItemUpgrades(vin);
  if (installedItems.some(i => i === item)) {
    Notifications.add(src, 'Dit is al geinstalleerd op het voertuig', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'screwdriver', 'Installeren', 15000, {
    canCancel: true,
    cancelOnDeath: true,
    disableInventory: true,
    disarm: true,
    controlDisables: {
      movement: true,
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (canceled) return;

  const removedItem = await Inventory.removeItemByNameFromPlayer(src, upgradeItems[item].itemName);
  if (removedItem === false) {
    Notifications.add(src, 'Je hebt dit niet', 'error');
    return;
  }

  installedItems.push(item);
  updateVehicleItemUpgrades(vin, installedItems);
  upgradesLogger.info(`${item} has been installed on vehicle ${vin}`);
  Util.Log(
    'vehicles:item:install',
    {
      vin,
      item,
    },
    `${GetPlayerName(String(src))} installed ${item} to vehicle with VIN ${vin}`
  );
});

Auth.onAuth(async (plyId: number) => {
  await Config.awaitConfigLoad();
  const zone = Config.getConfigValue<{
    itemUpgradesZone: { center: Vec3; length: number; width: number; heading: number };
  }>('vehicles.config')?.itemUpgradesZone;
  if (!zone) {
    upgradesLogger.error('Could not load item upgrades zone config');
    return;
  }
  Events.emitNet('vehicles:itemupgrades:loadZone', plyId, zone);
});

Inventory.registerUseable('rgb_controller', async plyId => {
  const ped = GetPlayerPed(String(plyId));
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh === 0) {
    Notifications.add(plyId, 'Je moet in een voertuig zitten', 'error');
    return;
  }

  if (ped !== GetPedInVehicleSeat(veh, -1)) {
    Notifications.add(plyId, 'Je moet als bestuurder zitten', 'error');
    return;
  }

  const isInZone = await RPC.execute<boolean>('vehicles:itemupgrades:isInZone', plyId);
  if (!isInZone) {
    Notifications.add(plyId, 'Je hebt hier niet de juiste tools', 'error');
    return;
  }

  const netId = NetworkGetNetworkIdFromEntity(veh);
  const vin = getVinForNetId(netId);
  if (!vin) return;

  if (!vinManager.isVinFromPlayerVeh(vin)) {
    Notifications.add(plyId, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  const installedItems = await getVehicleItemUpgrades(vin);
  if (installedItems.length === 0) {
    Notifications.add(plyId, 'Er is niks geinstalleerd op het voertuig', 'error');
    return;
  }

  const menuItems: ContextMenu.Entry[] = [
    {
      title: 'RGB Controller Menu',
      description: 'Manage your installed items!',
      icon: 'lightbulb',
    },
  ];

  installedItems.forEach(item => {
    menuItems.push({
      title: upgradeItems[item].title,
      submenu: upgradeItems[item].menu as ContextMenu.Entry[],
    });
  });

  Events.emitNet('vehicles:itemupgrades:openControllerMenu', plyId, menuItems);
});

Events.onNet(
  'vehicles:itemupgrades:saveChanges',
  async (plyId: number, netId: number, upgrades: Partial<Upgrades.Cosmetic>) => {
    const vin = getVinForNetId(netId);
    if (!vin) return;
    const isInZone = await RPC.execute<boolean>('vehicles:itemupgrades:isInZone', plyId);
    if (!isInZone) return;
    saveCosmeticUpgrades(vin, upgrades);
  }
);

Inventory.registerUseable('window_tint', async plyId => {
  const ped = GetPlayerPed(String(plyId));
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh === 0) {
    Notifications.add(plyId, 'Je moet in een voertuig zitten', 'error');
    return;
  }

  if (ped !== GetPedInVehicleSeat(veh, -1)) {
    Notifications.add(plyId, 'Je moet als bestuurder zitten', 'error');
    return;
  }

  const isInZone = await RPC.execute<boolean>('vehicles:itemupgrades:isInZone', plyId);
  if (!isInZone) {
    Notifications.add(plyId, 'Je hebt hier niet de juiste tools', 'error');
    return;
  }

  const vin = getVinForVeh(veh);
  if (!vin) return;
  if (!vinManager.isVinFromPlayerVeh(vin)) {
    Notifications.add(plyId, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  Events.emitNet('vehicles:windowtint:openMenu', plyId, windowTintMenuEntries);
});

global.exports('getTuneItemNames', (): string[] => {
  return (Object.keys(TUNE_PARTS) as Upgrades.Tune[]).map(tune => `tune_${tune}`);
});

// when spawning car, all tune items would get loaded which would trigger handler like 5 times after eachother
// due to latency on events, wrong upghrades might be applied
Inventory.onInventoryUpdate('tunes', (vin: string) => {
  const existingTimeout = tunesInventoryUpdateTimeouts[vin];
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const newTimeout = setTimeout(async () => {
    delete tunesInventoryUpdateTimeouts[vin];

    const netId = vinManager.getNetId(vin);
    if (!netId) return;

    const performanceUpgrades = await getPerformance(vin);
    if (!performanceUpgrades) return;

    applyUpgradesToVeh(netId, performanceUpgrades);
    Util.Log("vehicles:upgrades:performace", {
      vin,
      performanceUpgrades,
    }, `new performace upgrades for ${vin} have been added`)
  }, 500);
  tunesInventoryUpdateTimeouts[vin] = newTimeout;
});