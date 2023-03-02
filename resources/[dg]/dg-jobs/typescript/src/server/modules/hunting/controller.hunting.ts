import { Events, Inventory, Notifications } from '@dgx/server';
import { lootAnimal, sellItem, startHuntingJobForPlayer, tryToPlaceBait } from './service.hunting';

Events.onNet('jobs:hunting:signIn', (src: number) => {
  startHuntingJobForPlayer(src);
});

Inventory.registerUseable('hunting_bait', (plyId, itemState) => {
  const ped = GetPlayerPed(String(plyId));
  const vehicle = GetVehiclePedIsIn(ped, false);
  if (vehicle) {
    Notifications.add(plyId, 'Je kan dit niet vanuit een voertuig', 'error');
    return;
  }

  tryToPlaceBait(plyId, itemState.id);
});

Events.onNet('jobs:hunting:loot', (plyId: number, animalNetId: number) => {
  lootAnimal(plyId, animalNetId);
});

Inventory.onInventoryUpdate(
  'player',
  (identifier, _, itemState) => {
    if (itemState.inventory !== Inventory.concatId('stash', 'hunting_sell')) return;
    const cid = Number(identifier);
    const plyId = DGCore.Functions.getPlyIdForCid(cid);
    if (!plyId) return;
    sellItem(plyId, itemState);
  },
  undefined,
  'remove'
);
