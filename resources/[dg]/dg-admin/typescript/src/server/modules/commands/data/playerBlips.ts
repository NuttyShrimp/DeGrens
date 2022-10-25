import { Events, Notifications } from '@dgx/server';

let blipsToggled = false;

export const playerBlips: CommandData = {
  name: 'playerBlips',
  role: 'staff',
  log: 'toggled player blips/names',
  isClientCommand: false,
  target: false,
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    blipsToggled = !blipsToggled;
    Events.emitNet('dg-admin:client:togglePlayerBlips', caller.source, blipsToggled);
    Notifications.add(caller.source, `Player blips ${blipsToggled ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Player Blips',
    toggled: false,
    bindable: true,
    favorite: true,
  },
};
