import { Events, Inventory, Util } from '@dgx/server';
import { Export, ExportRegister, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import groupManager from '../modules/groups/classes/GroupManager';

@ExportRegister()
@RPCRegister()
class JobManager extends Util.Singleton<JobManager>() {
  /**
   * Map of jobs on job name
   */
  private jobs: Map<string, Jobs.Job>;
  private jobsToResource: Map<string, string>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.jobs = new Map();
    this.jobsToResource = new Map();
    this.logger = mainLogger.child({ module: 'JobManager' });
    this.updatePayoutLevels();

    on('onResourceStop', (resource: string) => {
      const jobs = [...this.jobsToResource.entries()].filter(([, res]) => res === resource);
      if (jobs.length === 0) return;
      jobs.forEach(([job, _]) => {
        groupManager.getGroups().forEach(g => {
          if (g.getCurrentJob() === job) {
            g.setActiveJob(null);
          }
        });
      });
    });
  }

  private generateJobPayoutLevel() {
    const amountOfJobsWithMaxPayout = Array.from(this.jobs.values()).reduce(
      (amount, job) => amount + (job.payoutLevel === 6 ? 1 : 0),
      0
    );
    const limitOfJobsWithMaxPayout = Math.ceil(this.jobs.size / 6) + 1;
    const maxAllowedPayoutLevel = limitOfJobsWithMaxPayout <= amountOfJobsWithMaxPayout ? 6 : 7;
    return Util.getRndInteger(1, maxAllowedPayoutLevel);
  }

  private updatePayoutLevels() {
    for (const [jobName, job] of this.jobs.entries()) {
      // Amount of maxPayout gets checked inside gen func, this ensured job cannot be maxPayout twice
      job.payoutLevel = this.generateJobPayoutLevel();
      this.jobs.set(jobName, job);
    }
    Util.Log(
      'jobs:jobmanager:payout:update',
      {
        levels: [...this.jobs.values()].map(j => ({
          name: j.name,
          level: j.payoutLevel,
        })),
      },
      'Updated payout levels'
    );

    // Update payout levels in 60-90 mins
    const timeout = Util.getRndInteger(60, 91);
    setTimeout(() => {
      this.updatePayoutLevels();
    }, timeout * 60 * 1000);
  }

  public getJobByName(job: string) {
    return this.jobs.get(job);
  }

  @RPCEvent('dg-jobs:server:jobs:get')
  public async getJobsForClients(src: number) {
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) return [];
    const hasVPN = await Inventory.doesPlayerHaveItems(src, 'vpn');
    return Array.from(this.jobs.values())
      .filter(j => j.legal || hasVPN)
      .map(j => ({
        name: j.name,
        title: j.title,
        level: j.payoutLevel,
        legal: j.legal,
        icon: j.icon,
      }));
  }

  @RPCEvent('dg-jobs:server:jobs:waypoint')
  private _setJobWaypoint(src: number, jobName: string) {
    const jobObj = this.jobs.get(jobName);
    if (!jobObj) {
      this.logger.warn(`${GetPlayerName(String(src))}(${src}) tried to set waypoint for non-existing job ${jobName}`);
      Util.Log(
        'jobs:jobmanager:waypoint:set:invalid',
        {
          jobName,
        },
        `${GetPlayerName(String(src))}(${src}) tried to set waypoint for non-existing job ${jobName}`,
        src
      );
      // TODO: ban mfker from server
      return;
    }
    if (!jobObj.legal) {
      this.logger.warn(`${GetPlayerName(String(src))}(${src}) tried to set waypoint for an illegal job ${jobName}`);
      Util.Log(
        'jobs:jobmanager:waypoint:set:illegal',
        {
          jobName,
        },
        `${GetPlayerName(String(src))}(${src}) tried to set waypoint for a illegal job ${jobName}`,
        src
      );
      // TODO: ban mfker from server
      return;
    }
    Events.emitNet('dg-jobs:client:jobs:waypoint', src, jobObj.location);
    return true;
  }

  @Export('getJobPayout')
  private _getJobPayout(jobName: string, groupSize: number) {
    const job = this.jobs.get(jobName);
    if (!job) {
      this.logger.error('Tried to get payout for nonexistent job');
      return null;
    }
    if (!job.payout) {
      this.logger.error('Tried to get payout but job did not have payout amounts registered');
      return null;
    }
    // Generate value between min and max based on payoutLevel (lvl 1 = minprice, level 6 (max) = maxprice)
    // Then add percentage based on amount of groupmembers
    return Math.round(
      (job.payout.min + ((job.payout.max - job.payout.min) * (job.payoutLevel - 1)) / 5) *
        (1 + (job.payout.groupPercent / 100) * (groupSize - 1))
    );
  }

  @Export('getJobPayoutLevel')
  private _getJobPayoutLevel(jobName: string) {
    const job = this.jobs.get(jobName);
    if (!job) {
      this.logger.error('Tried to get payout level for nonexistent job');
      return null;
    }
    return job.payoutLevel;
  }

  @Export('registerJob')
  private _registerJob(name: string, info: Omit<Jobs.Job, 'name' | 'payoutLevel'>) {
    if (this.jobs.has(name)) {
      this.logger.warn(`${name} job already existed, overwriting....`);
    } else {
      this.logger.info(`Registered ${name} job`);
    }
    this.jobs.set(name, {
      ...info,
      name,
      payoutLevel: this.generateJobPayoutLevel(),
    });
    this.jobsToResource.set(name, GetInvokingResource());
  }
}

const jobManager = JobManager.getInstance();
export default jobManager;
