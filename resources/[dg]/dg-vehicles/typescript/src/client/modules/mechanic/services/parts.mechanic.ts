import { RPC, Events, UI, Notifications } from '@dgx/client';
import { buildPartLabel } from '../../../../shared/mechanic/helpers.mechanic';

let order: Mechanic.PartItem[] = [];

export const openItemOrder = async () => {
  const addPartSubMenu = await RPC.execute<ContextMenu.Entry[]>('vehicles:mechanic:getOrderMenu');
  if (!addPartSubMenu) return;

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Order Maken',
      icon: 'ticket',
      disabled: true,
    },
    {
      title: 'Add part',
      icon: 'plus',
      submenu: addPartSubMenu,
    },
    ...order.map<ContextMenu.Entry>((item, idx) => ({
      title: buildPartLabel(item),
      description: item.type === 'repair' ? 'Herstel Onderdeel' : 'Tuning Onderdeel',
      submenu: [
        {
          title: 'Remove from order',
          icon: 'trash-can',
          data: {
            idx,
          },
          callbackURL: 'vehicles/mechanic/removeFromOrder',
        },
      ],
    })),
  ];

  if (order.length > 0) {
    menu.push({
      title: 'Reset order',
      icon: 'trash-can',
      submenu: [
        {
          title: 'Confirm',
          description: 'THIS CANNOT BE UNDONE',
          callbackURL: 'vehicles/mechanic/resetOrder',
        },
      ],
    });
    menu.push({
      title: 'Finish order',
      icon: 'check',
      submenu: [
        {
          title: 'Confirm',
          callbackURL: 'vehicles/mechanic/finishOrder',
        },
      ],
    });
  }

  UI.openApplication('contextmenu', menu);
};

export const removeItem = (idx: number) => {
  order.splice(idx, 1);
};

export const clearItemOrder = () => {
  order = [];
};

export const finishOrder = () => {
  Events.emitNet('vehicles:mechanic:finishOrder', order);
  clearItemOrder();
};

export const addToOrder = (item: Mechanic.PartItem) => {
  order.push(item);

  const partLabel = buildPartLabel(item);
  Notifications.add(`${partLabel} toegevoegd`, 'info');
};
