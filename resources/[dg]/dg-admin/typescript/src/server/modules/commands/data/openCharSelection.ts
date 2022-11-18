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
    global.exports['dg-chars'].logOut(data?.Target?.serverId ?? caller.source);
  },
  UI: {
    title: 'Char Selection Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
