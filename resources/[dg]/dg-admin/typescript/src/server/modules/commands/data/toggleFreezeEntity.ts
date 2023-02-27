import { SelectorTarget } from '../../../enums/SelectorTargets';

export const toggleFreezeEntity: CommandData = {
  name: 'toggleFreezeEntity',
  role: 'developer',
  log: 'has toggled entity freeze',
  target: [SelectorTarget.ENTITY, SelectorTarget.PED, SelectorTarget.VEHICLE, SelectorTarget.PLAYER],
  isClientCommand: true,
  handler: (caller, args: { entity: number }) => {
    emit('admin:commands:toggleFreezeEntity', args.entity);
  },
  UI: {
    title: 'Toggle Entity Freeze',
  },
};
