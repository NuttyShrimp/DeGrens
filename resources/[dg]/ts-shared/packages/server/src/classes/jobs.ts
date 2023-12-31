import { Core, Util, Jobs as JobsInstance } from './index';

class Jobs {
  onGroupLeave = (handler: (plyId: number | null, cid: number, groupId: string) => void) => {
    on('dg-jobs:server:groups:playerLeft', handler);
  };

  onGroupJoin = (handler: (plyId: number, cid: number, groupId: string) => void) => {
    on('dg-jobs:server:groups:playerJoined', handler);
  };

  // Handler function gets called when players signs in/out of a whitelisted job
  onJobUpdate = (handler: (plyId: number, job: string | null, rank: number | null) => void) => {
    on('jobs:server:signin:update', handler);
  };

  createGroup(src: number): boolean {
    return global.exports['dg-jobs'].createGroup(src);
  }

  getGroupById(groupId: string): Jobs.Groups.Group | undefined {
    return global.exports['dg-jobs'].getGroupById(groupId);
  }

  getGroupByServerId(id: number): Jobs.Groups.Group | undefined {
    return global.exports['dg-jobs'].getGroupByServerId(id);
  }

  getGroupByCid(cid: number): Jobs.Groups.Group | undefined {
    return global.exports['dg-jobs'].getGroupByCid(cid);
  }

  changeJob(groupId: string, job: string | null): boolean {
    return global.exports['dg-jobs'].changeJob(groupId, job);
  }

  changeJobOfPlayerGroup(plyId: number, job: string | null): boolean {
    return global.exports['dg-jobs'].changeJobOfPlayerGroup(plyId, job);
  }

  // Get current whitelisted job where player is on duty for
  getCurrentJob(src: number): string | null {
    return global.exports['dg-jobs'].getCurrentJob(src) ?? null;
  }

  getCurrentGrade(src: number): number {
    return global.exports['dg-jobs'].getCurrentGrade(src);
  }

  hasSpeciality(src: number, speciality: number): boolean {
    return global.exports['dg-jobs'].hasSpeciality(src, speciality);
  }

  isWhitelisted(src: number, job: string): boolean {
    return global.exports['dg-jobs'].isWhitelisted(src, job);
  }
  isUserWhitelisted(steamId: string, job: string): Promise<boolean> {
    return global.exports['dg-jobs'].isSteamIdWhitelisted(steamId, job);
  }
  isCidWhitelisted(cid: number, job: string): boolean {
    return global.exports['dg-jobs'].isCidWhitelisted(cid, job);
  }

  registerJob(name: string, jobInfo: Jobs.Job) {
    global.exports['dg-jobs'].registerJob(name, jobInfo);
  }

  leaveGroup(src: number) {
    return global.exports['dg-jobs'].leaveGroup(src);
  }

  disbandGroup(groupId: string) {
    global.exports['dg-jobs'].disbandGroup(groupId);
  }

  getPlayersForJob(job: string): number[] {
    return global.exports['dg-jobs'].getPlayersForJob(job);
  }

  getJobPayout(jobName: string, groupSize: number, payoutLevel?: number): number | null {
    return global.exports['dg-jobs'].getJobPayout(jobName, groupSize, payoutLevel);
  }

  getJobPayoutLevel(jobName: string): number | undefined {
    return global.exports['dg-jobs'].getJobPayoutLevel(jobName);
  }

  getAmountForJob(job: string): number {
    return this.getPlayersForJob(job).length;
  }

  signPlayerOutOfAnyJob(plyId: number) {
    global.exports['dg-jobs'].signPlayerOutOfAnyJob(plyId);
  }

  getPlayerAmountOfJobsFinishedMultiplier(cid: number): number {
    return global.exports['dg-jobs'].getPlayerAmountOfJobsFinishedMultiplier(cid);
  }
}

class Gangs {
  public getGangByName = (gangName: string): Promise<Gangs.Data | undefined> => {
    return global.exports['dg-gangs'].getGangByName(gangName);
  };

  public getPlayerGangName = (cid: number): string | undefined => {
    return global.exports['dg-gangs'].getPlayerGangName(cid);
  };

  public isPlayerInGang = (cid: number): boolean => {
    return !!this.getPlayerGangName(cid);
  };

  public addFeedMessage = (newMessage: Gangs.Feed.NewMessage) => {
    global.exports['dg-gangs'].addFeedMessage(newMessage);
  };

  public createGang = (name: string, label: string, ownerCid: number): Promise<boolean> => {
    return global.exports['dg-gangs'].createGang(name, label, ownerCid);
  };

