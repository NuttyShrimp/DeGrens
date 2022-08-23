import { Chat, Events } from '@dgx/server';

import { ACBan } from '../modules/penalties/service.penalties';
import { hasPlayerPermission } from '../modules/permissions/service.permissions';

Chat.registerCommand('admin', 'Opens the admin menu', [], 'staff', src => {
  if (!src) return;
  if (!hasPlayerPermission(src, 'staff')) {
    ACBan(src, 'Unauthorized access to admin panel');
    return;
  }
  Events.emitNet('admin:menu:open', src);
});
