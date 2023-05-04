import { Chat, Core } from '@dgx/server';
import whitelistManager from 'classes/whitelistmanager';

Chat.registerCommand('jobstaff', 'Manage ranks en specialiteiten van whitelisted jobs', [], 'user', src => {
  whitelistManager.openAllowListMenu(src);
});

Chat.registerCommand(
  'callsign',
  'Pas je callsign aan',
  [{ name: 'callsign', description: 'Je callsign' }],
  'user',
  (src, _, args) => {
    const callsign = args.join(' ');
    const player = Core.getPlayer(src);
    player.updateMetadata('callsign', callsign);
  }
);
