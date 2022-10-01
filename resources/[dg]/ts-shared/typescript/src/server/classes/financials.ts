const fexp = global.exports['dg-financials'];

class Financials {
  awaitAccountsLoaded(): Promise<void> {
    return fexp.awaitAccountsLoaded();
  }

  // Returns accountId after creation
  createAccount(cid: number, name: string, accType: IFinancials.AccountType = 'standard'): Promise<string> {
    return fexp.createAccount(cid, name, accType);
  }

  getDefaultAccount(cid: number): Promise<IFinancials.Account> {
    return fexp.getDefaultAccount(cid);
  }

  getDefaultAccountId(cid: number): Promise<string> {
    return fexp.getDefaultAccountId(cid);
  }

  getAccountBalance(accId: string): number {
    return fexp.getAccountBalance(accId);
  }

  // Can be ALOT of data!
  getAllAccounts(): IFinancials.Account[] {
    return fexp.getAllAccounts();
  }

  setPermissions(accountId: string, cid: number, permissions: IFinancials.Permissions): Promise<void> {
    return fexp.setPermissions(accountId, cid, permissions);
  }

  removePermissions(accountId: string, cid: number): Promise<boolean> {
    return fexp.removePermissions(accountId, cid);
  }

  getPermissions(accountId: string, cid: number): IFinancials.Permissions {
    return fexp.getPermissions(accountId, cid);
  }

  deposit(accountId: string, triggerCid: number, amount: number, comment?: string): Promise<void> {
    return fexp.deposit(accountId, triggerCid, amount, comment);
  }

  withdraw(accountId: string, triggerCid: number, amount: number, comment?: string): Promise<void> {
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
    return fexp.cryptoRemove(src, coin);
  }

  giveFine(
    cid: number,
    target_account: string,
    fine: number,
    reason: string,
    origin_name: string,
    given_by?: number
  ): Promise<void> {
    return fexp.giveFine(cid, target_account, fine, reason, origin_name, given_by);
  }

  removeMaintenanceFees(src: number): Promise<void> {
    return fexp.removeMaintenanceFees(src);
  }

  registerPaycheck(src: number, amount: number, job: string, comment?: string): void {
    return fexp.registerPaycheck(src, amount, job, comment);
  }

  getTaxedPrice(
    price: number,
    taxId: number,
    shouldRemove: boolean
  ): {
    taxPrice: number;
    taxRate: number;
  } {
    return fexp.getTaxedPrice(price, taxId, shouldRemove);
  }
}

export default {
  Financials: new Financials(),
};