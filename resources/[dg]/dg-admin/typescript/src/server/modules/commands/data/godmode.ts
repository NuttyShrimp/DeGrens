import { Notifications } from '@dgx/server';

export const godmode: CommandData = {
  name: 'godmode',
  log: 'toggled godmode',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, isEnabled: boolean) => {
    SetPlayerInvincible(String(caller.source), isEnabled);
    Notifications.add(caller.source, `Godmode ${!isEnabled ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Godmode',
    toggled: false,
    bindable: true,
  },
};
