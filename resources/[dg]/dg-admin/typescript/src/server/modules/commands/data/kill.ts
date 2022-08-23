import { Inputs } from 'enums/inputs';

interface KillData {
  Target: UI.Player;
}

export const kill: CommandData = {
  name: 'kill',
  role: 'staff',
  target: [],
  isClientCommand: false,
  log: 'killed a player',
  handler: (caller, args: KillData) => {
    emitNet('hospital:client:KillPlayer', args.Target?.serverId ?? caller.source);
  },
  UI: {
    title: 'Kill',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
