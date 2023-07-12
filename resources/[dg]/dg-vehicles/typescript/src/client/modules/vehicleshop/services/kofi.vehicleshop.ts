import { Events, Peek, UI } from '@dgx/client';

Peek.addFlagEntry('kofiVehicleShop', {
  options: [
    {
      label: 'Open Shop',
      icon: 'fas fa-basket-shopping',
      action: () => {
        Events.emitNet('vehicles:shop:openKofiShop');
      },
    },
  ],
});

UI.RegisterUICallback('vehicleshop/kofi/choose', (data: { model: string }, cb) => {
  Events.emitNet('vehicles:shop:buyKofiVehicle', data.model);
  cb({ data: {}, meta: { ok: true, message: '' } });
});
