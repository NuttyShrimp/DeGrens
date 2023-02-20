import { Inputs } from '../../../enums/inputs';

interface SetJobData {
  Target?: UI.Player;
  WhitelistedJobs: UI.Job;
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

    let cid: number;
    if (args.cid && args.cid !== '') {
      cid = Number(args.cid);
    } else if (args?.Target?.cid) {
      cid = args.Target.cid;
    } else {
      cid = caller.cid;
    }

    global.exports['dg-jobs'].addWhitelist(caller.source, args.WhitelistedJobs.name, Number(args.rank), cid);
  },
  UI: {
    title: 'Add whitelist for job',
    info: {
      inputs: [Inputs.Player, Inputs.Jobs],
      overrideFields: ['rank', 'cid'],
    },
  },
};
