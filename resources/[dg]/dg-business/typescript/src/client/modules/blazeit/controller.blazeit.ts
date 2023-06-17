import { Events } from '@dgx/client';
import { addPeekEntryForBusinessZone } from 'helpers';

addPeekEntryForBusinessZone('blazeit', 'crafting', true, {
  options: [
    {
      label: 'Buds Verwerken',
      icon: 'fas fa-cannabis',
      items: 'weed_bud',
      action: () => {
        Events.emitNet('business:blazeit:processBud');
      },
    },
  ],
});
