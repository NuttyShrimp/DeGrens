import { Events, Notifications } from '@dgx/server';

export const playerBlips: CommandData = {
  name: 'playerBlips',
  role: 'staff',
  log: 'toggled player blips/names',
  isClientCommand: false,
  target: false,
  handler: (caller, isEnabled: boolean) => {
    Notifications.add(caller.source, `Player blips ${isEnabled ? 'disabled' : 'enabled'}`);
    Events.emitNet('dg-admin:client:togglePlayerBlips', caller.source, isEnabled);
  },
  UI: {
    title: 'Player Blips',
    toggled: false,
    bindable: true,
    favorite: true,
  },
};
