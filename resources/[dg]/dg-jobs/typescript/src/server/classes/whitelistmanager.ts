import { SQL, Config, Notifications, Events, Util, UI, Financials } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { AsyncExport, Export, ExportRegister } from '@dgx/shared/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import signedInManager from './signedinmanager';

@RPCRegister()
@ExportRegister()
@EventListener()
class WhitelistManager extends Util.Singleton<WhitelistManager>() {
  private readonly logger: winston.Logger;
  private readonly jobs: Map<string, Whitelist.Entry[]> = new Map();
  private readonly _config: Map<string, Whitelist.Info> = new Map();

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Whitelist' });
    this.jobs = new Map();
    this._config = new Map();
  }

  public get config() {
    return this._config;
  }

  private registerPlayerWhitelist = async (data: Omit<Whitelist.Entry, 'name'>) => {
    const charName = await Util.getCharName(data.cid);
    const entry = { ...data, name: charName };
    const jobEntries = this.jobs.get(data.job);
    if (jobEntries !== undefined) {
      jobEntries.push(entry);
    } else {
      this.jobs.set(data.job, [entry]);
    }
  };

  private unregisterPlayerWhitelist = (jobName: string, cid: number) => {
    const jobEntries = this.jobs.get(jobName);
    if (!jobEntries) return;
    this.jobs.set(
      jobName,
      jobEntries.filter(j => j.cid !== cid)
    );
  };

  public loadWhitelistJobs = async () => {
    const result = await SQL.query<Omit<Whitelist.Entry, 'name'>[]>(`SELECT * FROM whitelist_jobs`);
    for (const entry of result) {
      await this.registerPlayerWhitelist(entry);
    }
    this.jobs.forEach((entries, job) => {
      this.logger.debug(`Loaded ${entries.length} whitelist entries for job ${job}`);
    });
  };

  // Ensure config has been loaded before calling
  public loadWhitelistConfig = () => {
    const data = Config.getConfigValue<Record<string, Whitelist.Config>>('jobs.whitelist');

    this.config.clear();
    Object.keys(data).forEach(key => {
      const info: Whitelist.Info = {
        ...data[key],
        specialities: {},
      };
      data[key].specialities.forEach((spec, idx) => {
        info.specialities[spec] = 2 ** idx;
      });
      this.config.set(key, info);
    });
  };

  public getPlayerInfoForJob = (cid: number, job: string) => {
    const entries = this.jobs.get(job);
    if (!entries) return;
    return entries.find(entry => entry.cid === cid);
  };

  public getWhitelistedJobsForPlayer = (src: number): string[] => {
    const whitelistedJobs: string[] = [];
    const cid = Util.getCID(src, true);
    if (!cid) return [];
    for (const [jobName, players] of this.jobs) {
      if (players.find(player => player.cid === cid) === undefined) continue;
      whitelistedJobs.push(jobName);
    }
    return whitelistedJobs;
  };

  @Export('hasSpeciality')
  @RPCEvent('jobs:server:hasSpeciality')
  public hasSpeciality = (src: number, speciality: string, job?: string): boolean => {
    if (!job) {
      // Get job player is currently signed in to
      job = signedInManager.getPlayerJob(src);
    }
    if (!job) return false;
    const config = this.config.get(job);
    if (!config) return false;
    const cid = Util.getCID(src);
    if (!cid) return false;
    const entry = this.getPlayerInfoForJob(cid, job);
    if (!entry) return false;
    const specBit = config.specialities[speciality] ?? -1;
    const hasSpeciality = (entry.speciality & specBit) === specBit;
    this.logger.debug(`Player ${src} has speciality ${speciality} for job ${job}: ${hasSpeciality}`);
    return hasSpeciality;
  };

  // Filter is rank or speciality seperated by a dot comma.
  @DGXEvent('jobs:whitelist:server:openJobAllowlist')
  public openAllowListMenu = (src: number, filter?: string) => {
    // Get job player is currently signed in to
    const job = signedInManager.getPlayerJob(src);
    if (!job) {
      Notifications.add(src, 'Je bent niet in dienst voor een whitelisted job', 'error');
      return;
    }

    if (!this.hasSpeciality(src, 'HC', job)) {
      Notifications.add(src, 'Je hebt hier geen toegang tot', 'error');
      return;
    }

    this.logger.debug(`${src} requested whitelist menu for job ${job} (${filter})`);
    const allowListMenu: ContextMenu.Entry[] = [];
    const config = this.config.get(job);
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
      submenu: config.grades.concat(Object.keys(config.specialities)).map(spec => ({
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
    const entries = this.jobs.get(job);
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
        if (config.specialities[filter]) {
          return (entry.speciality & config.specialities[filter]) !== 0;
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
        description: `rank: ${config.grades[entry.rank]} | speciality: ${Object.keys(config.specialities)
          .filter(spec => (entry.speciality & config.specialities[spec]) !== 0)
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
            title: 'Specialities',
            disabled: true,
          },
          ...Object.keys(config.specialities).map<ContextMenu.Entry>((spec, idx) => ({
            title: spec,
            data: {
              cid: entry.cid,
              spec,
              type: (entry.speciality & config.specialities[spec]) !== 0 ? 'remove' : 'add',
            },
            icon: (entry.speciality & config.specialities[spec]) !== 0 ? 'circle-check' : undefined,
            callbackURL: 'jobs:whitelist:toggleSpeciality',
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

  @DGXEvent('jobs:whitelist:hire')
  private _hirePlayer = (src: number, job: string, target: number) => {
    this.addWhitelist(src, job, 0, target);
  };

  @Export('addWhitelist')
  public addWhitelist = async (src: number, jobName: string, rank = 1, cid?: number) => {
    cid = cid ?? Util.getCID(src);
    if (!cid) return;
    const job = this.getPlayerInfoForJob(cid, jobName);
    if (job) {
      Notifications.add(src, `Burger ${cid} heeft de job ${jobName} al`, 'error');
      return;
    }
    const jobConfig = this.config.get(jobName);
    if (!jobConfig) return;
    if (rank > jobConfig.grades.length) {
      Notifications.add(src, `rank ${rank} does not exist on job ${jobConfig.name}`, 'error');
      return;
    }
    const jobWhitelistEntry = { cid, job: jobName, rank, speciality: 0 };
    await SQL.insertValues('whitelist_jobs', [jobWhitelistEntry]);
    await this.registerPlayerWhitelist(jobWhitelistEntry);
    this.logger.debug(`Added whitelist entry for ${cid} as ${jobName} with rank: ${rank}`);
    Util.Log('jobs:whitelist:add', { rank, job: jobName, cid }, `Whitelisted ${cid} for ${job} with rank ${rank}`, src);
    Events.emitNet('jobs:whitelists:update', src, jobName, 'add');
    if (jobConfig.bankAccount) {
      const success = Financials.setPermissions(jobConfig.bankAccount, cid, {
        deposit: true,
        transfer: true,
        withdraw: true,
        transactions: true,
      });
      if (!success) {
        this.logger.error(`Failed to set bank permissions for ${cid} after retrieving HC role`);
        Notifications.add(src, `Failed to give new member bank permissions: ${cid}, Maak een ticket aan in discord!`)
      }
    }
  };

  @DGXEvent('jobs:whitelist:fire')
  private _firePlayer = (src: number, job: string, target: number) => {
    this.removeWhitelist(src, job, target);
  };

  @Export('removeWhitelist')
  public removeWhitelist = async (src: number, jobName: string, cid?: number) => {
    cid = cid ?? Util.getCID(src);
    if (!cid) return;
    const job = this.getPlayerInfoForJob(cid, jobName);
    if (!job) return;
    const result = await SQL.query('DELETE FROM whitelist_jobs WHERE cid = ? AND job = ?', [cid, jobName]);
    if (result.affectedRows < 1) {
      Notifications.add(
        src,
        `Er is iets misgelopen bij het verwijderen van de whitelist voor ${cid} bij ${jobName}`,
        'error'
      );
      this.logger.error(`Failed to remove whitelist entry for ${cid} at ${jobName}`, cid, jobName);
      return;
    }
    this.unregisterPlayerWhitelist(jobName, cid);
    this.logger.debug(`Removed whitelist entry for ${cid} as ${jobName}`);
    Util.Log('jobs:whitelist:removed', { job: jobName }, `Removed whitelist for ${cid} at ${job}`, src);
    Events.emitNet('jobs:whitelists:update', src, jobName, 'remove');
  };

  @DGXEvent('jobs:whitelist:server:assignRank')
  private _assignRank = async (src: number, target: number, rank: number) => {
    if (!this.hasSpeciality(src, 'HC')) {
      Util.Log(
        'jobs:whitelist:assignRank:failed',
        {
          target,
          rank,
        },
        `${src} does not have HC speciality`,
        src
      );
      this.logger.info(
        `${Util.getName(
          src
        )} tried to assign rank ${rank} to ${target} but failed because they do not have HC speciality`
      );
      return;
    }

    const job = signedInManager.getPlayerJob(src);
    if (!job) return;
    const entries = this.jobs.get(job);
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
    const jobConfig = this.config.get(job);
    if (!jobConfig) return;
    const entry = entries.find(entry => entry.cid === target);
    if (!entry) return;
    const cid = Util.getCID(src);
    if (!cid) return;

    entry.rank = rank;
    await SQL.query(
      `UPDATE whitelist_jobs
     SET rank = ?
     WHERE cid = ?`,
      [rank, target]
    );
    this.logger.debug(`${src} assigned rank ${rank} to ${target} for job ${job}`);
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

  @DGXEvent('jobs:whitelist:toggleSpeciality')
  private _toggleSpeciality = async (src: number, target: number, speciality: string, type: 'add' | 'remove') => {
    if (!this.hasSpeciality(src, 'HC')) {
      Util.Log(
        'jobs:whitelist:assignSpeciality:failed',
        {
          target,
          speciality,
          type,
        },
        `${src} does not have HC speciality to toggle speciality`,
        src
      );
      this.logger.info(
        `${Util.getName(
          src
        )} tried to ${type} ${speciality} to ${target} but failed because they do not have HC speciality`
      );
      return;
    }

    const job = signedInManager.getPlayerJob(src);
    if (!job) return;
    const entries = this.jobs.get(job);
    if (!entries) {
      Util.Log(
        'jobs:whitelist:toggleSpeciality:failed',
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
    const jobConfig = this.config.get(job);
    if (!jobConfig) return;
    const entry = entries.find(entry => entry.cid === target);
    if (!entry) return;
    const cid = Util.getCID(src);
    if (!cid) return;
    const originEntry = this.getPlayerInfoForJob(cid, job);
    if (!originEntry) return;
    if (originEntry.rank < entry.rank) {
      Util.Log(
        'jobs:whitelist:toggleSpeciality:failed',
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
      entry.speciality |= jobConfig.specialities[speciality];
    } else {
      entry.speciality &= ~jobConfig.specialities[speciality];
    }
    await SQL.query(
      `UPDATE whitelist_jobs
     SET speciality = ?
     WHERE cid = ?`,
      [entry.speciality, target]
    );
    this.logger.debug(`${src} ${type}d speciality ${speciality} to ${target} for job ${job}`);
    Util.Log(
      'jobs:whitelist:toggleSpeciality:success',
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

  // See this as a check if a player can sign in to this job
  @Export('isWhitelisted')
  private _isWhitelisted = (plyId: number, job: string) => {
    const cid = Util.getCID(plyId);
    if (!cid) return false;
    return !!this.getPlayerInfoForJob(cid, job);
  };

  @Export('isCidWhitelisted')
  private _isCidWhitelisted = (cid: number, job: string) => {
    return !!this.getPlayerInfoForJob(cid, job);
  };

  @AsyncExport('isSteamIdWhitelisted')
  private _isSteamIdWhitelisted = async (steamId: string, job: string) => {
    const cids = await DGCore.Functions.GetCidsForSteamId(steamId);
    return cids.some(cid => !!this.getPlayerInfoForJob(cid, job));
  };

  @Export('getCurrentGrade')
  private _getCurrentGrade = (src: number) => {
    const job = signedInManager.getPlayerJob(src);
    if (!job) return 0;
    const cid = Util.getCID(src, true);
    if (!cid) return 0;
    const info = this.getPlayerInfoForJob(cid, job);
    if (!info) return 0;
    return info.rank;
  };

  @DGXEvent('jobs:whitelists:requestSeeding')
  public seedPlyUIStore = (plyId: number) => {
    const whitelistedJobs = this.getWhitelistedJobsForPlayer(plyId);
    Events.emitNet('jobs:whitelists:seed', plyId, whitelistedJobs);
  };
}

const whitelistManager = WhitelistManager.getInstance();
export default whitelistManager;