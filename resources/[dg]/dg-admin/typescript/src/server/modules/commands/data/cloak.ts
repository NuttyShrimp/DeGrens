import { Events, Notifications } from '@dgx/server';

let cloakToggled = false;

export const cloak: CommandData = {
  name: 'cloak',
  log: 'toggled cloak(visibility)',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    Events.emitNet('admin:cmd:setPlayerVisible', caller.source, cloakToggled);
    Notifications.add(caller.source, `Cloak ${!cloakToggled ? 'enabled' : 'disabled'}`);
    cloakToggled = !cloakToggled;
  },
  UI: {
    title: 'Cloak',
    toggled: false,
    bindable: true,
  },
};
