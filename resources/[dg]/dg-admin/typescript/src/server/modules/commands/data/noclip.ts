import { Events, Auth, RPC } from '@dgx/server';
import { getPlayerCommandState, setPlayerCommandState } from '../state.commands';
import { allowInvisibleForInteractingPlayers } from '../service.commands';

export const noclip: CommandData = {
  name: 'noclip',
  role: 'support',
  log: 'toggled noclip',
  target: false,
  isClientCommand: false,
  handler: async caller => {
    const toggle = !getPlayerCommandState(caller.source, 'noclip');
    setPlayerCommandState(caller.source, 'noclip', toggle);

    // do some logic because when exiting noclip while in cloak, we dont want to disallow invis
    const inCloak = getPlayerCommandState(caller.source, 'cloak');
    const allowInvis = toggle || inCloak;

    // when exiting noclip, we FIRST disable noclip it before toggling allowed mod
    if (!toggle) {
      await RPC.execute('admin:noclip:toggle', caller.source, false);
    }

    await Auth.toggleAllowedMod(caller.source, 'invisible', allowInvis);
    await allowInvisibleForInteractingPlayers(caller.source, toggle);

    // when enabling noclip, we FIRST allow modules before actually enabling noclip
    if (toggle) {
      await RPC.execute('admin:noclip:toggle', caller.source, true);
    }
  },
  UI: {
    title: 'Noclip',
    toggled: false,
    bindable: true,
  },
};
