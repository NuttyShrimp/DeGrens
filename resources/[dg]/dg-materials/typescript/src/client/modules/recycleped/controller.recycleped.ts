import { Inventory, Peek } from '@dgx/client';

Peek.addFlagEntry('isRecyclePed', {
  options: [
    {
      label: 'Recycleer',
      icon: 'fas fa-recycle',
      action: () => {
        Inventory.openStash('materials_recycleped');
      },
    },
  ],
});
