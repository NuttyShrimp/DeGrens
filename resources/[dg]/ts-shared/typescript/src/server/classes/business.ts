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

  //#region Signin
  public isPlayerSignedIn = (plyId: number, businessName: string): boolean => {
    return global.exports['dg-business'].isPlayerSignedInAtBusiness(plyId, businessName);
  };

  public isPlayerSignedInAtAnyOfType = (plyId: number, businessType: string): boolean => {
    return global.exports['dg-business'].isPlayerSignedInAtAnyOfBusinessType(plyId, businessType);
  };

  public getSignedInPlayers = (businessName: string): number[] => {
    return global.exports['dg-business'].getSignedInPlayersForBusiness(businessName);
  };

  public isAnyPlayerSignedIn = (businessName: string): boolean => {
    return this.getSignedInPlayers(businessName).length > 0;
  };

  public getSignedInPlayersForType = (businessType: string): number[] => {
    return global.exports['dg-business'].getSignedInPlayersForBusinessType(businessType);
  };

  public isAnyPlayerSignedInForType = (businessType: string): boolean => {
    return this.getSignedInPlayersForType(businessType).length > 0;
  };
  //#endregion

  //#region Inside
  public isPlayerInside = (plyId: number, businessName: string): boolean => {
    return global.exports['dg-business'].isPlayerInsideBusiness(plyId, businessName);
  };

  public getPlayersInside = (businessName: string): number[] => {
    return global.exports['dg-business'].getPlayersInsideBusiness(businessName);
  };

  public isAnyPlayerInside = (businessName: string): boolean => {
    return this.getPlayersInside(businessName).length > 0;
  };

  public getBusinessPlayerIsInsideOf = (plyId: number): { name: string; type: string } | undefined => {
    return global.exports['dg-business'].getBusinessPlayerIsInsideOf(plyId);
  };
  //#endregion

  public getItemPrice = (businessName: string, itemName: string): number | undefined => {
    return global.exports['dg-business'].getItemPrice(businessName, itemName);
  };
}

export default {
  Business: new Business(),
};
