import { Events } from './index';

class Jobs {
  getCurrentJob(): { name: string | null; rank: number | null } {
    return global.exports['dg-jobs'].getCurrentJob();
  }

  getAmountForJob(jobName: string): number {
    return global.exports['dg-jobs'].getAmountForJob(jobName);
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

class Police {
  public isAtLocker = (): boolean => {
    return global.exports['dg-police'].isAtLocker();
  };

  public pauseCuffAnimation = (pause: boolean) => {
    global.exports['dg-police'].pauseCuffAnimation(pause);
  };

  public isCuffed = (): boolean => {
    return global.exports['dg-police'].isCuffed();
  };

  public isEscorting = (): boolean => {
    return global.exports['dg-police'].isEscorting();
  };

  public getPlayerToRob = (): Promise<number | undefined> => {
    return global.exports['dg-police'].getPlayerToRob();
  };

  public getPlayerToEscort = (): Promise<number | undefined> => {
    return global.exports['dg-police'].getPlayerToEscort();
  };

  public isInPrison = () => {
    return global.exports['dg-police'].isInPrison();
  };

  public canDoActivity = (activity: string) => {
    return global.exports['dg-police'].canDoActivity(activity);
  };

  public addBloodDrop = () => {
    Events.emitNet('police:evidence:addBloodDrop');
  };

  public isPoliceVehicle = (vehicle: number) => {
    return global.exports['dg-police'].isPoliceVehicle(vehicle);
  };
}

class Hospital {
  public pauseDownAnimation = (pause: boolean) => {
    global.exports['dg-hospital'].pauseDownAnimation(pause);
  };

  public isDown = () => {
    return global.exports['dg-hospital'].isDown();
  };

  public setHealth = (health: number) => {
    global.exports['dg-hospital'].setHealth(health);
  };
}

export default {
  Jobs: new Jobs(),
  Business: new Business(),
  Gangs: new Gangs(),
  Police: new Police(),
  Hospital: new Hospital(),
};
