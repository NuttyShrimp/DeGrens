import { Inputs } from 'enums/inputs';

interface RemMainFees {
  Target?: UI.Player;
}

export const remMaintenanceFees: CommandData = {
  name: 'remMaintenanceFees',
  role: 'developer',
  log: 'removed maintenace fees',
  target: false,
  isClientCommand: false,
  handler: (caller, args: RemMainFees) => {
    let target = caller.source;
    if (args.Target) {
      target = args.Target.serverId;
    }
    global.exports['dg-financials'].removeMaintenanceFees(target);
  },
  UI: {
    title: 'Remove maintenance fees',
    info: {
      inputs: [Inputs.Player],
    },
  },
};
