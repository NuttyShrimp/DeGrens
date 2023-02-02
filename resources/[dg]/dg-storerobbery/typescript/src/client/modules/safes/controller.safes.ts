import { Peek } from '@dgx/client';
import { canInteractWithSafe, hackSafe, lootSafe } from './service.safe';

Peek.addZoneEntry('store_safe', {
  options: [
    {
      icon: 'fas fa-hdd',
      label: 'Hack',
      items: 'decoding_tool',
      action: () => {
        hackSafe();
      },
      canInteract: canInteractWithSafe,
    },
    {
      icon: 'fas fa-hand-holding-usd',
      label: 'Neem',
      action: () => {
        lootSafe();
      },
      canInteract: canInteractWithSafe,
    },
  ],
  distance: 1.2,
});
