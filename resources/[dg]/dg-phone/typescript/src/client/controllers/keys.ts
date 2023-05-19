import { Keys, UI } from '@dgx/client';
import { openPhone } from 'services/mgmt';
import { canOpenPhone } from 'services/state';

Keys.register('openPhone', '(phone) Open Telefoon', 'M');
Keys.register('acceptNotification', '(phone) Melding Accepteren');
Keys.register('declineNotification', '(phone) Melding Weigeren');

Keys.onPressDown('openPhone', () => {
  if (!canOpenPhone()) return;
  openPhone();
});
Keys.onPressDown('acceptNotification', () => {
  if (!canOpenPhone()) return;
  UI.SendAppEvent('phone', {
    appName: 'home-screen',
    action: 'acceptNotification',
  });
});
Keys.onPressDown('declineNotification', () => {
  if (!canOpenPhone()) return;
  UI.SendAppEvent('phone', {
    appName: 'home-screen',
    action: 'declineNotification',
  });
});
