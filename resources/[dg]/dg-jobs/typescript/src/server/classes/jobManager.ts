import { Util } from '@dgx/server';
import { Export, ExportRegister, Callback, CallbackRegister } from '@dgx/server/decorators';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

@ExportRegister()
@CallbackRegister()
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
  /**
   *
   */
  private jobsWith6: number;
  private logger: winston.Logger;

  constructor() {
    this.jobs = new Map();
    this.logger = mainLogger.child({ module: 'JobManager' });
    if (JobManager.instance) {
      this.logger.error('Mulitple jobmanager created');
      throw new Error(`You can't create multiple instances of this class`);
    }
    this.jobsWith6 = 0;
  }

  private genJobPayoutLvl() {
    const limit = Math.ceil(this.jobs.size / 6) + 1;
    let newToken = Util.getRndInteger(1, 7);
    if (newToken == 6) {
      if (limit == this.jobsWith6) {
        while ((newToken = 6)) {
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
    this.schedulePayoutUpdate();
  }

  public getJobByName(job: string) {
    return this.jobs.get(job);
  }

  @Callback('dg-jobs:server:jobs:get')
  public getJobsForClients() {
    return Array.from(this.jobs.values()).map(j => ({
      name: j.name,
      title: j.title,
      level: j.payoutLevel,
      legal: j.legal,
      icon: j.icon,
    }));
  }

  @Callback('dg-jobs:server:jobs:waypoint')
  public setJobWaypoint(src: number, jobName: string) {
    if (!this.jobs.has(jobName)) {
      this.logger.warn(`${GetPlayerName(String(src))}(${src}) tried to set waypoint for non-existing job ${jobName}`);
      // TODO: log to graylog
      // TODO: ban mfker from server
      return;
    }
    const jobObj = this.jobs.get(jobName);
    if (!jobObj.legal) {
      this.logger.warn(`${GetPlayerName(String(src))}(${src}) tried to set waypoint for an illegal job ${jobName}`);
      // TODO: log to graylog
      // TODO: ban mfker from server
      return;
    }
    emitNet('dg-jobs:client:jobs:waypoint', src, jobObj.location);
  }

  @Export('getJobPayout')
  public getJobPayout(jobName: string, groupSize: number) {
    if (!this.jobs.has(jobName)) {
      return null;
    }
    const job = this.jobs.get(jobName);
    return job.payout.min * (job.payout.diff * job.payoutLevel) * (1 - ((job.payoutLevel * (groupSize - 1)) / 100));
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
  }
}

const jobManager = JobManager.getInstance();
export default jobManager;
