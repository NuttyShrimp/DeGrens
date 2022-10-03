class Jobs {
  createGroup(src: number): boolean {
    return global.exports['dg-jobs'].createGroup(src);
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
}

class Business {
  getBusinessById(id: number): NBusiness.Business {
    return JSON.parse(JSON.stringify(global.exports['dg-business'].getBusinessById(id)))
  }
  getBusinessEmployees(id: number): NBusiness.Employee[] {
    return global.exports['dg-business'].getBusinessEmployees(id)
  }
  isPlyEmployed(id: number, cid: number): boolean {
    return !!global.exports['dg-business'].isPlyEmployed(id, cid);
  }
  // List with available permissions can be found in dg-config/configs/business.json
  hasPlyPermission(id: number, cid: number, permission: string): boolean {
    return !!global.exports['dg-business'].hasPlyPermission(id, cid, permission);
  }
  getPermissionsFromMask(mask: number): string[] {
    return global.exports['dg-business'].getPermissionsFromMask(mask)
  }
}

export default {
  Jobs: new Jobs(),
  Business: new Business()
};
