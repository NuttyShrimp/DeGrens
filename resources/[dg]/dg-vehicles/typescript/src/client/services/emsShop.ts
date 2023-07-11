import { Events, Peek, UI } from '@dgx/client';

Peek.addFlagEntry('isEMSVehShop', {
  distance: 3,
  options: [
    {
      label: 'Open shop',
      job: ['police', 'ambulance'],
      icon: 'fas fa-circle',
      action: () => {
        Events.emitNet('vehicles:emsShop:open');
      },
    },
  ],
});

UI.RegisterUICallback('vehicles/emsShop/buy', (data: { model: string }, cb) => {
  if (!data?.model) return;
  Events.emitNet('vehicles:emsShop:buy', data.model);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
