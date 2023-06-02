const fexp = global.exports['dg-financials'];

enum TaxIds {
  None = 1,
  Vehicles,
  RealEstate,
  Income,
  Services,
  Goederen,
  Gas,
  MaintenanceFee,
}

class Financials {
  public awaitFinancialsLoaded(): Promise<void> {
    return fexp.awaitFinancialsLoaded();
  }

  // Returns accountId after creation
  createAccount(cid: number, name: string, accType: IFinancials.AccountType = 'standard'): Promise<string> {
    return fexp.createAccount(cid, name, accType);
  }

  getDefaultAccount(cid: number): IFinancials.Account | undefined {
    return fexp.getDefaultAccount(cid);
  }

  getDefaultAccountId(cid: number): string | undefined {
    return fexp.getDefaultAccountId(cid);
  }

  getAccountBalance(accId: string): number | undefined {
    return fexp.getAccountBalance(accId);
  }

  // Can be ALOT of data!
  getAllAccounts(): IFinancials.Account[] {
    return fexp.getAllAccounts();
  }

  setPermissions(accountId: string, cid: number, permissions: IFinancials.Permissions): boolean {
    return fexp.setPermissions(accountId, cid, permissions);
  }

  removePermissions(accountId: string, cid: number): boolean {
    return fexp.removePermissions(accountId, cid);
  }

  getPermissions(accountId: string, cid: number): IFinancials.Permissions {
    return fexp.getPermissions(accountId, cid);
  }

  buildPermissions(accessLevel: number): IFinancials.Permissions {
    return fexp.buildPermissions(accessLevel);
  }

  deposit(accountId: string, triggerCid: number, amount: number, comment?: string): Promise<boolean> {
    return fexp.deposit(accountId, triggerCid, amount, comment);
  }

  withdraw(accountId: string, triggerCid: number, amount: number, comment?: string): Promise<boolean> {
    return fexp.withdraw(accountId, triggerCid, amount, comment);
  }

  transfer(
    accountId: string,
    targetAccountId: string,
    triggerCid: number,
    acceptorCid: number,
    amount: number,
    comment?: string,
    taxId?: number
  ): Promise<boolean> {
    return fexp.transfer(accountId, targetAccountId, triggerCid, acceptorCid, amount, comment, taxId);
  }

  purchase(accountId: string, triggerCid: number, amount: number, comment?: string, taxId?: number): Promise<boolean> {
    return fexp.purchase(accountId, triggerCid, amount, comment, taxId);
  }

  paycheck(accountId: string, triggerCid: number, amount: number): Promise<boolean> {
    return fexp.paycheck(accountId, triggerCid, amount);
  }

  mobile_transaction(
    accountId: string,
    triggerCid: number,
    targetPhone: string,
    amount: number,
    comment?: string
  ): Promise<boolean> {
    return fexp.mobile_transaction(accountId, triggerCid, targetPhone, amount, comment);
  }

  getCash(src: number): number {
    return fexp.getCash(src);
  }

  removeCash(src: number, amount: number, reason: string): boolean {
    return fexp.removeCash(src, amount, reason);
  }

  addCash(src: number, amount: number, reason: string): boolean {
    return fexp.addCash(src, amount, reason);
  }

  cryptoBuy(src: number, coin: string, amount: number): Promise<boolean> {
    return fexp.cryptoBuy(src, coin, amount);
  }

  cryptoAdd(src: number, coin: string, amount: number, comment: string): Promise<boolean> {
    return fexp.cryptoAdd(src, coin, amount, comment);
  }

  cryptoRemove(src: number, coin: string, amount: number): Promise<boolean> {
    return fexp.cryptoRemove(src, coin, amount);
  }

  cryptoGet(src: number, coin: string): Promise<number> {
    return fexp.cryptoGet(src, coin);
  }

  /**
   * @param cbEvt This is triggered when a debt is defaulted. (NOT TRIGGERED WHEN JUST PAYING)
   * @param payTerm If you want to overwrite the time the user has to pay the fine
   **/
  giveFine(
    cid: number,
    target_account: string,
    fine: number,
    reason: string,
    origin_name: string,
    given_by?: number,
    cbEvt?: string,
    // This will prevent overdue being accounted on the fine and will set the exact date of expiration
    payTerm?: number
  ): void {
    fexp.giveFine(cid, target_account, fine, reason, origin_name, given_by, cbEvt, payTerm);
  }

  removeMaintenanceFees(src: number) {
    fexp.removeMaintenanceFees(src);
  }

  addAmountToPaycheck(plyId: number, amount: number, comment: string) {
    fexp.addAmountToPaycheck(plyId, amount, comment);
  }

  getTaxedPrice(
    price: number,
    taxId: number,
    shouldRemove?: boolean
  ): {
    taxPrice: number;
    taxRate: number;
  } {
    return fexp.getTaxedPrice(price, taxId, shouldRemove);
  }

  getTaxInfo = (taxId: number) => {
    return (fexp.getTaxInfo(taxId) ?? undefined) as
      | {
          category: string;
          rate: number;
        }
      | undefined;
  };
}

export default {
  Financials: new Financials(),
  TaxIds,
};
