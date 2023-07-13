import { Events, Peek, UI } from '@dgx/client';

UI.RegisterUICallback('misc:rentals:rent', (data: { model: string; id: string; pay: 'cash' | 'bank' }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('misc:rentals:rent', data);
});

Peek.addFlagEntry('isRentalDealer', {
  distance: 2,
  options: [
    {
      label: 'Rent vehicle',
      type: 'client',
      icon: 'clipboard',
      action: (_, ent) => {
        if (!ent) return;
        const entState = Entity(ent).state;
        if (!entState.isRentalDealer) return;
        Events.emitNet('misc:rentals:openList', entState.rentalSpot);
      },
    },
  ],
});
