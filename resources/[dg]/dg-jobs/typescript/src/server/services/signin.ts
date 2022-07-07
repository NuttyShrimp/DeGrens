import { Config, Notifications, Util } from '@dgx/server';
import { mainLogger } from '../sv_logger';
import { getJobConfig, getPlayerInfoForJob } from './whitelist';

let locations: SignInLocation[] = [];
let loaded = false;
// Jobname on Set of CIDs
const signedIn: Map<string, Set<Number>> = new Map();

export const loadLocations = async () => {
  await Config.awaitConfigLoad();
  locations = [];
  const cLocs = Config.getConfigValue<SignInLocation[]>('jobs.signin');
  cLocs.forEach((loc, idx) => {
    if (!loc.zone.data.data) {
      loc.zone.data.data = {};
    }
    loc.zone.data.data.id = idx;
    locations.push(loc);
  });
  loaded = true;
};

export const getLocations = async () => {
  await Util.awaitCondition(() => loaded);
  return locations;
};

export const canJobSignIn = (job: string, locId: number) => {
  const loc = locations[locId];
  if (!loc) return false;
  return loc.jobs.includes(job);
};

export const openSignInMenu = (src: number, locId: number) => {
  if (!locations[locId]) return;
  const jobs = locations[locId].jobs;
  const menu: ContextMenu.Entry[] = [];
  jobs.forEach(job => {
    const jobConfig = getJobConfig(job);
    if (!jobConfig) return;
    menu.push({
      title: `Ga in dienst: ${jobConfig.name}`,
      icon: 'right-to-bracket',
      data: {
        job: job,
      },
      callbackURL: 'jobs:signin:signin',
    });
    menu.push({
      title: `Ga uit dienst: ${jobConfig.name}`,
      icon: 'right-from-bracket',
      data: {
        job: job,
      },
      callbackURL: 'jobs:signin:signout',
    });
  });
  emitNet('dg-ui:openApplication', src, 'contextmenu', menu);
};

export const signIn = (src: number, job: string) => {
  const jobConfig = getJobConfig(job);
  if (!jobConfig) {
    mainLogger.error(`Tried to sign in player ${src} for job ${job} but no config was found`);
    Util.Log(
      'jobs:whitelist:signin:noConfig',
      { job },
      `Tried to sign in player ${src} for job ${job} but no config was found`,
      src
    );
    return;
  }
  const cid = Util.getCID(src);
  if (!cid) return;
  const plyEntry = getPlayerInfoForJob(src, job);
  if (!plyEntry) {
    Util.Log(
      'jobs:whitelist:signin:notWhitelisted',
      { job },
      `Player ${cid} tried to sign in for job ${job} but is not whitelisted`,
      src
    );
    return;
  }
  // TODO: Check if signed in for another job
  let signedInJob = signedIn.get(job);
  if (!signedInJob) {
    signedInJob = new Set();
    signedIn.set(job, signedInJob);
  }
  if (signedInJob.has(cid)) {
    Notifications.add(src, `Je bent al in dienst bij ${jobConfig.name}`, 'error');
  }
  signedInJob.add(cid);
  Util.Log('jobs:whitelist:signin:success', { job }, `Player ${cid} signed in for job ${job}`, src);
  Notifications.add(src, `In dienst gegaan bij ${jobConfig.name}`);
  emitNet('dg-jobs:signin:update', src, job, plyEntry.rank);
};

export const signOut = (src: number, job: string) => {
  if (!signedIn.has(job)) {
    return;
  }
  const cid = Util.getCID(src);
  if (!cid) return;
  const signedInJob = signedIn.get(job);
  if (!signedInJob) return;
  const jobConfig = getJobConfig(job);
  if (!signedInJob.has(cid)) {
    Notifications.add(src, `Je bent niet in dienst bij ${jobConfig.name}`, 'error');
    return;
  }
  signedInJob.delete(cid);
  Util.Log('jobs:whitelist:signout:success', { job }, `Player ${cid} signed out for job ${jobConfig.name}`, src);
  Notifications.add(src, `Uit dienst gegaan bij ${jobConfig.name}`);
  emitNet('dg-jobs:signin:update', src, null, null);
};

export const getPlayerJob = (src: number) => {
  const cid = Util.getCID(src);
  if (!cid) return;
  for (const [job, signedInJob] of signedIn) {
    if (signedInJob.has(cid)) {
      return job;
    }
  }
  return null;
};
