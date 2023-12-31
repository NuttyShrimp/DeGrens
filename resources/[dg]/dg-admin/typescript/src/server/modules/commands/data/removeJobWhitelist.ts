import { Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

interface SetJobData {
  Target?: UI.Player;
  WhitelistedJobs: UI.Job;
  cid?: string;
}

export const removejobwhitelist: CommandData = {
  name: 'removejobwhitelist',
  role: 'staff',
  log: 'removed a whitelist entry for a job',
  target: false,
  isClientCommand: false,
  handler: (caller, args: SetJobData) => {
    let cid: number;
    if (args.cid && args.cid === '') {
      cid = Number(args.cid);
    } else if (args?.Target?.cid) {
      cid = args.Target.cid;
    } else if (caller.cid) {
      cid = caller.cid;
    } else {
      Notifications.add(caller.source, 'failed to find a valid target to give the job whitelist');
      return;
    }

    global.exports['dg-jobs'].removeWhitelist(caller.source, args.WhitelistedJobs.name, cid);
  },
  UI: {
    title: 'Remove whitelist for job',
    info: {
      inputs: [Inputs.Player, Inputs.Jobs],
      overrideFields: ['cid'],
    },
  },
};
