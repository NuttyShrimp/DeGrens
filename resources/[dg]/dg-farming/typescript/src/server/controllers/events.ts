import { Auth, Events, Inventory, Notifications, Taskbar, UI, Util } from '@dgx/server';
import config from '../services/config';
import plantManager from 'classes/plantmanager';

Auth.onAuth(plyId => {
  const plantModels = [config.defaultPlant.model, ...Object.values(config.seeds).map(s => s.model)].map(
    m => GetHashKey(m) >>> 0
  );
  Events.emitNet('farming:client:init', plyId, config.farmingZones, plantModels);
});

Inventory.registerUseable<{ liter: number }>('farming_bucket', async (plyId, itemState) => {
  const maxLiter = config.bucketFillAmount;
  if (itemState.metadata.liter === maxLiter) {
    Notifications.add(plyId, 'De emmer zit al vol', 'error');
    return;
  }

  const isInWater = await Util.isPlayerInWater(plyId);
  if (!isInWater) {
    Notifications.add(plyId, 'Waar ga je dit vullen?', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'bucket', 'Vullen...', 7500, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 1,
    },
  });
  if (canceled) return;

  Inventory.setMetadataOfItem(itemState.id, () => ({ liter: maxLiter }));
});

Events.onNet('farming:seed:place', async (plyId: number, itemId: string, plantCoords: Vec3) => {
  const itemState = Inventory.getItemStateById(itemId);
  const hasItem = await Inventory.doesPlayerHaveItemWithId(plyId, itemId);
  if (!itemState || !hasItem) {
    Notifications.add(plyId, 'Je hebt het zaadje niet meer', 'error');
    return;
  }

  Inventory.destroyItem(itemState.id);
  plantManager.addPlant(itemState.name, plantCoords);
});

Events.onNet('farming:plant:view', async (plyId, plantId: number) => {
  const plant = plantManager.getPlant(plantId);
  if (!plant) return;

  const itemLabel = Inventory.getItemData(plant.seed.replace('_seed', ''))?.label;
  const plyItems = await Inventory.getPlayerItems(plyId);

  const hasWaterBucket = plyItems.some(
    (i: Inventory.ItemState<{ liter: number }>) => i.name === 'farming_bucket' && (i.metadata.liter ?? 0) > 0
  );
  const hasFertilizer = plyItems.some(i => i.name === 'farming_fertilizer');
  const hasDeluxeFertilizer = plyItems.some(i => i.name === 'farming_fertilizer_deluxe');

  const growth = plant.getGrowthPercentage();

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: itemLabel ?? 'Unknown',
      description: `${growth}% volgroeid`,
      disabled: true,
    },
  ];

  if (!plant.hasActionBeenDone('cut')) {
    menuEntries.push({
      title: 'Bijknippen',
      callbackURL: 'farming/cut',
      icon: 'scissors',
      data: {
        plantId,
      },
    });
  }

  if (hasWaterBucket && !plant.hasActionBeenDone('water')) {
    menuEntries.push({
      title: 'Water Geven',
      callbackURL: 'farming/water',
      icon: 'bucket',
      data: {
        plantId,
      },
    });
  }

  const feedSubmenuEntries: ContextMenu.Entry[] = [];
  if (hasFertilizer && !plant.hasActionBeenDone('feed')) {
    feedSubmenuEntries.push({
      title: 'Plantenvoeding',
      callbackURL: 'farming/feed',
      data: {
        plantId,
        deluxe: false,
      },
    });
  }
  if (hasDeluxeFertilizer && !plant.hasActionBeenDone('feedDeluxe')) {
    feedSubmenuEntries.push({
      title: 'Deluxe Plantenvoeding',
      callbackURL: 'farming/feed',
      data: {
        plantId,
        deluxe: true,
      },
    });
  }

  if (feedSubmenuEntries.length !== 0) {
    menuEntries.push({
      title: 'Voeding Geven',
      submenu: feedSubmenuEntries,
      icon: 'plant-wilt',
    });
  }

  if (plant.canHarvest()) {
    menuEntries.push({
      title: 'Oogsten',
      callbackURL: 'farming/harvest',
      icon: 'shovel',
      data: {
        plantId,
      },
    });
  }

  Util.Log('farming:plant:view', { plantId }, `${Util.getName(plyId)} has viewed a plant`, plyId);

  UI.openContextMenu(plyId, menuEntries);
});
