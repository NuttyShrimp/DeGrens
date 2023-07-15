import { SelectorTarget } from '../../../enums/SelectorTargets';

export const copyCoords: CommandData = {
  name: 'copyCoords',
  role: 'staff',
  log: 'has copied an entities coords',
  target: [SelectorTarget.ENTITY, SelectorTarget.PED, SelectorTarget.VEHICLE],
  isClientCommand: true,
  handler: (caller, args: { entity: number }) => {
    emit('admin:commands:copyCoords', args.entity);
  },
  UI: {
    title: 'Copy Coords',
  },
};
