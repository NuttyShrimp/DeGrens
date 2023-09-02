import { Events, Notifications, UI } from '@dgx/client';

let current: {
  pricedItems: Business.ClientPricedItems;
  businessId: number;
  registerIdx: number;
  orderItems: Business.RegisterOrderItem[];
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

  const itemEntries: ContextMenu.Entry[] = current.orderItems.map((orderItem, idx) => {
    const pricedItem = current!.pricedItems[orderItem.name];
    return {
      title: `${orderItem.amount}x ${pricedItem.label} | €${pricedItem.price * orderItem.amount}`,
      description: 'Klik om te verwijderen',
      callbackURL: 'business/order/remove',
      data: {
        itemIdx: idx,
      },
    };
  });

  const addEntries: ContextMenu.Entry[] = Object.entries(current.pricedItems).map(([item, { label, price }]) => {
    return {
      title: `${label} | €${price}`,
      callbackURL: 'business/order/add',
      data: {
        item,
      },
    };
  });

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

export const addToItemOrder = async (itemName: string) => {
  if (!current) {
    Notifications.add('Je bent geen order aan het maken', 'error');
    return;
  }

  const itemLabel = current.pricedItems[itemName]?.label ?? 'Unknown';
  const result = await UI.openInput<{ amount: string }>({
    header: `Hoeveel ${itemLabel} wil je toevoegen aan het order?`,
    inputs: [
      {
        type: 'number',
        name: 'amount',
        label: 'Aantal',
        value: '1',
      },
    ],
  });
  if (!result.accepted) {
    showOrderMenu();
    return;
  }

  const amount = +result.values.amount;
  if (isNaN(amount) || amount <= 0) {
    showOrderMenu();
    return;
  }

  current.orderItems.push({ name: itemName, amount });
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
