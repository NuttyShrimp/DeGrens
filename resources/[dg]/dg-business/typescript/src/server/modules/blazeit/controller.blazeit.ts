import { Events, Inventory, Notifications, Taskbar, Financials, UI, TaxIds, Util } from '@dgx/server';
import { getBusinessByName } from 'services/business';
import { getExtraConfig } from 'services/config';
import { BLAZEIT_VENDING_INVENTORY } from '../../../shared/modules/constants.blazeit';

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

Events.onNet('business:blazeit:checkVending', async plyId => {
  const blazeitBusiness = getBusinessByName('blazeit');
  if (!blazeitBusiness) return;

  if (blazeitBusiness.getSignedInPlayers().size > 0) {
    Notifications.add(plyId, 'Er is een medewerker aanwezig', 'error');
    return;
  }

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Product Kopen',
      icon: 'basket-shopping',
      disabled: true,
    },
  ];

  for (const [item, data] of blazeitBusiness.getPriceItems()) {
    menuEntries.push({
      title: `${data.label} | €${Financials.getTaxedPrice(data.price, TaxIds.Goederen).taxPrice}`,
      callbackURL: 'business/blazeit/buyFromVending',
      data: {
        item,
      },
      preventCloseOnClick: true,
    });
  }

  UI.openContextMenu(plyId, menuEntries);
});

Events.onNet('business:blazeit:buyFromVending', async (plyId, item: string) => {
  const blazeitBusiness = getBusinessByName('blazeit');
  if (!blazeitBusiness) return;

  if (blazeitBusiness.getSignedInPlayers().size > 0) {
    Notifications.add(plyId, 'Er is een medewerker aanwezig', 'error');
    return;
  }

  const itemData = blazeitBusiness.getPriceItems().get(item);
  if (!itemData) {
    Notifications.add(plyId, 'Dit wordt niet verkocht', 'error');
    return;
  }

  const cid = Util.getCID(plyId);
  const accId = Financials.getDefaultAccountId(cid);
  if (!accId) {
    Notifications.add(plyId, 'Je hebt geen bankaccount', 'error');
    return;
  }

  // if stash had this item in stock, the money goes to the business else to state
  const targetItem = await Inventory.getFirstItemOfName('stash', BLAZEIT_VENDING_INVENTORY, item);

  const purchaseComment = `Aankoop ${itemData.label} uit BlazeIt Automaat`;
  if (targetItem) {
    const transferSuccess = await Financials.transfer(
      accId,
      blazeitBusiness.getInfo().bank_account_id,
      cid,
      cid,
      itemData.price,
      purchaseComment,
      TaxIds.Goederen
    );
    if (!transferSuccess) return;

    Inventory.moveItemToPlayer(plyId, targetItem.id);
    Inventory.showItemBox(plyId, targetItem.name, '1x Ontvangen');
  } else {
    const paymentSuccess = await Financials.purchase(accId, cid, itemData.price, purchaseComment, TaxIds.Goederen);
    if (!paymentSuccess) return;

    Inventory.addItemToPlayer(plyId, item, 1);
  }
});
