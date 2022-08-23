import { SelectorTarget } from '../../../enums/SelectorTargets';

export const damageEntity: CommandData = {
  name: 'damageEntity',
  role: 'staff',
  log: 'has damaged an entity.',
  target: [SelectorTarget.ENTITY, SelectorTarget.PED, SelectorTarget.VEHICLE],
  isClientCommand: true,
  handler: (caller, args: { entity: number }) => {
    emit('admin:commands:damageEntity', args.entity);
  },
  UI: {
    title: 'Damage Entity',
  },
};
