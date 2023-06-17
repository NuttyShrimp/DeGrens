import { Events, PolyZone, Core, BaseEvents } from '@dgx/client';
import { addPeekEntryForBusinessZone } from 'helpers';
import { isEmployee } from 'service/permscache';
import { cleanupKingPillsJob, handlePickupEnter, startKingPillsJob } from './service.kingpills';

addPeekEntryForBusinessZone('kingpills', 'crafting', false, {
  options: [
    {
      label: 'Start Job',
      icon: 'fas fa-prescription-bottle-pill',
      action: () => {
        Events.emitNet('business:kingpills:startJob');
      },
      canInteract: (_, __, option) => isEmployee(option.data.id),
    },
  ],
});

Events.onNet('business:kingpills:start', startKingPillsJob);
Events.onNet('business:kingpills:cleanup', cleanupKingPillsJob);

PolyZone.onEnter('kingpills_job_zone', (_, __, center) => {
  handlePickupEnter(center);
});

Core.onPlayerUnloaded(() => {
  cleanupKingPillsJob();
});

BaseEvents.onResourceStop(() => {
  cleanupKingPillsJob();
});
