import { Config, Notifications, Events, Util, UI, Core, DutyTime } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import whitelistManager from './whitelistmanager';
import { DGXEvent, EventListener, ExportDecorators, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { charModule } from 'helpers/core';

const { Export, ExportRegister } = ExportDecorators<'jobs'>();

@EventListener()
@ExportRegister()
@RPCRegister()
class SignedInManager extends Util.Singleton<SignedInManager>() {
  private loaded = false;
  private readonly locations: SignInLocation[];
  private readonly signedIn: Map<string, { cid: number; srvId: number }[]>;

  // Map gets filled with players who leave while signed in, to restore them when they log back in
  private readonly jobsToRestore: Map<number, string>;

  constructor() {
    super();
    this.locations = [];
    this.loaded = false;
    this.signedIn = new Map();
    this.jobsToRestore = new Map();

    Core.onPlayerLoaded(playerData => {
      const jobName = this.jobsToRestore.get(playerData.citizenid);
      if (!jobName) return;
      if (!playerData.serverId) return;
      this.signIn(playerData.serverId, jobName);
    });

    Core.onPlayerUnloaded((plyId, cid) => {
      const plyJob = this.getPlayerJob(plyId);
      if (!plyJob) return;
      this.signOut(plyId, plyJob);
      this.jobsToRestore.set(cid, plyJob);
    });
  }

  // Ensure config has been loaded before calling
  public loadLocations = () => {
    const cLocs = Config.getConfigValue<SignInLocation[]>('jobs.signin');
    cLocs.forEach((loc, idx) => {
      if (!loc.zone.data.data) {
        loc.zone.data.data = {};
      }
      loc.zone.data.data.id = idx;
      this.locations.push(loc);
    });
    this.loaded = true;
  };

  @DGXEvent('jobs:server:signIn:openDutyBoard')
  private _openSignInMenu = (src: number, locId: number) => {
    if ((locId ?? -1) < 0) return;

    const jobs = this.locations[locId]?.jobs;
    if (!jobs) return;

    const menu: ContextMenu.Entry[] = [];
    jobs.forEach(job => {
      const jobConfig = whitelistManager.config.get(job);
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

  @DGXEvent('jobs:server:signIn')
  private signIn = (src: number, job: string) => {
    const jobConfig = whitelistManager.config.get(job);
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
    const plyEntry = whitelistManager.getPlayerInfoForJob(cid, job);
    if (!plyEntry) {
      Util.Log(
        'jobs:whitelist:signin:notWhitelisted',
        { job },
        `Player ${cid} tried to sign in for job ${job} but is not whitelisted`,
        src
      );
      Notifications.add(src, 'Je hebt deze job niet', 'error');
      return;
    }

    const currentPlyJob = this.getPlayerJob(src);
    if (currentPlyJob === job) {
      Notifications.add(src, `Je bent al in dienst bij ${jobConfig.name}`);
      return;
    } else if (currentPlyJob !== undefined) {
      this.signOut(src, currentPlyJob);
    }

    let signedInJob = this.signedIn.get(job);
    if (!signedInJob) {
      signedInJob = [];
      this.signedIn.set(job, signedInJob);
    }

    signedInJob.push({ cid, srvId: src });
    Util.Log('jobs:whitelist:signin:success', { job }, `Player ${cid} signed in for job ${job}`, src);
    Notifications.add(src, `In dienst gegaan bij ${jobConfig.name}`);
    emitNet('jobs:client:signin:update', src, job, plyEntry.rank);
    emit('jobs:server:signin:update', src, job, plyEntry.rank);

    DutyTime.addDutyTimeEntry(cid, job, 'start');
  };

  @DGXEvent('jobs:server:signOut')
  private signOut = (src: number, job: string) => {
    const cid = Util.getCID(src);
    if (!cid) return;
    const jobConfig = whitelistManager.config.get(job);
    if (!jobConfig) return;

    const signedInJob = this.signedIn.get(job);
    const currentJob = this.getPlayerJob(src);
    if (!signedInJob || currentJob !== job) {
      Notifications.add(src, `Je bent niet in dienst bij ${jobConfig.name}`, 'error');
      return;
    }
    this.signedIn.set(
      job,
      signedInJob.filter(i => i.cid !== cid)
    );
    Util.Log('jobs:whitelist:signout:success', { job }, `Player ${cid} signed out for job ${jobConfig.name}`, src);
    Notifications.add(src, `Uit dienst gegaan bij ${jobConfig.name}`);
    emitNet('jobs:client:signin:update', src, null, null);
    emit('jobs:server:signin:update', src, null, null);

    DutyTime.addDutyTimeEntry(cid, job, 'stop');
  };

  // set off duty when ply is fired
  public handleWhitelistRemoved = (cid: number, jobName: string) => {
    const jobToRestore = this.jobsToRestore.get(cid);
    if (jobToRestore === jobName) {
      this.jobsToRestore.delete(cid);
    }

    const currentJob = this.getJobByCid(cid);
    if (!currentJob) return;

    const plyId = charModule.getServerIdFromCitizenId(cid);
    if (!plyId) return;

    this.signOut(plyId, jobName);
  };

  @Export('getCurrentJob')
  @RPCEvent('jobs:server:getCurrentJob')
  public getPlayerJob(src: number) {
    const cid = Util.getCID(src, true);
    if (!cid) return;
    return this.getJobByCid(cid);
  }

  private getJobByCid = (cid: number) => {
    for (const [job, signedInJob] of this.signedIn) {
      if (signedInJob.find(i => i.cid === cid)) {
        return job;
      }
    }
  };

  @Export('getPlayersForJob')
  public getPlayersForJob(job: string) {
    const activePlys = this.signedIn.get(job);
    if (!activePlys) return [];
    return activePlys.map(p => p.srvId);
  }

  public getAmountsForEachJob = () =>
    Array.from(this.signedIn.keys()).reduce<Record<string, number>>((acc, jobName) => {
      acc[jobName] = this.getPlayersForJob(jobName).length;
      return acc;
    }, {});

  public dispatchSignInLocations = async (plyId: number) => {
    await Util.awaitCondition(() => this.loaded);
    Events.emitNet('jobs:client:buildSignInLocations', plyId, this.locations);
  };

  @Export('signPlayerOutOfAnyJob')
  private _signPlayerOutOfAnyJob(plyId: number) {
    const job = this.getPlayerJob(plyId);
    if (!job) return;
    this.signOut(plyId, job);
  }

  public isPlayerBlockedFromJoiningGroup = (plyId: number) => {
    const job = this.getPlayerJob(plyId);
    if (!job) return false;
    return whitelistManager.isJobBlockedFromJoiningGroup(job);
  };
}

const signedInManager = SignedInManager.getInstance();
export default signedInManager;
