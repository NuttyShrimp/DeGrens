import { Inventory, Peek } from '@dgx/client';

Peek.addFlagEntry('isCarboostCrafting', {
  options: [
    {
      label: 'Maak Spullen',
      icon: 'fas fa-pen-ruler',
      action: () => {
        Inventory.openBench('carboost_bench');
      },
    },
  ],
});
