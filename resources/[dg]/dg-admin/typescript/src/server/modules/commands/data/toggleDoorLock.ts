import { DoorLock } from '@dgx/server';
import { SelectorTarget } from '../../../enums/SelectorTargets';

export const toggleDoorLock: CommandData = {
  name: 'toggleDoorLock',
  role: 'staff',
  log: 'has toggled a doorlock.',
  target: [SelectorTarget.ENTITY],
  isClientCommand: true,
  handler: (_, args: { entity: number }) => {
    if (!args?.entity) return;
    DoorLock.toggleEntityDoorState(args.entity);
  },
  UI: {
    title: 'Toggle Doorlock',
  },
};
