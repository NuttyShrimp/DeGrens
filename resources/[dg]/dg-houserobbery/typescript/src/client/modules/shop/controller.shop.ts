import { Events, Notifications, Peek, RPC, Taskbar } from '@dgx/client';

let currentSellInventory: number;

Peek.addFlagEntry(
  'isHouseRobSell',
  {
    options: [
      {
        icon: 'fas fa-box',
        label: 'Toon voorwerp',
        action: () => {
          showSellItem();
        },
      },
      {
        icon: 'fas fa-money-bill',
        label: 'Verkoop voorwerp',
        action: () => {
          sellItem();
        },
      },
    ],
    distance: 1,
  },
  true
);

const showSellItem = async () => {
  if (currentSellInventory) {
    Notifications.add('Ik heb nog spullen van je.', 'error');
    return;
  }
  currentSellInventory = await DGCore.Functions.TriggerCallback('inventory:server:CreateId', 'give');
  emitNet('inventory:server:OpenInventory', 'give', currentSellInventory);
};

const sellItem = async () => {
  const itemData = await DGCore.Functions.TriggerCallback<{ name: string; amount: number; info: any; quality: number }>(
    'inventory:server:GetGiveItem',
    currentSellInventory
  );
  if (!itemData) {
    Notifications.add('Wat wil je verkopen?', 'error');
    currentSellInventory = null;
    return;
  }

  const canSellItem = await RPC.execute<boolean>('houserobbery:server:canSellItem', itemData.name);
  if (!canSellItem) {
    Notifications.add('Je kan dit niet verkopen...', 'error');
    emitNet('DGCore:Server:AddItem', itemData.name, itemData.amount, null, itemData.info, itemData.quality);
    currentSellInventory = null;
    return;
  }

  const [canceled] = await Taskbar.create('magnifying-glass-dollar', 'Waarde schatten...', 10000, {
    canCancel: false,
    cancelOnDeath: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  Events.emitNet('houserobbery:server:sellItem', itemData);
  Notifications.add('Goed zaken met je te doen', 'success');
  currentSellInventory = null;
};
