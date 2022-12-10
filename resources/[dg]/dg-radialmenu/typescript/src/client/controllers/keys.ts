import { Keys, Notifications, Police } from '@dgx/client';
import { openRadialMenu } from 'services/radialmenu';

Keys.register('radialmenu', 'Open Radialmenu', 'F1');
Keys.onPressDown('radialmenu', () => {
  if (IsPauseMenuActive()) return;
  if (Police.isCuffed()) {
    Notifications.add('Je kan dit momenteel niet', 'error');
    return;
  }

  openRadialMenu();
});
