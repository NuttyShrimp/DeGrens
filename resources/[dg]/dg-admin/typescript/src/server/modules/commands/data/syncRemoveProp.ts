import { SelectorTarget } from '../../../enums/SelectorTargets';

export const syncRemoveProp: CommandData = {
  name: 'syncRemoveProp',
  role: 'developer',
  log: 'has sync removed a prop',
  target: [SelectorTarget.ENTITY],
  isClientCommand: true,
  handler: (_, args: { entity: number }) => {
    global.exports['dg-misc'].addRemovedProp(+args.entity); // this is client export bcus client command
  },
  UI: {
    title: 'Sync Remove Prop',
  },
};
