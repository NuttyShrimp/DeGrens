import { Events, Inventory, Peek, Taskbar } from '@dgx/client';

Peek.addFlagEntry('isHouseRobSell', {
  options: [
    {
      icon: 'fas fa-box',
      label: 'Geef voorwerpen',
      action: () => {
        Inventory.openStash('houserobbery_sell');
      },
    },
    {
      icon: 'fas fa-money-bill',
      label: 'Neem cash',
      action: async () => {
        const [canceled] = await Taskbar.create('magnifying-glass-dollar', 'Waarde schatten', 10000, {
          canCancel: false,
          cancelOnDeath: true,
          cancelOnMove: true,
          disarm: true,
          disableInventory: true,
          disablePeek: true,
          controlDisables: {
            movement: true,
            carMovement: true,
            combat: true,
          },
        });
        if (canceled) return;
        Events.emitNet('houserobbery:server:takeSellCash');
      },
    },
  ],
  distance: 1,
});
