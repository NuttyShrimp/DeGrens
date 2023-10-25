import { Events, Notifications } from '@dgx/client';
import { findBuyer, isCornersellEnabled, setCornersellEnabled } from './service.cornerselling';

on('criminal:cornersell:toggle', () => {
  if (!isCornersellEnabled()) {
    Events.emitNet('criminal:cornersell:tryToStart');
    return;
  }

  setCornersellEnabled(false);
  Notifications.add('Gestopt met verkopen');
});

Events.onNet('criminal:cornersell:findBuyer', () => {
  setTimeout(() => {
    findBuyer();
  }, 15000);
});

Events.onNet('criminal:cornersell:stop', () => {
  setCornersellEnabled(false);
  Notifications.add('Je hebt niks meer om te verkopen');
});
