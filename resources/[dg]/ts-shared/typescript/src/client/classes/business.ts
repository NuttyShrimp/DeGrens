import { Peek, PolyZone } from './index';

class Business {
  /**
   * Returns whether or not player is employee for business and has the required perms
   * @param businessName Business Name
   * @param requiredPermissions Permissions to check, undefined if function should be true for every employee
   */
  isEmployee = (businessName: string, requiredPermissions?: string[]): boolean => {
    return global.exports['dg-business'].isEmployee(businessName, requiredPermissions);
  };

  public isSignedIn = (businessName: string): boolean => {
    return global.exports['dg-business'].isSignedInAtBusiness(businessName);
  };

  public isSignedInAtAnyOfType = (businessType: string): boolean => {
    return global.exports['dg-business'].isSignedInAtAnyOfBusinessType(businessType);
  };

  public getBusinessPlayerIsInsideOf = (): { name: string; type: string } | null => {
    return global.exports['dg-business'].getBusinessPlayerIsInsideOf();
  };

  public isInside = (businessName: string): boolean => {
    const inside = this.getBusinessPlayerIsInsideOf();
    if (inside === null) return false;
    return inside.name === businessName;
  };

  // Wrapper function so you dont need to lookup zone name in the future
  public addPeekEntriesToBusinessTypeManagementZone = (businessType: string, peekParams: PeekParams) => {
    Peek.addZoneEntry('business_management', {
      options: peekParams.options.map(option => ({
        ...option,
        canInteract: (ent, dist, o) => {
          if (o.data.businessType !== businessType) return false;
          if (!option.canInteract) return true;
          return option.canInteract(ent, dist, o);
        },
      })),
      distance: peekParams.distance,
    });
  };

  public onSignIn = (
    cb: (businessName: string, businessType: string) => void,
    filter?: {
      businessName?: string;
      businessType?: string;
    }
  ) => {
    on('business:signedIn', ((name, type) => {
      if (filter?.businessName && name !== filter.businessName) return;
      if (filter?.businessType && type !== filter.businessType) return;
      cb(name, type);
    }) satisfies typeof cb);
  };

  public onSignOut = (
    cb: (businessName: string, businessType: string) => void,
    filter?: {
      businessName?: string;
      businessType?: string;
    }
  ) => {
    on('business:signedOut', ((name, type) => {
      if (filter?.businessName && name !== filter.businessName) return;
      if (filter?.businessType && type !== filter.businessType) return;
      cb(name, type);
    }) satisfies typeof cb);
  };

  // Wrapper function so you dont need to lookup zone name in the future
  public onEnterBusinessZone = (
    cb: (businessName: string, businessType: string) => void,
    filter?: {
      businessName?: string;
      businessType?: string;
    }
  ) => {
    PolyZone.onEnter<{ id: string; businessType: string }>('business', (_, data) => {
      if (filter?.businessName && data.id !== filter.businessName) return;
      if (filter?.businessType && data.businessType !== filter.businessType) return;
      cb(data.id, data.businessType);
    });
  };

  // Wrapper function so you dont need to lookup zone name in the future
  public onLeaveBusinessZone = (
    cb: (businessName: string, businessType: string) => void,
    filter?: {
      businessName?: string;
      businessType?: string;
    }
  ) => {
    PolyZone.onLeave<{ id: string; businessType: string }>('business', (_, data) => {
      if (filter?.businessName && data.id !== filter.businessName) return;
      if (filter?.businessType && data.businessType !== filter.businessType) return;
      cb(data.id, data.businessType);
    });
  };
}

export default {
  Business: new Business(),
};
