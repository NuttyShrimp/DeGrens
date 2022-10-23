class Jobs {
  getCurrentJob(): { name: string | null; rank: number | null } {
    return global.exports['dg-jobs'].getCurrentJob();
  }
}

class Business {
  /**
   * Returns wether or not player is employee for business and has the required perms
   * @param businessName Business Name
   * @param requiredPermissions Permissions to check, undefined if function should be true for every employee
   */
  isEmployee = (businessName: string, requiredPermissions?: string[]): boolean => {
    return global.exports['dg-business'].isEmployee(businessName, requiredPermissions);
  };
}

class Gangs {
  public getCurrentGang = (): string | null => {
    return global.exports['dg-gangs'].getCurrentGang();
  };
}

export default {
  Jobs: new Jobs(),
  Business: new Business(),
  Gangs: new Gangs(),
};
