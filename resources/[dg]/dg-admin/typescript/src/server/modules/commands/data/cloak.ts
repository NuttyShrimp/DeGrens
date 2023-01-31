import { Events, Notifications, Sync } from '@dgx/server';
import { hidePly } from 'services/hideInfo';

let cloakToggled: Record<number, boolean> = {};

export const cloak: CommandData = {
  name: 'cloak',
  log: 'toggled cloak(visibility)',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    const toggle = !cloakToggled[caller.source];
    cloakToggled[caller.source] = toggle;
    Sync.setPlayerVisible(caller.source, !toggle);
    hidePly(caller.source, toggle);
    Notifications.add(caller.source, `Cloak ${toggle ? 'enabled' : 'disabled'}`);
    Events.emitNet('admin:commands:cloack', caller.source, toggle);
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
