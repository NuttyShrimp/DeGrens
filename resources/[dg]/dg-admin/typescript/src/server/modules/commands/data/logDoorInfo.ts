import { SelectorTarget } from '../../../enums/SelectorTargets';

export const logDoorInfo: CommandData = {
  name: 'logDoorInfo',
  role: 'developer',
  log: 'has logged doorinfo',
  target: [SelectorTarget.ENTITY],
  isClientCommand: true,
  handler: (_, args: { entity: number }) => {
    if (!args?.entity) return;
    global.exports['dg-doorlock'].logDoorInfo(args.entity);
  },
  UI: {
    title: 'Log Door Info',
  },
};
