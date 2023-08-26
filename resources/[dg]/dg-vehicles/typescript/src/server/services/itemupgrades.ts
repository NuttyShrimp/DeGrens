import { Events, Util, Notifications, Taskbar, Inventory } from '@dgx/server';
import { getVehicleItemUpgrades, updateVehicleItemUpgrades } from 'db/repository';
import { getCurrentVehicle, getVinForNetId, getVinForVeh } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { saveCosmeticUpgrades } from 'modules/upgrades/service.upgrades';

const ITEMUPGRADE_ITEMS: Record<Vehicles.ItemUpgrade, string> = {
  neon: 'neon_strip',
  xenon: 'xenon_lights',
};

Inventory.registerUseable('rgb_controller', async plyId => {
  const vehicle = getCurrentVehicle(plyId, true);
  if (!vehicle) {
    Notifications.add(plyId, 'Je moet als bestuurder in een voertuig zitten hiervoor', 'error');
    return;
  }

  const vin = getVinForVeh(vehicle);
  if (!vin || (!vinManager.isVinFromPlayerVeh(vin) && !Util.isDevEnv())) {
    Notifications.add(plyId, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  const installedItems = await getVehicleItemUpgrades(vin);
  if (installedItems.length === 0) {
    Notifications.add(plyId, 'Er is niks geinstalleerd op het voertuig', 'error');
    return;
  }

  Events.emitNet('vehicles:itemupgrades:openMenu', plyId, installedItems);
});

Events.onNet('vehicles:itemupgrades:install', async (plyId: number, netId: number, item: Vehicles.ItemUpgrade) => {
  const vin = getVinForNetId(netId);
  if (!vin || (!vinManager.isVinFromPlayerVeh(vin) && !Util.isDevEnv())) {
    Notifications.add(plyId, 'Dit voertuig is niet van een burger', 'error');
    return;
  }

  const installedItems = await getVehicleItemUpgrades(vin);
  if (installedItems.indexOf(item) !== -1) {
    Notifications.add(plyId, 'Dit is al geinstalleerd op het voertuig', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'screwdriver', 'Installeren', 15000, {
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

  const removedItem = await Inventory.removeItemByNameFromPlayer(plyId, ITEMUPGRADE_ITEMS[item]);
  if (!removedItem) return;

  updateVehicleItemUpgrades(vin, [...installedItems, item]);
  Notifications.add(plyId, `Gebruik een RGB Controller om de ${item} te configureren`, 'success');

  Util.Log(
    'vehicles:itemupgrades:install',
    {
      vin,
      item,
    },
    `${Util.getName(plyId)}(${plyId}) has installed ${item} on vehicle ${vin}`
  );
});

Events.onNet(
  'vehicles:itemupgrades:save',
  async (plyId: number, netId: number, upgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades>) => {
    const vin = getVinForNetId(netId);
    if (!vin) return;

    // make sure this event only updates item upgrades
    const validatedUpgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades> = {};
    for (const key of Object.keys(ITEMUPGRADE_ITEMS) as Vehicles.ItemUpgrade[]) {
      //@ts-ignore we know both value types are same when keys are same but ts wont recognize
      validatedUpgrades[key] = upgrades[key];
    }

    saveCosmeticUpgrades(vin, upgrades);

    Util.Log(
      'vehicles:itemupgrades:change',
      {
        vin,
        upgrades,
      },
      `${Util.getName(plyId)}(${plyId}) has changed itemupgrades of vehicle ${vin}`
    );
  }
);
