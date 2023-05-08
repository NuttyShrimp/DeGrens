import { Events, Inventory, Peek, UI } from '@dgx/client';
import { isSignedInAtBusiness } from 'service/signin';
import { BLAZEIT_VENDING_INVENTORY } from '../../../shared/modules/constants.blazeit';

Peek.addZoneEntry('blazeit_crafting', {
  options: [
    {
      label: 'Buds Verwerken',
      icon: 'fas fa-cannabis',
      items: 'weed_bud',
      action: () => {
        Events.emitNet('business:blazeit:processBud');
      },
      canInteract: (_, __, option) => {
        return isSignedInAtBusiness(option.data.businessName);
      },
    },
    {
      label: 'Product Maken',
      icon: 'fas fa-plus',
      items: 'cbd_bag',
      action: () => {
        Inventory.openBench('blazeit_bench');
      },
      canInteract: (_, __, option) => {
        return isSignedInAtBusiness(option.data.businessName);
      },
    },
  ],
});

Peek.addZoneEntry('blazeit_vending', {
  options: [
    {
      label: 'Bekijk Voorraad',
      icon: 'fas fa-basket-shopping',
      action: () => {
        Events.emitNet('business:blazeit:checkVending');
      },
    },
    {
      label: 'Voorraad Bijvullen',
      icon: 'fas fa-inbox-full',
      action: () => {
        Inventory.openStash(BLAZEIT_VENDING_INVENTORY);
      },
      canInteract: (_, __, option) => {
        return isSignedInAtBusiness(option.data.businessName);
      },
    },
  ],
});

UI.RegisterUICallback('business/blazeit/buyFromVending', (data: { item: string }, cb) => {
  Events.emitNet('business:blazeit:buyFromVending', data.item);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
