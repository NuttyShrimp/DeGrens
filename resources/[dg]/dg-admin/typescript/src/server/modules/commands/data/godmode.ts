import { Notifications, Sync } from '@dgx/server';
import { getPlayerCommandState, setPlayerCommandState } from '../state.commands';

export const godmode: CommandData = {
  name: 'godmode',
  log: 'toggled godmode',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    const toggle = !getPlayerCommandState(caller.source, 'godmode');
    setPlayerCommandState(caller.source, 'godmode', toggle);
    Sync.setPlayerInvincible(caller.source, toggle);
    Notifications.add(caller.source, `Godmode ${toggle ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Godmode',
    toggled: false,
    bindable: true,
  },
};
