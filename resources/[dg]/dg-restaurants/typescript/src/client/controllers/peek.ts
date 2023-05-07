import { Business, Events, Inventory, Peek } from '@dgx/client';
import { openRegisterMenu } from 'services/order';

Peek.addZoneEntry('restaurant_stash', {
  options: [...new Array(5)].map((_, idx) => ({
    label: `Open voorraad #${idx + 1}`,
    icon: 'fas fa-box-open',
    action: option => {
      const stashId = `${option.data.id}_${idx}`;
      Inventory.openStash(stashId, 100);
    },
    canInteract: (_, __, option) => {
      return Business.isEmployee(option.data.id, ['stash']);
    },
  })),
  distance: 3,
});

Peek.addZoneEntry('restaurant_register', {
  options: [
    {
      label: 'Bekijk Aanrecht',
      icon: 'fas fa-box-open',
      action: option => {
        Inventory.openStash(`register_${option.data.id}`);
      },
    },
    {
      label: 'Bestelling',
      icon: 'fas fa-memo',
      action: option => {
        openRegisterMenu(option.data.restaurantId, option.data.registerId);
      },
      canInteract: (_, __, option) => Business.isSignedIn(option.data.restaurantId),
    },
    {
      label: 'Betalen',
      icon: 'fas fa-cash-register',
      action: option => {
        Events.emitNet('restaurants:register:checkBill', option.data.restaurantId, option.data.registerId);
      },
    },
  ],
  distance: 2,
});

Peek.addZoneEntry('restaurant_leftover', {
  options: [
    {
      label: 'Bekijk leftovers',
      icon: 'fas fa-burger-soda',
      action: option => {
        Events.emitNet('restaurants:location:showLeftover', option.data.id);
      },
    },
  ],
});
