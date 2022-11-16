import { Config, Notifications, UI, Util } from '@dgx/server';

import { mainLogger } from '../sv_logger';

import { getJobConfig, getPlayerInfoForJob } from './whitelist';

let locations: SignInLocation[] = [];
let loaded = false;
const signedIn: Map<string, { cid: number; srvId: number }[]> = new Map();

// Map gets filled with players who leave while signed in, to restore them when they log back in
const jobsToRestore = new Map<number, string>();

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
  UI.openContextMenu(src, menu);
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
  const plyEntry = getPlayerInfoForJob(cid, job);
  if (!plyEntry) {
    Util.Log(
      'jobs:whitelist:signin:notWhitelisted',
      { job },
      `Player ${cid} tried to sign in for job ${job} but is not whitelisted`,
      src
    );
    return;
  }

  const currentPlyJob = getPlayerJob(src);
  if (currentPlyJob === job) {
    Notifications.add(src, `Je bent al in dienst bij ${jobConfig.name}`);
    return;
  }

  // Check if player already signed in for other job, if so remove from there
  for (const signedInPlayers of signedIn.values()) {
    const idx = signedInPlayers.findIndex(p => p.cid === cid);
    if (idx === -1) continue;
    signedInPlayers.splice(idx, 1);
  }

  let signedInJob = signedIn.get(job);
  if (!signedInJob) {
    signedInJob = [];
    signedIn.set(job, signedInJob);
  }

  signedInJob.push({ cid, srvId: src });
  Util.Log('jobs:whitelist:signin:success', { job }, `Player ${cid} signed in for job ${job}`, src);
  Notifications.add(src, `In dienst gegaan bij ${jobConfig.name}`);
  emitNet('jobs:client:signin:update', src, job, plyEntry.rank);
  emit('jobs:server:signin:update', src, job, plyEntry.rank);
};

export const signOut = (src: number, job: string) => {
  if (!signedIn.has(job)) return;
  const cid = Util.getCID(src);
  if (!cid) return;
  const signedInJob = signedIn.get(job);
  if (!signedInJob) return;
  const jobConfig = getJobConfig(job);
  if (!jobConfig) return;
  const currentJob = getPlayerJob(src);
  if (currentJob !== job) {
    Notifications.add(src, `Je bent niet in dienst bij ${jobConfig.name}`, 'error');
    return;
  }
  signedIn.set(
    job,
    signedInJob.filter(i => i.cid !== cid)
  );
  Util.Log('jobs:whitelist:signout:success', { job }, `Player ${cid} signed out for job ${jobConfig.name}`, src);
  Notifications.add(src, `Uit dienst gegaan bij ${jobConfig.name}`);
  emitNet('jobs:client:signin:update', src, null, null);
  emit('jobs:server:signin:update', src, null, null);
};

export const getPlayerJob = (src: number) => {
  const cid = Util.getCID(src, true);
  if (!cid) return;
  for (const [job, signedInJob] of signedIn) {
    if (signedInJob.find(i => i.cid === cid)) {
      return job;
    }
  }
};

export const getPlayersForJob = (job: string) => {
  const activePlys = signedIn.get(job);
  if (!activePlys) return [];
  return activePlys.map(p => p.srvId);
};

export const getAmountsForEachJob = () => {
  return Array.from(signedIn.keys()).reduce<Record<string, number>>((acc, jobName) => {
    acc[jobName] = getPlayersForJob(jobName).length;
    return acc;
  }, {});
};

export const playerLoaded = (plyId: number, cid: number) => {
  const jobName = jobsToRestore.get(cid);
  if (!jobName) return;
  signIn(plyId, jobName);
};

export const playerUnloaded = (plyId: number, cid: number) => {
  const plyJob = getPlayerJob(plyId);
  if (!plyJob) return;
  signOut(plyId, plyJob);
  jobsToRestore.set(cid, plyJob);
};
