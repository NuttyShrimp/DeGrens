import { Notifications } from '@dgx/server';
import { announceMessage } from 'modules/menu/service.menu';

export const announce: CommandData = {
  name: 'announcement',
  log: 'made an announcement',
  role: 'staff',
  target: false,
  isClientCommand: false,
  handler: (origin, data: { message?: string }) => {
    if (!data.message || data.message.trim() !== '') {
      Notifications.add(origin.source, 'Je announecement mag niet leeg zijn');
      return;
    }
    announceMessage(origin.source, data.message);
  },
  UI: {
    title: 'Announcement',
    info: {
      overrideFields: ['message'],
    },
  },
};
