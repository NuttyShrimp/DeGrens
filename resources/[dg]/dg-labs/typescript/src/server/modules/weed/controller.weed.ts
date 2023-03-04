import { Events, Inventory, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { validateLabType } from 'services/labs';
import {
  canFertilizePlant,
  canHarvestPlant,
  canSearchHarvestedPlant,
  fertilizePlant,
  harvestPlant,
  searchHarvestedPlant,
} from './service.weed';
import config from 'services/config';

RPC.register('labs:weed:canFertilize', (plyId: number, labId: number, plantId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return false;

  return canFertilizePlant(plantId);
});

Events.onNet('labs:weed:fertilize', (plyId: number, labId: number, plantId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return;

  fertilizePlant(plyId, plantId);
});

RPC.register('labs:weed:canHarvest', (plyId: number, labId: number, plantId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return false;

  return canHarvestPlant(plantId);
});

Events.onNet('labs:weed:harvest', (plyId: number, labId: number, plantId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return;

  harvestPlant(plyId, plantId);
});

RPC.register('labs:weed:canSearch', (plyId: number, labId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return false;

  return canSearchHarvestedPlant(plyId);
});

Events.onNet('labs:weed:search', (plyId: number, labId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return;

  searchHarvestedPlant(plyId);
});

Events.onNet('labs:weed:package', async (plyId, labId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return;

  const currentTime = Math.round(Date.now() / 1000);
  const dryConfig = config.weed.dry;
  const items = await Inventory.getPlayerItems(plyId);

  let hasBud = false;
  let budItemId: string | undefined;
  for (const item of items) {
    if (item.name !== 'weed_bud') continue;
    hasBud = true; // just to determine notif

    if (item.metadata.createTime + dryConfig.timeout * 60 * 60 < currentTime) {
      budItemId = item.id;
      break;
    }
  }
  if (!budItemId) {
    Notifications.add(plyId, hasBud ? 'Dit is nog niet droog' : 'Wat wil je verpakken?', 'error');
    return;
  }

  const bagItem = items.find(i => i.name === 'empty_bags');
  if (!bagItem) {
    Notifications.add(plyId, 'Waar ge je dit insteken?', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'hands-holding-diamond', 'Verpakken...', 5000, {
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
      animDict: 'creatures@rottweiler@tricks@',
      anim: 'petting_franklin',
      flags: 0,
    },
  });
  if (canceled) return;

  const removedItems = await Inventory.removeItemsByIdsFromPlayer(plyId, [bagItem.id, budItemId]);
  if (!removedItems) {
    Notifications.add(plyId, 'Je hebt de items niet meer', 'error');
    return;
  }

  const amount = Util.getRndInteger(dryConfig.amount.min, dryConfig.amount.max + 1);
  Inventory.addItemToPlayer(plyId, 'weed_bag', amount);
});

Events.onNet('labs:weed:roll', async (plyId, labId: number) => {
  const validated = validateLabType(plyId, labId, 'weed');
  if (!validated) return;

  const weedBagItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'weed_bag');

  if (!weedBagItem) {
    Notifications.add(plyId, 'Je hebt niks om te rollen', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'joint', 'Rollen...', 5000, {
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
      animDict: 'creatures@rottweiler@tricks@',
      anim: 'petting_franklin',
      flags: 0,
    },
  });
  if (canceled) return;

  const removedItems = await Inventory.removeItemByIdFromPlayer(plyId, weedBagItem.id);
  if (!removedItems) {
    Notifications.add(plyId, 'Je hebt de items niet meer', 'error');
    return;
  }

  Inventory.addItemToPlayer(plyId, 'joint', 1);
});
