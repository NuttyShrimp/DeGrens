import { Notifications } from '@dgx/server';

let godmodeToggled = false;

export const godmode: CommandData = {
  name: 'godmode',
  log: 'toggled godmode',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    godmodeToggled = !godmodeToggled;
    SetPlayerInvincible(String(caller.source), godmodeToggled);
    Notifications.add(caller.source, `Godmode ${godmodeToggled ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Godmode',
    toggled: false,
    bindable: true,
  },
};
