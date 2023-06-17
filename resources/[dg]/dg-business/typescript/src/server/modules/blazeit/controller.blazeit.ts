import { Events, Inventory, Notifications, Taskbar } from '@dgx/server';
import { getBusinessByName } from 'services/business';
import { getExtraConfig } from 'services/config';

Events.onNet('business:blazeit:processBud', async plyId => {
  const blazeitBusiness = getBusinessByName('blazeit');
  if (!blazeitBusiness) return;

  if (!blazeitBusiness.isSignedIn(plyId)) {
    Notifications.add(plyId, 'Je bent niet ingeklokt', 'error');
    return;
  }

  const budItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'weed_bud');
  if (!budItem) {
    Notifications.add(plyId, 'Je hebt geen buds', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'hands-holding-diamond', 'Verpakken...', 300, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
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

  const bagsPerBud = getExtraConfig<BlazeIt.Config>('blazeit')?.bagsPerBud;
  if (!bagsPerBud) return;

  const removed = await Inventory.removeItemByIdFromPlayer(plyId, budItem.id);
  if (!removed) {
    Notifications.add(plyId, 'Je hebt dit item niet meer', 'error');
    return;
  }

  Inventory.addItemToPlayer(plyId, 'cbd_bag', bagsPerBud);
});
