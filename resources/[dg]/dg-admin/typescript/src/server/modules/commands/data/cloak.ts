import { Events, Notifications, Sync } from '@dgx/server';

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
    Sync.setPlayerVisible(caller.source, toggle);
    Notifications.add(caller.source, `Cloak ${toggle ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
