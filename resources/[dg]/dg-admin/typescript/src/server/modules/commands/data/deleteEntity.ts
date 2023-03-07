import { SelectorTarget } from '../../../enums/SelectorTargets';

export const deleteEntity: CommandData = {
  name: 'deleteEntity',
  role: 'support',
  log: 'has deleted an entity.',
  target: [SelectorTarget.ENTITY, SelectorTarget.PED, SelectorTarget.VEHICLE],
  isClientCommand: true,
  handler: (_, args: { entity: number }) => {
    emit('admin:commands:deleteEntity', args.entity);
  },
  UI: {
    title: 'Delete Entity',
  },
};
