import { Chat } from '@dgx/server';
import { openAllowListMenu } from '../services/whitelist';

Chat.registerCommand('jobstaff', 'Manage ranks en specialiteiten van whitelisted jobs', [], 'user', src => {
  openAllowListMenu(src);
});

Chat.registerCommand(
  'callsign',
  'Pas je callsign aan',
  [{ name: 'callsign', description: 'Je callsign' }],
  'user',
  (src, _, args) => {
    const callsign = args.join(' ');
    const player = DGCore.Functions.GetPlayer(src);
    player.Functions.SetMetaData('callsign', callsign);
  }
);
