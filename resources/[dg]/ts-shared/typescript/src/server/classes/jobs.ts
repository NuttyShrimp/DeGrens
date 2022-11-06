type GroupLeaveHandler = (plyId: number | null, cid: number, groupId: string) => void;
type GroupJoinHandler = (plyId: number, cid: number, groupId: string) => void;

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

  changeGroupJob(src: number, job: string): Promise<boolean> {
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

  getJobPayout(jobName: string, groupSize: number): number | null {
    return global.exports['dg-jobs'].getJobPayout(jobName, groupSize);
  }

  getJobPayoutLevel(jobName: string): number | null {
    return global.exports['dg-jobs'].getJobPayoutLevel(jobName);
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

export default {
  Jobs: new Jobs(),
  Business: new Business(),
  Gangs: new Gangs(),
};
