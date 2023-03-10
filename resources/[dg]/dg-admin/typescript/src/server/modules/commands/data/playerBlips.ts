import { Events, Notifications } from '@dgx/server';

let blipsToggled: Record<number, boolean> = {};

export const playerBlips: CommandData = {
  name: 'playerBlips',
  role: 'support',
  log: 'toggled player blips/names',
  isClientCommand: false,
  target: false,
  handler: caller => {
    // argument is undefined when using bind, so save state and toggle every func call
    if (!blipsToggled[caller.source]) {
      blipsToggled[caller.source] = false;
    }
    blipsToggled[caller.source] = !blipsToggled[caller.source];
    Events.emitNet('dg-admin:client:togglePlayerBlips', caller.source, blipsToggled[caller.source]);
    Notifications.add(caller.source, `Player blips ${blipsToggled[caller.source] ? 'enabled' : 'disabled'}`);
  },
  UI: {
    title: 'Player Blips',
    toggled: false,
    bindable: true,
    favorite: true,
  },
};
