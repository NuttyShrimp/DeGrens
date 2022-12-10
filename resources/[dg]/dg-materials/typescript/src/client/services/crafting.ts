import { Inventory, Peek } from '@dgx/client';

Peek.addModelEntry('prop_toolchest_05', {
  options: [
    {
      label: 'Craft',
      icon: 'fas fa-screwdriver-wrench',
      action: () => {
        Inventory.openBench('crafting_bench');
      },
    },
  ],
  distance: 2.0,
});
