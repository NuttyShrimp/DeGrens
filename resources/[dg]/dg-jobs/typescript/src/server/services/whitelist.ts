import { Config, Events, Notifications, SQL, UI, Util } from '@dgx/server';
import { mainLogger } from '../sv_logger';
import { getPlayerJob } from './signin';

const jobs: Map<string, Whitelist.Entry[]> = new Map();
export const config: Map<string, Whitelist.Info> = new Map();

setImmediate(async () => {
  loadJobs();
  await Config.awaitConfigLoad();
  setConfig(Config.getConfigValue('jobs.whitelist'));
});

// region Config
const registerPlayerWhitelist = async (data: Omit<Whitelist.Entry, 'name'>) => {
  const charName = await Util.getCharName(data.cid);
  const entry = { ...data, name: charName };
  const jobEntries = jobs.get(data.job);
  if (jobEntries !== undefined) {
    jobEntries.push(entry);
  } else {
    jobs.set(data.job, [entry]);
  }
};

const unregisterPlayerWhitelist = (jobName: string, cid: number) => {
  const jobEntries = jobs.get(jobName);
  if (!jobEntries) return;
  jobs.set(
    jobName,
    jobEntries.filter(j => j.cid !== cid)
  );
};

export const loadJobs = async () => {
  const result = await SQL.query<Omit<Whitelist.Entry, 'name'>[]>(`SELECT * FROM whitelist_jobs`);
  for (const entry of result) {
    await registerPlayerWhitelist(entry);
  }
  jobs.forEach((entries, job) => {
    whitelistLogger.debug(`Loaded ${entries.length} whitelist entries for job ${job}`);
  });
};

export const setConfig = (data: Record<string, Whitelist.Config>) => {
  config.clear();
  Object.keys(data).forEach(key => {
    const info: Whitelist.Info = {
      ...data[key],
      specialties: {},
    };
    data[key].specialties.forEach((spec, idx) => {
      info.specialties[spec] = 2 ** idx;
    });
    config.set(key, info);
  });
};

export const getJobConfig = (job: string) => {
  return config.get(job);
};
// endregion

export const getPlayerInfoForJob = (cid: number, job: string) => {
  const entries = jobs.get(job);
  if (!entries) return;
  return entries.find(entry => entry.cid === cid);
};

export const getWhitelistedJobsForPlayer = (src: number): string[] => {
  const whitelistedJobs: string[] = [];
  const cid = Util.getCID(src, true);
  if (!cid) return [];
  for (const [jobName, players] of jobs) {
    if (players.find(player => player.cid === cid) === undefined) continue;
    whitelistedJobs.push(jobName);
  }
  return whitelistedJobs;
};

export const hasSpeciality = (src: number, speciality: string, job?: string): boolean => {
  if (!job) {
    // Get job player is currently signed in to
    job = getPlayerJob(src);
  }
  if (!job) return false;
  const config = getJobConfig(job);
  if (!config) return false;
  const cid = Util.getCID(src);
  if (!cid) return false;
  const entry = getPlayerInfoForJob(cid, job);
  if (!entry) return false;
  const specBit = config.specialties[speciality] ?? -1;
  const hasSpeciality = (entry.specialty & specBit) === specBit;
  whitelistLogger.debug(`Player ${src} has speciality ${speciality} for job ${job}: ${hasSpeciality}`);
  return hasSpeciality;
};

