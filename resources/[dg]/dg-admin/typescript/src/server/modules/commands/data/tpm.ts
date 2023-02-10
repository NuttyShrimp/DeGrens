import { Events } from '@dgx/server';

export const tpid: CommandData = {
  name: 'tpm',
  role: 'staff',
  log: 'teleported to your waypoint',
  target: false,
  isClientCommand: false,
  handler: caller => {
    Events.emitNet('admin:commands:tpm', caller.source);
  },
  UI: {
    title: 'Teleport to your waypoint',
    bindable: true,
  },
};
