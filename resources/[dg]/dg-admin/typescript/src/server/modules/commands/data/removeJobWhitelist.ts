import { Inputs } from '../../../enums/inputs';

interface SetJobData {
  Target?: UI.Player;
  Job: UI.Job;
  cid?: string;
}

export const removejobwhitelist: CommandData = {
  name: 'removejobwhitelist',
  role: 'staff',
  log: 'removed a whitelist entry for a job',
  target: false,
  isClientCommand: false,
  handler: (caller, args: SetJobData) => {
    global.exports['dg-jobs'].removeFromWhitelist(caller.source, args.Job, args.cid ?? args?.Target.cid ?? caller.cid);
  },
  UI: {
    title: 'Remove whitelist for job',
    info: {
      inputs: [Inputs.Player, Inputs.Jobs],
      overrideFields: ['cid'],
    },
  },
};
