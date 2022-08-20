import { Events, Inventory, Util } from '@dgx/server';
import { Export, ExportRegister, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import groupManager from '../modules/groups/classes/GroupManager';

@ExportRegister()
@RPCRegister()
class JobManager {
  private static instance: JobManager;

  public static getInstance(): JobManager {
    if (!this.instance) {
      this.instance = new JobManager();
    }
    return this.instance;
  }

  /**
   * Map of jobs on job name
   */
  private jobs: Map<string, Jobs.Job>;
  private jobsToResource: Map<string, string>;
  private jobsWith6: number;
  private logger: winston.Logger;

  constructor() {
    this.jobs = new Map();
    this.jobsToResource = new Map();
    this.logger = mainLogger.child({ module: 'JobManager' });
    if (JobManager.instance) {
      this.logger.error('Mulitple jobmanager created');
      throw new Error(`You can't create multiple instances of this class`);
    }
    this.jobsWith6 = 0;
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

  private genJobPayoutLvl() {
    const limit = Math.ceil(this.jobs.size / 6) + 1;
    let newToken = Util.getRndInteger(1, 7);
    if (newToken == 6) {
      if (limit == this.jobsWith6) {
        while (newToken === 6) {
          newToken = Util.getRndInteger(1, 7);
        }
      } else {
        this.jobsWith6++;
      }
    }
    return newToken;
  }

  /**
   * Schedules the update of payout amount between half an hour and an hour
   */
  private schedulePayoutUpdate() {
    setTimeout(() => {
      this.updatePayoutLevels();
    }, Util.getRndInteger(30, 61) * 60 * 1000);
  }

  private updatePayoutLevels() {
    // We can only have a maximum of ceil divisioned jobs by 6 that have a payoutlevel of 6
    for (const jobName of this.jobs.keys()) {
      const job = this.jobs.get(jobName);
      if (job.payoutLevel == 6) {
        this.jobsWith6--;
      }
      job.payoutLevel = this.genJobPayoutLvl();
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
    this.schedulePayoutUpdate();
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
  public setJobWaypoint(src: number, jobName: string) {
    if (!this.jobs.has(jobName)) {
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
    const jobObj = this.jobs.get(jobName);
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
  public getJobPayout(jobName: string, groupSize: number) {
    if (!this.jobs.has(jobName)) {
      return null;
    }
    const job = this.jobs.get(jobName);
    return (
      job.payout.min *
      (((job.payout.max - job.payout.min) / 6) * job.payoutLevel) *
      (1 - (job.payoutLevel * (groupSize - 1)) / 100)
    );
  }

  @Export('getJobPayoutLevel')
  public getJobPayoutLevel(job: string) {
    if (!this.jobs.has(job)) {
      return null;
    }
    return this.jobs.get(job).payoutLevel;
  }

  @Export('registerJob')
  public registerJob(name: string, info: Omit<Jobs.Job, 'name' | 'payoutLevel'>) {
    if (this.jobs.has(name)) {
      this.logger.warn(`${name} job already existed, overwriting....`);
    } else {
      this.logger.info(`Registered ${name} job`);
    }
    this.jobs.set(name, {
      ...info,
      name,
      payoutLevel: this.genJobPayoutLvl(),
    });
    this.jobsToResource.set(name, GetInvokingResource());
  }
}

const jobManager = JobManager.getInstance();
export default jobManager;
