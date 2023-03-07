import { Events, Notifications, Sync } from '@dgx/server';
import { getPlayerCommandState, setPlayerCommandState } from '../state.commands';
import { allowInvisibleForInteractingPlayers } from '../service.commands';

export const cloak: CommandData = {
  name: 'cloak',
  log: 'toggled visibility',
  isClientCommand: false,
  target: [],
  role: 'support',
  handler: caller => {
    const toggle = !getPlayerCommandState(caller.source, 'cloak');
    setPlayerCommandState(caller.source, 'cloak', toggle);
    Events.emitNet('admin:commands:cloak', caller.source, toggle);

    // do some logic because we want to stay invis when exiting cloak but in noclip
    const inNoclip = getPlayerCommandState(caller.source, 'noclip');
    const visible = toggle ? false : !inNoclip;
    Sync.setPlayerVisible(caller.source, visible);

    Notifications.add(caller.source, `Cloak ${toggle ? 'enabled' : 'disabled'}`);
    allowInvisibleForInteractingPlayers(caller.source, toggle);
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
