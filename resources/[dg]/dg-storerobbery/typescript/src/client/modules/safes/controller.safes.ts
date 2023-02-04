import { Events, Peek } from '@dgx/client';
import { canInteractWithSafe, lootSafe, setIsSafeHacker } from './service.safe';
import locationManager from 'classes/LocationManager';

Peek.addZoneEntry('store_safe', {
  options: [
    {
      icon: 'fas fa-hdd',
      label: 'Hack',
      items: 'decoding_tool',
      action: () => {
        Events.emitNet('storerobbery:safes:hack', locationManager.currentStore);
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

Events.onNet('storerobbery:safes:setIsHacker', (isSafeHacker: boolean) => {
  setIsSafeHacker(isSafeHacker);
});
