import { Events, Peek, UI } from '@dgx/client';
import { loadLocations } from './service.rental';

on('misc:rentals:openList', (_: unknown, entity: number | undefined) => {
  if (!entity) return;
  const entState = Entity(entity).state;
  if (!entState.isRentalDealer) return;
  Events.emitNet('misc:rentals:openList', entState.rentalSpot);
});

UI.RegisterUICallback('misc:rentals:rent', (data: { model: string; id: string; pay: 'cash' | 'bank' }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  Events.emitNet('misc:rentals:rent', data);
});

Events.onNet('misc:rentals:loadLocations', (locs: Rentals.Location[]) => {
  loadLocations(locs);
});

Peek.addFlagEntry('isRentalDealer', {
  distance: 2,
  options: [
    {
      label: 'Rent vehicle',
      event: 'misc:rentals:openList',
      type: 'client',
      icon: 'clipboard',
    },
  ],
});
