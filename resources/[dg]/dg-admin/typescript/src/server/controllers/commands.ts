import { Chat, Events } from '@dgx/server';
import { announceMessage } from 'modules/menu/service.menu';

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

Chat.registerCommand(
  'announce',
  'Broadcast a message to everyone on the server',
  [{ name: 'message', required: true, description: 'the broadcasted message' }],
  'staff',
  (src, _, args) => {
    announceMessage(src, args);
  }
);
