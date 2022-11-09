import { Chat } from '@dgx/server';
import { openAllowListMenu } from '../services/whitelist';

Chat.registerCommand('jobstaff', 'Manage ranks en specialiteiten van whitelisted jobs', [], 'user', src => {
  openAllowListMenu(src);
});
