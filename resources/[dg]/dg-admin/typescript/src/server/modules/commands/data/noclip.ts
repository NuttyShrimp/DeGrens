import { Events, Auth } from '@dgx/server';
import { getPlayerCommandState, setPlayerCommandState } from '../state.commands';
import { allowInvisibleForInteractingPlayers } from '../service.commands';

export const noclip: CommandData = {
  name: 'noclip',
  role: 'staff',
  log: 'toggled noclip',
  target: false,
  isClientCommand: false,
  handler: async caller => {
    const toggle = !getPlayerCommandState(caller.source, 'noclip');
    setPlayerCommandState(caller.source, 'noclip', toggle);
    Events.emitNet('admin:noclip:toggle', caller.source, toggle);

    // do some logic because when exiting noclip while in cloak, we dont want to disallow invis
    const inCloak = getPlayerCommandState(caller.source, 'cloak');
    const allowInvis = toggle || inCloak;
    Auth.toggleAllowedMod(caller.source, 'invisible', allowInvis);

    allowInvisibleForInteractingPlayers(caller.source, toggle);
  },
  UI: {
    title: 'Noclip',
    toggled: false,
    bindable: true,
  },
};