// Filter is rank or speciality seperated by a dot comma.
export const openAllowListMenu = (src: number, filter?: string) => {
  // Get job player is currently signed in to
  const job = getPlayerJob(src);
  if (!job) {
    Notifications.add(src, 'Je bent niet in dienst voor een whitelisted job', 'error');
    return;
  }

  if (!hasSpeciality(src, 'HC', job)) {
    Notifications.add(src, 'Je hebt hier geen toegang tot', 'error');
    return;
  }

  whitelistLogger.debug(`${src} requested whitelist menu for job ${job} (${filter})`);
  const allowListMenu: ContextMenu.Entry[] = [];
  const config = getJobConfig(job);
  if (!config) return;
  const filters = (filter ?? '').split(';');

  const openMenu = () => {
    allowListMenu.push({
      title: 'Aannemen',
      description: `Neem iemand aan voor deze ${job}`,
      callbackURL: 'jobs:whitelist:hire',
      data: {
        job,
      },
    });
    UI.openContextMenu(src, allowListMenu);
  };

  // add list where we can filter by rank or speciality
  allowListMenu.push({
    title: 'Filter',
    icon: 'filter',
    submenu: config.grades.concat(Object.keys(config.specialties)).map(spec => ({
      title: spec,
      icon: filters.includes(spec) ? 'circle-check' : undefined,
      data: {
        spec,
        filter: filter ?? '',
        type: filters.includes(spec) ? 'remove' : 'add',
      },
      callbackURL: 'jobs:whitelist:filter',
    })),
  });
  // add list of all players sorted by rank and alphabetically
  const entries = jobs.get(job);
  if (!entries || entries.length === 0) {
    allowListMenu.push({
      title: 'Geen volk gevonden',
      icon: 'x',
    });
    openMenu();
    return;
  }
  const players = entries.filter(entry => {
    if (!filter) return true;
    return filters.some(filter => {
      if (config.grades.includes(filter)) {
        return entry.rank === config.grades.indexOf(filter);
      }
      if (config.specialties[filter]) {
        return (entry.specialty & config.specialties[filter]) !== 0;
      }
    });
  });
  players.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name);
  });
  players.forEach(entry => {
    allowListMenu.push({
      title: `${entry.name}(${entry.cid})`,
      description: `rank: ${config.grades[entry.rank]} | speciality: ${Object.keys(config.specialties)
        .filter(spec => (entry.specialty & config.specialties[spec]) !== 0)
        .join(',')}`,
      submenu: [
        {
          title: 'Ranks',
          disabled: true,
        },
        ...config.grades.map<ContextMenu.Entry>((rank, idx) => ({
          title: rank,
          data: {
            cid: entry.cid,
            rank: idx,
          },
          disabled: entry.rank === idx,
          callbackURL: 'jobs:whitelist:assignRank',
        })),
        {
          title: 'Specialties',
          disabled: true,
        },
        ...Object.keys(config.specialties).map<ContextMenu.Entry>((spec, idx) => ({
          title: spec,
          data: {
            cid: entry.cid,
            spec,
            type: (entry.specialty & config.specialties[spec]) !== 0 ? 'remove' : 'add',
          },
          icon: (entry.specialty & config.specialties[spec]) !== 0 ? 'circle-check' : undefined,
          callbackURL: 'jobs:whitelist:toggleSpecialty',
        })),
        {
          title: 'Ontsla',
          description: `Ontsla deze persoon`,
          callbackURL: 'jobs:whitelist:fire',
          data: {
            cid: entry.cid,
            job,
          },
        },
      ],
    });
  });
  openMenu();
};

export const addWhitelist = async (src: number, jobName: string, rank = 1, cid?: number) => {
  cid = cid ?? Util.getCID(src);
  if (!cid) return;
  const job = getPlayerInfoForJob(cid, jobName);
  if (job) {
    Notifications.add(src, `Burger ${cid} heeft de job ${jobName} al`, 'error');
    return;
  }
  const jobConfig = getJobConfig(jobName);
  if (!jobConfig) return;
  if (rank > jobConfig.grades.length) {
    Notifications.add(src, `rank ${rank} does not exist on job ${jobConfig.name}`, 'error');
    return;
  }
  const jobWhitelistEntry = { cid, job: jobName, rank, specialty: 0 };
  await SQL.insertValues('whitelist_jobs', [jobWhitelistEntry]);
  await registerPlayerWhitelist(jobWhitelistEntry);
  whitelistLogger.debug(`Added whitelist entry for ${cid} as ${jobName} with rank: ${rank}`);
  Util.Log('jobs:whitelist:add', { rank, job: jobName, cid }, `Whitelisted ${cid} for ${job} with rank ${rank}`, src);
  Events.emitNet('jobs:whitelist:add', src, jobName);
};

export const removeWhitelist = async (src: number, jobName: string, cid?: number) => {
  cid = cid ?? Util.getCID(src);
  if (!cid) return;
  const job = getPlayerInfoForJob(cid, jobName);
  if (!job) return;
  const result = await SQL.query('DELETE FROM whitelist_jobs WHERE cid = ? AND job = ?', [cid, jobName]);
  if (result.affectedRows < 1) {
    Notifications.add(
      src,
      `Er is iets misgelopen bij het verwijderen van de whitelist voor ${cid} bij ${jobName}`,
      'error'
    );
    whitelistLogger.error(`Failed to remove whitelist entry for ${cid} at ${jobName}`, cid, jobName);
    return;
  }
  unregisterPlayerWhitelist(jobName, cid);
  whitelistLogger.debug(`Removed whitelist entry for ${cid} as ${jobName}`);
  Util.Log('jobs:whitelist:removed', { job: jobName }, `Removed whitelist for ${cid} at ${job}`, src);
  Events.emitNet('jobs:whitelist:remove', src, jobName);
};

