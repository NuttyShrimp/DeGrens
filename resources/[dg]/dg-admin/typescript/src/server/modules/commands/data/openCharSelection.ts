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
    emitNet('dg-chars:client:reshowMenu', caller.source ?? data?.Target.serverId);
  },
  UI: {
    title: 'Char Selection Menu',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
