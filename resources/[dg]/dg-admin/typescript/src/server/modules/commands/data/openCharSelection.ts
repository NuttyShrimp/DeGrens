import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface CharSelectionData {
  Target?: UI.Player;
}

export const openCharSelection: CommandData = {
  name: 'openCharSelection',
  log: ' send someone to the character selection menu',
  isClientCommand: false,
  target: [],
  role: 'staff',
  handler: (caller, data: CharSelectionData) => {
    const plyId = data?.Target?.serverId ?? caller.source;
    global.exports['dg-chars'].logOut(plyId);

    if (plyId === caller.source) {
      Events.emitNet('admin:menu:forceClose', caller.source);
    }
  },
  UI: {
    title: 'Char Selection Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
