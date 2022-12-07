import { Police } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface LeavePrisonData {
  Target?: UI.Player;
}

export const clearPrisonSentence: CommandData = {
  name: 'clearPrisonSentence',
  log: 'cleared a players prison sentence',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: LeavePrisonData) => {
    const plyId = data.Target?.serverId ?? caller.source;
    Police.leavePrison(plyId);
  },
  UI: {
    title: 'Clear Prison Sentence',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
