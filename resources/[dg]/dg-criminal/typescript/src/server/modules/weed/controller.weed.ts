import { Events, Inventory, Notifications, RPC, Util } from '@dgx/server';
import { getConfig } from 'services/config';
import { weedLogger } from './logger.weed';
import { addNewPlant, canCutPlant, cutPlant, feedPlant, removePlant } from './service.weed';

Inventory.registerUseable('weed_seed', (plyId, itemState) => {
  Events.emitNet('criminal:weed:plant', plyId, itemState.id);
});

Events.onNet('criminal:weed:add', (src: number, itemId: string, coords: Vec3) => {
  const itemState = Inventory.getItemStateById(itemId);
  if (!itemState) {
    Notifications.add(src, 'Dit item bestaat niet meer', 'error');
    return;
  }
  Inventory.destroyItem(itemState.id);
  const gender = itemState.metadata.gender as Criminal.Weed.Gender | undefined;
  if (!gender) {
    Notifications.add(src, 'Dit zaadje is kapot', 'error');
    return;
  }
  addNewPlant(src, coords, gender);
});

Events.onNet('criminal:weed:feed', async (src: number, id: number) => {
  const removed = await Inventory.removeItemFromPlayer(src, 'plant_fertilizer');
  if (!removed) {
    Notifications.add(src, 'Je hebt geen voeding', 'error');
    return;
  }

  feedPlant(src, id);
  Notifications.add(src, 'Je hebt de plant gevoed', 'success');
});

Events.onNet('criminal:weed:destroy', (src: number, id: number) => {
  removePlant(id);
  weedLogger.silly(`Player ${src} has fed a weed plant`);
  Util.Log('weed:destroy', { plantId: id }, `${Util.getName(src)} has destroyed a weed plant`, src);
});

RPC.register('criminal:weed:canCut', (src: number, id: number) => {
  return canCutPlant(id);
});

Events.onNet('criminal:weed:cut', (src: number, id: number) => {
  if (!canCutPlant(id)) return;
  cutPlant(src, id);
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
