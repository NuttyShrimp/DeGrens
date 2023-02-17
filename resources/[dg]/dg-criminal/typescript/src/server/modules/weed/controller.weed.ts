import { Events, Inventory, Notifications, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { MODELS_PER_STAGE } from './constants.weed';
import weedPlantManager from './classes/weedplantmanager';

Inventory.registerUseable('weed_seed', (plyId, itemState) => {
  Events.emitNet('criminal:weed:plant', plyId, itemState.id, MODELS_PER_STAGE[0]);
});

Events.onNet('criminal:weed:add', (plyId: number, itemId: string, coords: Vec3, rotation: Vec3) => {
  const itemState = Inventory.getItemByIdFromPlayer(plyId, itemId);
  if (!itemState) {
    Notifications.add(plyId, 'Je hebt het zaadje niet meer', 'error');
    return;
  }
  Inventory.destroyItem(itemState.id);
  const gender = itemState.metadata.gender as Criminal.Weed.Gender | undefined;
  if (!gender) {
    Notifications.add(plyId, 'Dit zaadje is kapot', 'error');
    return;
  }
  weedPlantManager.addNew(plyId, coords, rotation, gender);
});

Inventory.registerUseable('weed_bud', async (src, item) => {
  const bagItem = await Inventory.getFirstItemOfNameOfPlayer(src, 'empty_bags');
  if (!bagItem) {
    Notifications.add(src, 'Waar ga je dit insteken?', 'error');
    return;
  }

  const currentTime = Math.round(Date.now() / 1000);
  const dryConfig = getConfig().weed.dry;
  if (currentTime < item.metadata.createTime + dryConfig.timeout * 60 * 60) {
    Notifications.add(src, 'Dit is nog niet droog', 'error');
    return;
  }

  const amount = Util.getRndInteger(dryConfig.amount.min, dryConfig.amount.max);
  Inventory.destroyItem(bagItem.id);
  Inventory.destroyItem(item.id);
  Inventory.addItemToPlayer(src, 'weed_bag', amount);
});
