import { Notifications, Jobs, Events, Inventory } from '@dgx/server';
import { doEmergencyButton } from './service.alerts';

Inventory.registerUseable('emergency_button', src => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    Notifications.add(src, 'Dit is enkel voor agenten', 'error');
    return;
  }
  doEmergencyButton(src);
});

Events.onNet('police:alerts:emergency', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  doEmergencyButton(src);
});
