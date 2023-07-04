import { Events, Inventory, Minigames, Taskbar } from '@dgx/client';

export const doCooking = async (restaurantId: string, fromItem: string) => {
  const itemLabel = Inventory.getItemData(fromItem)?.label;
  if (!itemLabel) return;

  const success = await Minigames.keygame(3, 4, 10);
  if (!success) return;

  const canceled = await doTaskbar('knife-kitchen', 'Maken...', 3000);
  if (canceled) return;

  Events.emitNet('restaurants:location:cook', restaurantId, fromItem);
};

export const doCreateItem = async (restaurantId: string, registerId: number, item: string, amount: number) => {
  const success = await Minigames.keygame(amount, 4, 10);
  if (!success) return;

  const canceled = await doTaskbar('hand', '', 5000);
  if (canceled) return;

  Events.emitNet('restaurants:location:createItem', restaurantId, registerId, item);
};

const doTaskbar = async (icon: string, label: string, duration: number) => {
  const [canceled] = await Taskbar.create(icon, label, duration, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      combat: true,
      carMovement: true,
    },
    animation: {
      animDict: 'amb@prop_human_bbq@male@base',
      anim: 'base',
      flags: 1,
    },
  });
  return canceled;
};
