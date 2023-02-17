import { Events, Notifications, Sync } from '@dgx/server';
import { getPlayerCommandState, setPlayerCommandState } from '../state.commands';
import { allowInvisibleForInteractingPlayers } from '../service.commands';

export const cloak: CommandData = {
  name: 'cloak',
  log: 'toggled visibility',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    const toggle = !getPlayerCommandState(caller.source, 'cloak');
    setPlayerCommandState(caller.source, 'cloak', toggle);
    Events.emitNet('admin:commands:cloak', caller.source, toggle);
    Sync.setPlayerVisible(caller.source, !toggle);
    Notifications.add(caller.source, `Cloak ${toggle ? 'enabled' : 'disabled'}`);
    allowInvisibleForInteractingPlayers(caller.source, toggle);
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
