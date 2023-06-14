import { Events } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface OpenStanceMenuData {
  Target?: UI.Player;
}

export const openStanceMenu: CommandData = {
  name: 'openStanceMenu',
  role: 'developer',
  log: 'has opened stance menu',
  target: false,
  isClientCommand: false,
  handler: (caller, args: OpenStanceMenuData) => {
    const plyId = args.Target?.serverId ?? caller.source;
    if (plyId === caller.source) {
      Events.emitNet('admin:menu:forceClose', caller.source);
    }
    Events.emitNet('vehicles:stances:openMenu', plyId);
  },
  UI: {
    title: 'Open Stance Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
