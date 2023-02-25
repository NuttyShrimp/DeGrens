import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface FixScreenFadeoutData {
  Target?: UI.Player;
}

export const fixScreenFadeout: CommandData = {
  name: 'fixScreenFadeout',
  log: 'fixed a persons faded out screen',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: FixScreenFadeoutData) => {
    const plyId = data.Target?.serverId ?? caller.source;
    Events.emitNet('admin:command:fadeIn', plyId);
  },
  UI: {
    title: 'Fix Screen Fadeout',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
