import { SelectorTarget } from '../../../enums/SelectorTargets';

export const registerDoor: CommandData = {
  name: 'registerDoor',
  role: 'developer',
  log: 'has registered a door.',
  target: [SelectorTarget.ENTITY],
  isClientCommand: true,
  handler: (_, args: { entity: number }) => {
    global.exports['dg-doorlock'].registerDoor(args.entity);
  },
  UI: {
    title: 'Register Door',
  },
};
