import { Events, Inventory, Notifications } from '@dgx/server';
import { MODELS_PER_STAGE } from './constants.weed';
import weedPlantManager from './classes/weedplantmanager';

Inventory.registerUseable('weed_seed', (plyId, itemState) => {
  Events.emitNet('criminal:weed:plant', plyId, itemState.id, MODELS_PER_STAGE[0]);
});

Events.onNet('criminal:weed:add', async (plyId: number, itemId: string, coords: Vec3, rotation: Vec3) => {
  const itemState = Inventory.getItemStateById<{ gender: Criminal.Weed.Gender }>(itemId);
  const hasItem = await Inventory.doesPlayerHaveItemWithId(plyId, itemId);
  if (!itemState || !hasItem) {
    Notifications.add(plyId, 'Je hebt het zaadje niet meer', 'error');
    return;
  }

  Inventory.destroyItem(itemState.id);

  if (!itemState.metadata.gender) {
    Notifications.add(plyId, 'Dit zaadje is kapot', 'error');
    return;
  }
  weedPlantManager.addNew(plyId, coords, rotation, itemState.metadata.gender);
});
