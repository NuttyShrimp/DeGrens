import { Events, Notifications, RPC, UI } from '@dgx/client';

let newOrderItems: string[] = [];

// will get cached every time we open register menu using peek, not in between menu openings to refresh items
let menuItems: Record<string, Restaurants.MenuItem> = {};

export const openRegisterMenu = async (restaurantId: string, registerId: number) => {
  const shownOrder = await RPC.execute<boolean>('restaurant:register:showOrder', restaurantId, registerId);

  // if rpc evt has shown existing order do nothing
  // else create a now order
  if (shownOrder) return;

  const items = await RPC.execute<typeof menuItems>('restaurant:location:getMenuItems', restaurantId);
  if (!items) return;
  menuItems = items;

  showNewOrderMenu(restaurantId, registerId);
};

const generateMenuItemLabel = (item: string) => {
  const menuItem = menuItems[item];
  if (!menuItem) return 'Unknown';
  return `${menuItem.label} | €${menuItem.price}`;
};

export const showNewOrderMenu = (restaurantId: string, registerId: number) => {
  const orderMenuEntries: ContextMenu.Entry[] = newOrderItems.map((item, idx) => ({
    title: generateMenuItemLabel(item),
    description: 'Klik om te verwijderen',
    callbackURL: 'restaurant/removeOrderItem',
    data: {
      restaurantId,
      registerId,
      itemIdx: idx,
    },
  }));

  const addItemEntries: ContextMenu.Entry[] = Object.keys(menuItems).map(item => ({
    title: generateMenuItemLabel(item),
    callbackURL: 'restaurant/addOrderItem',
    data: {
      restaurantId,
      registerId,
      itemName: item,
    },
  }));

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: `Kassa #${registerId + 1}`,
      description: 'Maak een nieuw order',
      icon: 'burger-glass',
      disabled: true,
    },
    {
      title: 'Item Toevoegen',
      icon: 'plus',
      submenu: addItemEntries,
    },
    ...orderMenuEntries,
    {
      title: 'Bevestig Order',
      icon: 'check',
      callbackURL: 'restaurant/confirmOrder',
      data: {
        restaurantId,
        registerId,
      },
    },
  ];
  UI.openApplication('contextmenu', menuEntries);
};

export const addItemToNewOrder = (itemName: string) => {
  newOrderItems.push(itemName);
};

export const removeItemFromNewOrder = (itemIdx: number) => {
  newOrderItems.splice(itemIdx, 1);
};

export const confirmNewOrder = (restaurantId: string, registerId: number) => {
  if (newOrderItems.length === 0) {
    Notifications.add('Je hebt geen items toegevoegd', 'error');
    return;
  }
  Events.emitNet('restaurants:register:setOrder', restaurantId, registerId, newOrderItems);
  newOrderItems = [];
};
