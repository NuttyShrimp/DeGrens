import { Chat } from '@dgx/server';
import { hasSpeciality, openAllowListMenu } from '../services/whitelist';

Chat.registerCommand('jobstaff', 'Manage ranks en specialiteiten van whitelisted jobs', [], 'user', src => {
  if (!hasSpeciality(src, 'HC')) {
    Chat.sendMessage(src, {
      message: 'You do not have permission to use this command.',
      type: 'error',
      prefix: 'System',
    });
    return;
  }
  openAllowListMenu(src);
});
