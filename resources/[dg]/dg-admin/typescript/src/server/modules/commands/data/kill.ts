import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

interface KillData {
  Target: UI.Player;
  unconscious: boolean;
}

export const kill: CommandData = {
  name: 'kill',
  role: 'staff',
  target: [],
  isClientCommand: false,
  log: 'killed a player',
  handler: (caller, args: KillData) => {
    Events.emitNet('hospital:client:kill', args.Target?.serverId ?? caller.source, args.unconscious ?? false);
  },
  UI: {
    title: 'Kill',
    info: {
      inputs: [Inputs.Player],
      checkBoxes: ['unconscious'],
    },
  },
};
