import { Events, Notifications } from '@dgx/server';

export const cloak: CommandData = {
  name: 'cloak',
  log: 'toggled cloak(visibility)',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, isEnabled: boolean) => {
    Events.emitNet('admin:cmd:setPlayerVisible', caller.source, isEnabled);
    Notifications.add(caller.source, `Cloak ${!isEnabled ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
