import { Jobs as JobsClass } from './index';
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

class Business {
  getBusinessById(id: number): NBusiness.Business {
    return JSON.parse(JSON.stringify(global.exports['dg-business'].getBusinessById(id)));
  }

  getBusinessByName(name: string): NBusiness.Business | null {
    return JSON.parse(JSON.stringify(global.exports['dg-business'].getBusinessByName(name)));
  }

  getBusinessEmployees(name: string): NBusiness.Employee[] {
    return global.exports['dg-business'].getBusinessEmployees(name);
  }

  getBusinessOwner(name: string) {
    const employees = this.getBusinessEmployees(name);
    return employees.find(e => e.isOwner);
  }

  isPlyEmployed(name: string, cid: number): boolean {
    return !!global.exports['dg-business'].isPlyEmployed(name, cid);
  }

  // List with available permissions can be found in dg-config/configs/business.json
  hasPlyPermission(name: string, cid: number, permission: string): boolean {
    return !!global.exports['dg-business'].hasPlyPermission(name, cid, permission);
  }

  getPermissionsFromMask(mask: number): string[] {
    return global.exports['dg-business'].getPermissionsFromMask(mask);
  }

  onPlayerFired = (handler: (businessId: number, businessName: string, cid: number) => void) => {
    on('business:playerFired', handler);
  };
}

class Gangs {
  public getGangByName = (gangName: string): Promise<GangData | undefined> => {
    return global.exports['dg-gangs'].getGangByName(gangName);
  };

  public getPlayerGangName = (cid: number): string | undefined => {
    return global.exports['dg-gangs'].getPlayerGangName(cid);
  };
}

class Police {
  public createDispatchCall(call: NPolice.DispatchCall): void {
    global.exports['dg-dispatch'].createDispatchCall('police', call);
  }

  public addTrackerToVehicle = (vehicle: number, delay: number) => {
    global.exports['dg-police'].addTrackerToVehicle(vehicle, delay);
  };

  public removeTrackerFromVehicle = (vehicle: number) => {
    global.exports['dg-police'].removeTrackerFromVehicle(vehicle);
  };

  public showBadge = (plyId: number, type: BadgeType) => {
    global.exports['dg-police'].showBadge(plyId, type);
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
}

class Hospital {
  public setNeed = (plyId: number, need: CharacterNeed, value: (old: number) => number) => {
    global.exports['dg-hospital'].setNeed(plyId, need, value);
  };

  public setArmor = (plyId: number, armor: number) => {
    global.exports['dg-hospital'].setArmor(plyId, armor);
  };

  public createDispatchCall(call: NPolice.DispatchCall): void {
    global.exports['dg-dispatch'].createDispatchCall('ambulance', call);
  }

  public revivePlayer = (plyId: number) => {
    global.exports['dg-hospital'].revivePlayer(plyId);
  };

  public isDown = (plyId: number) => {
    const player = DGCore.Functions.GetPlayer(plyId);
    return player?.PlayerData?.metadata?.downState !== 'alive' ?? false;
  };
}

export default {
  Jobs: new Jobs(),
  Business: new Business(),
  Gangs: new Gangs(),
  Police: new Police(),
  Hospital: new Hospital(),
};
