import { UI, Events, Peek } from '@dgx/client';
import { cutPlant, feedPlant, harvestPlant, waterPlant } from 'services/plants';

Peek.addFlagEntry('farmingPlantId', {
  options: [
    {
      label: 'Bekijk Plant',
      icon: 'fas fa-clipboard',
      action: (_, entity) => {
        if (!entity) return;
        const plantId = Entity(entity).state.farmingPlantId;
        if (!plantId) return;
        Events.emitNet('farming:plant:view', plantId);
      },
    },
  ],
});

UI.RegisterUICallback('farming/cut', (data: { plantId: number }, cb) => {
  cutPlant(data.plantId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('farming/water', (data: { plantId: number }, cb) => {
  waterPlant(data.plantId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('farming/feed', (data: { plantId: number; deluxe: boolean }, cb) => {
  feedPlant(data.plantId, data.deluxe);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('farming/harvest', (data: { plantId: number }, cb) => {
  harvestPlant(data.plantId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
