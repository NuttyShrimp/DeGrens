import { Config, Notifications, SQL, Util } from '@dgx/server';
import { mainLogger } from '../sv_logger';
import { getPlayerJob } from './signin';

const jobs: Map<string, Whitelist.Entry[]> = new Map();
const config: Map<string, Whitelist.Info> = new Map();

setImmediate(async () => {
  loadJobs();
  await Config.awaitConfigLoad();
  setConfig(Config.getConfigValue('jobs.whitelist'));
});

// region Config
export const loadJobs = async () => {
  const result = await SQL.query<Omit<Whitelist.Entry[], 'name'>>(`SELECT *
                                                                   FROM whitelist_jobs`);
  for (const entry of result) {
    const job = jobs.get(entry.job);
    const Player = await DGCore.Functions.GetOfflinePlayerByCitizenId(entry.cid);
    entry.name = Player.PlayerData.charinfo.firstname + ' ' + Player.PlayerData.charinfo.lastname;
    if (job) {
      job.push(entry);
    } else {
      jobs.set(entry.job, [entry]);
    }
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

export const getJobConfig = (job: string): Whitelist.Info => {
  return config.get(job);
};
// endregion

export const getPlayerInfoForJob = (src: number, job: string): Whitelist.Entry => {
  const cid = Util.getCID(src);
  const entries = jobs.get(job);
  if (!entries) return null;
  return entries.find(entry => entry.cid === cid);
};

export const hasSpeciality = (src: number, speciality: string, job?: string): boolean => {
  if (!job) {
    // Get job player is currently signed in to
    job = getPlayerJob(src);
  }
  const config = getJobConfig(job);
  if (!config) return false;
  const entry = getPlayerInfoForJob(src, job);
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
  }
  whitelistLogger.debug(`${src} requested whitelist menu for job ${job} (${filter})`);
  const allowListMenu: ContextMenu.Entry[] = [];
  const config = getJobConfig(job);
  const filters = (filter ?? '').split(';');
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
  if (!entries) return;
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
      title: entry.name,
      description: `rank: ${config.grades[entry.rank]} | speciality: ${Object.keys(config.specialties).find(
        spec => (entry.specialty & config.specialties[spec]) !== 0
      )}`,
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
      ],
    });
  });
  emitNet('dg-ui:openApplication', src, 'contextmenu', allowListMenu);
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
  const entry = entries.find(entry => entry.cid === target);
  if (!entry) return;
  const originEntry = getPlayerInfoForJob(src, job);
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
  emitNet('dg-jobs:signin:update', src, job, entry.rank);
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
  const entry = entries.find(entry => entry.cid === target);
  if (!entry) return;
  const originEntry = getPlayerInfoForJob(src, job);
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
