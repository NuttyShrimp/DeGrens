import { Inputs } from '../../../enums/inputs';

interface SetJobData {
  Target?: UI.Player;
  Job: UI.Job;
  rank?: number;
  cid?: string;
}

export const addjobwhitelist: CommandData = {
  name: 'addjobwhitelist',
  role: 'staff',
  log: 'added a whitelist entry for a job',
  target: false,
  isClientCommand: false,
  handler: (caller, args: SetJobData) => {
    if (args.rank === undefined) {
      args.rank = 0;
    }
    global.exports['dg-jobs'].addToWhitelist(
      caller.source,
      args.Job,
      Number(args.rank),
      args.cid ?? args?.Target.cid ?? caller.cid
    );
  },
  UI: {
    title: 'Add whitelist for job',
    info: {
      inputs: [Inputs.Player, Inputs.Jobs],
      overrideFields: ['rank', 'cid'],
    },
  },
};