  public removeGang = (name: string): Promise<boolean> => {
    return global.exports['dg-gangs'].removeGang(name);
  };

  public addMemberToGang = (triggerServerId: number, name: string, targetCid: number): Promise<boolean> => {
    return global.exports['dg-gangs'].addMemberToGang(triggerServerId, name, targetCid);
  };
}

class Police {
  public createDispatchCall(call: NPolice.DispatchCall): void {
    global.exports['dg-dispatch'].createDispatchCall('police', call);
  }

  public addTrackerToVehicle = (vehicle: number, delay: number): number => {
    return global.exports['dg-police'].addTrackerToVehicle(vehicle, delay);
  };

  public changeVehicleTrackerDelay = (trackerId: number, newDelay: number) => {
    global.exports['dg-police'].changeVehicleTrackerDelay(trackerId, newDelay);
  };

  public removeTrackerFromVehicle = (trackerId: number) => {
    global.exports['dg-police'].removeTrackerFromVehicle(trackerId);
  };

  public isTrackerActive = (trackerId: number): boolean => {
    return global.exports['dg-police'].isTrackerActive(trackerId);
  };

  public isCuffed = (plyId: number) => {
    return global.exports['dg-police'].isCuffed(plyId);
  };

  public addBulletCasings = (plyId: number, itemState: Inventory.ItemState, shotFirePositions: Vec3[]) => {
    global.exports['dg-police'].addBulletCasings(plyId, itemState, shotFirePositions);
  };

  public addBloodDrop = (plyId: number) => {
    global.exports['dg-police'].addBloodDrop(plyId);
  };

  public leavePrison = (plyId: number) => {
    global.exports['dg-police'].leavePrison(plyId);
  };

  public forceUncuff = (plyId: number): Promise<void> => {
    return global.exports['dg-police'].forceUncuff(plyId);
  };

  public cycleCuffs = (plyId: number) => {
    global.exports['dg-police'].cycleCuffs(plyId);
  };

  public forceStopInteractions = (plyId: number): Promise<void> => {
    return global.exports['dg-police'].forceStopInteractions(plyId);
  };

  public canDoActivity = (activity: string) => {
    return global.exports['dg-police'].canDoActivity(activity);
  };

  public getPlayerBeingCarried = (plyId: number): number | undefined => {
    return global.exports['dg-police'].getPlayerBeingCarried(plyId);
  };

  public getPlayerBeingEscorted = (plyId: number): number | undefined => {
    return global.exports['dg-police'].getPlayerBeingEscorted(plyId);
  };

  isPoliceVehicle = (entity: number): boolean => {
    return global.exports['dg-police'].isPoliceVehicle(entity);
  };

  isAnyPoliceInRange = (coords: Vec3, range: number): boolean => {
    const players = Util.getAllPlayers();
    for (const plyId of players) {
      const ped = GetPlayerPed(String(plyId));
      if (!DoesEntityExist(ped)) continue;
      const playerCoords = Util.getEntityCoords(ped);
      if (playerCoords.distance(coords) > range) continue;
      if (JobsInstance.getCurrentJob(plyId) === 'police') {
        return true;
      }
    }
    return false;
  };
}

class Hospital {
  public setNeed = (plyId: number, need: CharacterNeed, value: (old: number) => number) => {
    global.exports['dg-hospital'].setNeed(plyId, need, value);
  };

  public setArmor = (plyId: number, amount: number, itemName: string) => {
    global.exports['dg-hospital'].setArmor(plyId, amount, itemName);
  };

  public createDispatchCall(call: NPolice.DispatchCall): void {
    global.exports['dg-dispatch'].createDispatchCall('ambulance', call);
  }

  public revivePlayer = (plyId: number) => {
    global.exports['dg-hospital'].revivePlayer(plyId);
  };

  public isDown = (plyId: number) => {
    const player = Core.getPlayer(plyId);
    return player?.metadata?.downState !== 'alive' ?? false;
  };
}

class DutyTime {
  public addDutyTimeEntry = (cid: number, context: string, action: 'start' | 'stop'): void => {
    global.exports['dg-misc'].addDutyTimeEntry(cid, context, action);
  };

  public showDutyTimeList = (plyId: number, context: string): void => {
    global.exports['dg-misc'].showDutyTimeList(plyId, context);
  };

  public getDutyTime = (cid: number, context: string): Promise<string | undefined> => {
    return global.exports['dg-misc'].getDutyTime(cid, context);
  };
}

export default {
  Jobs: new Jobs(),
  Gangs: new Gangs(),
  Police: new Police(),
  Hospital: new Hospital(),
  DutyTime: new DutyTime(),
};
