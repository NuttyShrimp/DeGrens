import { Notifications, Sync } from '@dgx/server';

let godmodeToggled: Record<number, boolean> = {};

export const godmode: CommandData = {
  name: 'godmode',
  log: 'toggled godmode',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    godmodeToggled[caller.source] = !godmodeToggled[caller.source];
    Sync.setPlayerInvincible(caller.source, godmodeToggled[caller.source]);
    Notifications.add(caller.source, `Godmode ${godmodeToggled[caller.source] ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Godmode',
    toggled: false,
    bindable: true,
  },
};
