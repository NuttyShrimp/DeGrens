import { Events } from '@dgx/server';

export const noclip: CommandData = {
  name: 'noclip',
  role: 'staff',
  log: 'toggled noclip',
  target: false,
  isClientCommand: false,
  handler: async caller => {
    Events.emitNet('admin:noclip:toggle', caller.source);
  },
  UI: {
    title: 'Noclip',
    toggled: false,
    bindable: true,
  },
};
