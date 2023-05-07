import { Events, Notifications, UI } from '@dgx/client';

let current: {
  pricedItems: Business.ClientPricedItems;
  businessId: number;
  registerIdx: number;
  orderItems: string[];
} | null = null;

export const startPricedItemOrder = (
  businessId: number,
  registerIdx: number,
  pricedItems: Business.ClientPricedItems
) => {
  current = {
    businessId,
    registerIdx,
    pricedItems,
    orderItems: [],
  };

  showOrderMenu();
};

export const showOrderMenu = () => {
  if (!current) {
    Notifications.add('Je bent geen order aan het maken');
    return;
  }

  console.log(current);

  const itemEntries: ContextMenu.Entry[] = current.orderItems.map((item, idx) => ({
    title: generateMenuItemLabel(item),
    description: 'Klik om te verwijderen',
    callbackURL: 'business/order/remove',
    data: {
      itemIdx: idx,
    },
  }));

  const addEntries: ContextMenu.Entry[] = Object.keys(current.pricedItems).map(item => ({
    title: generateMenuItemLabel(item),
    callbackURL: 'business/order/add',
    data: {
      item,
    },
  }));

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: `Kassa #${current.registerIdx + 1}`,
      description: 'Maak een nieuwe bestelling',
      icon: 'list-radio',
      disabled: true,
    },
    {
      title: 'Item Toevoegen',
      icon: 'plus',
      submenu: addEntries,
    },
    ...itemEntries,
    {
      title: 'Bevestig Order',
      icon: 'check',
      callbackURL: 'business/order/confirm',
      data: {},
    },
  ];
  UI.openApplication('contextmenu', menuEntries);
};

const generateMenuItemLabel = (item: string) => {
  const menuItem = current?.pricedItems[item];
  if (!menuItem) return 'Unknown';
  return `${menuItem.label} | €${menuItem.price}`;
};

export const addToItemOrder = (itemName: string) => {
  if (!current) {
    Notifications.add('Je bent geen order aan het maken', 'error');
    return;
  }

  current.orderItems.push(itemName);
  showOrderMenu();
};

export const removeFromItemOrder = (itemIdx: number) => {
  if (!current) {
    Notifications.add('Je bent geen order aan het maken', 'error');
    return;
  }

  current.orderItems.splice(itemIdx, 1);
  showOrderMenu();
};

export const confirmItemOrder = () => {
  if (!current) {
    Notifications.add('Je bent geen order aan het maken', 'error');
    return;
  }

  if (current.orderItems.length === 0) {
    Notifications.add('Je hebt geen items toegevoegd', 'error');
    return;
  }

  Events.emitNet('business:server:setRegister', current.businessId, current.registerIdx, current.orderItems);
  current = null;
};