export const assignRank = async (src: number, target: number, rank: number) => {
  const job = getPlayerJob(src);
  if (!job) return;
  const entries = jobs.get(job);
  if (!entries) {
    Util.Log(
      'jobs:whitelist:assignRank:failed',
      {
        target,
        rank,
        job,
      },
      `No whitelist entries for job ${job}`,
      src
    );
    return;
  }
  const jobConfig = getJobConfig(job);
  if (!jobConfig) return;
  const entry = entries.find(entry => entry.cid === target);
  if (!entry) return;
  const cid = Util.getCID(src);
  if (!cid) return;
  const originEntry = getPlayerInfoForJob(cid, job);
  if (!originEntry) return;
  if (originEntry.rank < rank) {
    Util.Log(
      'jobs:whitelist:assignRank:failed',
      {
        target,
        rank,
        job,
      },
      `Player ${src} tried to assign rank ${rank} to ${target} but their rank is ${originEntry.rank}`,
      src
    );
    Notifications.add(src, 'Je hebt niet de juiste rang om deze actie uit te voeren', 'error');
    return;
  }
  entry.rank = rank;
  await SQL.query(
    `UPDATE whitelist_jobs
     SET rank = ?
     WHERE cid = ?`,
    [rank, target]
  );
  whitelistLogger.debug(`${src} assigned rank ${rank} to ${target} for job ${job}`);
  Util.Log(
    'jobs:whitelist:assignRank:success',
    { target, rank, job },
    `Assigned rank ${rank} to ${target} for job ${job}`,
    src
  );
  Notifications.add(src, `${target} is nu ${jobConfig.grades[rank]}`, 'success');
  emitNet('jobs:client:signin:update', src, job, entry.rank);
  emit('jobs:server:signin:update', src, job, entry.rank);
};

export const toggleSpecialty = async (src: number, target: number, speciality: string, type: 'add' | 'remove') => {
  const job = getPlayerJob(src);
  if (!job) return;
  const entries = jobs.get(job);
  if (!entries) {
    Util.Log(
      'jobs:whitelist:toggleSpecialty:failed',
      {
        target,
        speciality,
        type,
        job,
      },
      `No whitelist entries for job ${job}`,
      src
    );
    return;
  }
  const jobConfig = getJobConfig(job);
  if (!jobConfig) return;
  const entry = entries.find(entry => entry.cid === target);
  if (!entry) return;
  const cid = Util.getCID(src);
  if (!cid) return;
  const originEntry = getPlayerInfoForJob(cid, job);
  if (!originEntry) return;
  if (originEntry.rank < entry.rank) {
    Util.Log(
      'jobs:whitelist:toggleSpecialty:failed',
      {
        target,
        speciality,
        type,
        job,
      },
      `Player ${src} tried to ${type} speciality ${speciality} to ${target} but their rank is ${originEntry.rank}`,
      src
    );
    Notifications.add(src, 'Je hebt niet de juiste rang om deze actie uit te voeren', 'error');
    return;
  }
  if (type === 'add') {
    entry.specialty |= jobConfig.specialties[speciality];
  } else {
    entry.specialty &= ~jobConfig.specialties[speciality];
  }
  await SQL.query(
    `UPDATE whitelist_jobs
     SET specialty = ?
     WHERE cid = ?`,
    [entry.specialty, target]
  );
  whitelistLogger.debug(`${src} ${type}d speciality ${speciality} to ${target} for job ${job}`);
  Util.Log(
    'jobs:whitelist:toggleSpecialty:success',
    { target, speciality, type, job },
    `${type}d speciality ${speciality} to ${target} for job ${job}`,
    src
  );
  Notifications.add(
    src,
    type === 'add'
      ? `${target} heeft nu de ${speciality} specialiteit`
      : `${speciality} is verwijderd als specialiteit voor ${target}`,
    'success'
  );
};

export const whitelistLogger = mainLogger.child({ module: 'whitelist' });
