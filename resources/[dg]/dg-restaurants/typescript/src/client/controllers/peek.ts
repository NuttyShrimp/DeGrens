import { Business, Events, Inventory, Peek } from '@dgx/client';
import { getIsSignedIn } from 'services/locations';
import { openRegisterMenu } from 'services/order';

Peek.addZoneEntry('restaurant_management', {
  options: [
    {
      label: 'Inklokken',
      icon: 'fas fa-right-to-bracket',
      action: option => {
        Events.emitNet('restaurants:location:signIn', option.data.id);
      },
      canInteract: (_, __, option) => {
        return Business.isEmployee(option.data.id) && !getIsSignedIn();
      },
    },
    {
      label: 'Uitklokken',
      icon: 'fas fa-right-from-bracket',
      action: option => {
        Events.emitNet('restaurants:location:signOut', option.data.id);
      },
      canInteract: getIsSignedIn,
    },
    {
      label: 'Wijzig Prijzen',
      icon: 'fas fa-money-check-dollar-pen',
      action: option => {
        Events.emitNet('restaurants:location:openPriceMenu', option.data.id);
      },
      canInteract: (_, __, option) => {
        return getIsSignedIn() && Business.isEmployee(option.data.id, ['change_role']);
      },
    },
  ],
  distance: 2,
});

Peek.addZoneEntry('restaurant_stash', {
  options: [
    {
      label: 'Open Voorraad',
      icon: 'fas fa-box-open',
      action: option => {
        Inventory.openStash(option.data.id, 50);
      },
      canInteract: (_, __, option) => {
        return Business.isEmployee(option.data.id, ['stash']) && getIsSignedIn();
      },
    },
  ],
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
      canInteract: getIsSignedIn,
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
