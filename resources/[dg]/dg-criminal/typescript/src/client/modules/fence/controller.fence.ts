import { Events, Inventory, Peek, Taskbar } from '@dgx/client';

Peek.addFlagEntry('isFence', {
  options: [
    {
      icon: 'fas fa-box',
      label: 'Geef voorwerpen',
      action: () => {
        Inventory.openStash('fence_sell');
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
        Events.emitNet('criminal:fence:takeCash');
      },
    },
  ],
  distance: 1,
});
