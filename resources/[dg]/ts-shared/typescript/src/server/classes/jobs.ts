type GroupLeaveHandler = (plyId: number | null, cid: number, groupId: string) => void;
type GroupJoinHandler = (plyId: number, cid: number, groupId: string) => void;

import { Jobs as JobsClass } from './index';

class Jobs {
  private groupLeaveHandlers: Set<GroupLeaveHandler>;
  private groupJoinHandlers: Set<GroupJoinHandler>;

  constructor() {
    this.groupLeaveHandlers = new Set();
    this.groupJoinHandlers = new Set();

    on('dg-jobs:server:groups:playerLeft', (plyId: number | null, cid: number, groupId: string) => {
      this.groupLeaveHandlers.forEach(handler => handler(plyId, cid, groupId));
    });
    on('dg-jobs:server:groups:playerJoined', (plyId: number, cid: number, groupId: string) => {
      this.groupJoinHandlers.forEach(handler => handler(plyId, cid, groupId));
    });
  }

  onGroupLeave = (handler: GroupLeaveHandler) => {
    this.groupLeaveHandlers.add(handler);
  };

  onGroupJoin = (handler: GroupJoinHandler) => {
    this.groupJoinHandlers.add(handler);
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

  changeGroupJob(src: number, job: string | null): boolean {
    return global.exports['dg-jobs'].changeGroupJob(src, job);
  }

  // Get current whitelisted job where player is on duty for
  getCurrentJob(src: number): string | null {
    return global.exports['dg-jobs'].getCurrentJob(src);
  }

  getCurrentGrade(src: number): number {
    return global.exports['dg-jobs'].getCurrentGrade(src);
  }

  hasSpeciality(src: number, specialty: number): boolean {
    return global.exports['dg-jobs'].hasSpeciality(src, specialty);
  }

  isWhitelisted(src: number, job: string): boolean {
    return global.exports['dg-jobs'].isWhitelisted(src, job);
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

  getJobPayout(jobName: string, groupSize: number): number | null {
    return global.exports['dg-jobs'].getJobPayout(jobName, groupSize);
  }

  getJobPayoutLevel(jobName: string): number | null {
    return global.exports['dg-jobs'].getJobPayoutLevel(jobName);
  }

  getAmountForJob(job: string): number {
    return this.getPlayersForJob(job).length;
  }

  signPlayerOutOfAnyJob(plyId: number) {
    global.exports['dg-jobs'].signPlayerOutOfAnyJob(plyId);
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
}

class Gangs {
  public getGangByName = (gangName: string): Promise<GangData | undefined> => {
    return global.exports['dg-gangs'].getGangByName(gangName);
  };

  public getPlayerGang = (cid: number): Promise<GangData | undefined> => {
    return global.exports['dg-gangs'].getPlayerGang(cid);
  };
}

class Police {
  public createDispatchCall(call: NPolice.DispatchCall): void {
    global.exports['dg-dispatch'].createDispatchCall('police', call);
  }

  public addTrackerToVehicle = (vehicleNetId: number, delay: number) => {
    global.exports['dg-police'].addTrackerToVehicle(vehicleNetId, delay);
  };

  public removeTrackerFromVehicle = (vehicleNetId: number) => {
    global.exports['dg-police'].removeTrackerFromVehicle(vehicleNetId);
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

  public getRequirementForActivity = (activity: string) => {
    return global.exports['dg-police'].getRequirementForActivity(activity);
  };

  public enoughCopsForActivity = (activity: string) => {
    const amountOfCops = JobsClass.getAmountForJob('police');
    const requirement = this.getRequirementForActivity(activity);
    return amountOfCops >= requirement;
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
